from typing import Optional, Union, Type, Dict, Tuple

from django.db.models import Q, Count, Case, When, Value
from drf_yasg.utils import swagger_serializer_method
from datetime import datetime, timedelta, timezone

from enumfields.drf import EnumSupportSerializerMixin, EnumField
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist

from apps.energy_dashboard.models import DashboardPing, DashboardType
from apps.energy_dashboard.serializers import DashboardPingSerializer
from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.serializers import EnergyMeterSerializer
from apps.energy_providers.models import Provider, EnergyProviderAccount
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_tariffs.serializers import CurrentLocationTariffsSerializer
from apps.historical_data.serializers import ResourceValueSerializer, BaseSerializer
from apps.historical_data.utils import aggregations
from apps.historical_data.utils.history_data_aggregation_mixin import ResourceHistoryMixin
from apps.locations.models import Location
from apps.locations.serializers import LocationSerializer
from apps.resources.models import Resource
from apps.resources.types import ResourceDataNotAvailable, Unit
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.types import SmartAppConnectivityStatus
from apps.smart_things_devices.types import DeviceStatus
from apps.smart_things_sensors.models import SmartThingsEnergyMeter
from apps.mug_service.models import Customer, Switch
from apps.mug_service.serializers import MugLocationSitesSerializer, MugMetersSerializer, MugSwitchesStatusSerializer
from apps.mug_service.constants import SwitchStatus
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from utilities.serializer_helpers import get_serializer_fields


class SchoolsMetricsHildebrandSerializer(serializers.Serializer):
    provider_exists = serializers.BooleanField()
    meters = EnergyMeterSerializer(many=True, allow_empty=True)


class SchoolsMetricsEnergyMetersConnectionSerializer(serializers.Serializer):
    total = serializers.IntegerField(min_value=0)
    online = serializers.IntegerField(min_value=0)
    not_online = serializers.ListField(allow_empty=True)


class SchoolsMetricsEnergyMetersSerializer(LocationSerializer):
    hildebrand = serializers.SerializerMethodField()
    energy_meters = serializers.SerializerMethodField()
    smart_things_energy_meters = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ('hildebrand', 'energy_meters', 'smart_things_energy_meters')

    @swagger_serializer_method(serializer_or_field=SchoolsMetricsHildebrandSerializer)
    def get_hildebrand(self, location: Location):
        fields = [
            'resource_ptr', 'name', 'meter_id', 'is_half_hour_meter',
            'minutes_delay', 'live_values_meter__pk', 'live_values_meter__meter_id', 'hh_values_meter'
        ]
        hildebrand_meters = EnergyMeter.objects.in_location(location) \
            .filter(provider_account__provider=Provider.HILDEBRAND) \
            .values(*fields)
        hildebrand_provider_exists = bool(EnergyProviderAccount.objects.in_location(location)
                                          .filter(provider=Provider.HILDEBRAND))

        serializer = SchoolsMetricsHildebrandSerializer(data=dict(
            provider_exists=hildebrand_provider_exists,
            meters=hildebrand_meters,
        ))

        return serializer.initial_data

    @swagger_serializer_method(serializer_or_field=SchoolsMetricsEnergyMetersConnectionSerializer)
    def get_energy_meters(self, location: Location):
        serializer = self._get_energy_meters_connection_serializer(location, EnergyMeter)
        return serializer.initial_data if serializer else None

    @swagger_serializer_method(serializer_or_field=SchoolsMetricsEnergyMetersConnectionSerializer)
    def get_smart_things_energy_meters(self, location: Location):
        serializer = self._get_energy_meters_connection_serializer(location, SmartThingsEnergyMeter)
        return serializer.initial_data if serializer else None

    @staticmethod
    def _get_energy_meters_connection_serializer(
            location: Location,
            meter_class: Union[Type[SmartThingsEnergyMeter], Type[EnergyMeter]],
    ) -> Optional[SchoolsMetricsEnergyMetersConnectionSerializer]:
        online_meters_info: Dict[Tuple[int, str], bool] = {
            (meter.id, meter.name): meter.connectivity_status == DeviceStatus.ONLINE
            for meter in meter_class.objects.in_location(location).filter(~Q(provider_account__provider=Provider.DUMMY))
        }

        if not online_meters_info:
            return None

        return SchoolsMetricsEnergyMetersConnectionSerializer(data=dict(
            total=len(online_meters_info),
            online=sum(online_meters_info.values()),
            not_online=[meter_name for (_, meter_name), status in online_meters_info.items() if not status]
        ))


class SchoolMetricsLiveAndTotalConsumptionSerializer(serializers.Serializer):
    live = serializers.SerializerMethodField(read_only=True)
    today = serializers.SerializerMethodField(read_only=True)
    yesterday = serializers.SerializerMethodField(read_only=True)

    class Meta:
        fields = '__all__'

    @staticmethod
    def total_usage_for_day(resources, day, timezone_offset):
        return aggregations.aggregate_to_one(
            resources=resources,
            unit=Unit.KILOWATT_HOUR,
            from_=day.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(minutes=timezone_offset),
            to=day.replace(hour=23, minute=59, second=59, microsecond=0) + timedelta(minutes=timezone_offset),
        )

    @swagger_serializer_method(serializer_or_field=ResourceValueSerializer)
    def get_live(self, resources):
        try:
            result = aggregations.aggregate_latest_value(
                resources=resources,
                unit=Unit.KILOWATT,
                duration=ResourceHistoryMixin.get_duration(resources)
            )

        except ResourceDataNotAvailable:
            return BaseSerializer({}).data

        return ResourceValueSerializer(result).data

    @swagger_serializer_method(serializer_or_field=ResourceValueSerializer)
    def get_today(self, resources):
        timezone_offset = self.context['timezone_offset']
        try:
            today = datetime.now()
            result = self.total_usage_for_day(resources, today, timezone_offset)

        except ResourceDataNotAvailable:
            return BaseSerializer({}).data

        return ResourceValueSerializer(result).data

    @swagger_serializer_method(serializer_or_field=ResourceValueSerializer)
    def get_yesterday(self, resources):
        timezone_offset = self.context['timezone_offset']
        try:
            yesterday = datetime.now(timezone.utc) - timedelta(days=1)
            result = self.total_usage_for_day(resources, yesterday, timezone_offset)

        except ResourceDataNotAvailable:
            return BaseSerializer({}).data

        return ResourceValueSerializer(result).data


class SchoolMetricsConsumptionDataSerializer(LocationSerializer):
    electricity = serializers.SerializerMethodField(read_only=True)
    gas = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Location
        fields = (
            'electricity',
            'gas',
        )

    @swagger_serializer_method(serializer_or_field=SchoolMetricsLiveAndTotalConsumptionSerializer)
    def get_electricity(self, location: Location):
        timezone_offset = int(self.context['timezone_offset'])
        return self._get_data_by_meter_type(location, MeterType.ELECTRICITY, timezone_offset)

    @swagger_serializer_method(serializer_or_field=SchoolMetricsLiveAndTotalConsumptionSerializer)
    def get_gas(self, location: Location):
        timezone_offset = int(self.context['timezone_offset'])
        return self._get_data_by_meter_type(location, MeterType.GAS, timezone_offset)

    @staticmethod
    def _get_data_by_meter_type(location: Location, meter_type: MeterType, timezone_offset: int):
        resources = Resource.get_location_energy_meters(location, meter_type)

        if not resources:
            return None

        serializer = SchoolMetricsLiveAndTotalConsumptionSerializer(
            resources,
            context={'timezone_offset': timezone_offset}
        )
        return serializer.data


class SmartThingsAppTokenSerializer(serializers.Serializer, EnumSupportSerializerMixin):
    app_id = serializers.PrimaryKeyRelatedField(queryset=SmartThingsApp.objects.all(), allow_null=True)
    status = EnumField(SmartAppConnectivityStatus)
    refresh_token_updated_at = serializers.DateTimeField(allow_null=True)


class SchoolsMetricsDevicesNumberSerializer(serializers.Serializer):
    online = serializers.IntegerField(min_value=0)
    offline = serializers.IntegerField(min_value=0)
    unknown = serializers.IntegerField(min_value=0)
    total = serializers.SerializerMethodField()

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField)
    def get_total(self, obj):
        return obj['online'] + obj['offline'] + obj['unknown']


class SchoolsMetricsBatteryHealthSerializer(serializers.Serializer):
    less_than_or_equal_10 = serializers.IntegerField(min_value=0)
    less_than_or_equal_25 = serializers.IntegerField(min_value=0)


class MUGDataSerialiser(serializers.Serializer):
    mug_customer_id = serializers.SerializerMethodField(read_only=True, allow_null=True)
    mug_sites = serializers.SerializerMethodField(read_only=True)
    mug_meters = serializers.SerializerMethodField(read_only=True)
    switches_per_status = serializers.SerializerMethodField(read_only=True)
    require_resource_linking = serializers.SerializerMethodField(read_only=True)

    @swagger_serializer_method(serializer_or_field=serializers.IntegerField(min_value=0))
    def get_mug_customer_id(self, location: Location):
        try:
            return Customer.objects.get(registration_request=location.registration_request).mug_customer_id
        except ObjectDoesNotExist:
            return None

    @swagger_serializer_method(serializer_or_field=MugLocationSitesSerializer(many=True))
    def get_mug_sites(self, location: Location):
        serializer = MugLocationSitesSerializer(location.with_sub_locations, many=True)
        return serializer.data

    @swagger_serializer_method(serializer_or_field=MugMetersSerializer(many=True))
    def get_mug_meters(self, location: Location):
        energy_meters_billing_info = EnergyMeterBillingInfo.objects.filter(location__in=location.with_sub_locations)
        serializer = MugMetersSerializer(energy_meters_billing_info, many=True)
        return serializer.data

    @swagger_serializer_method(serializer_or_field=MugSwitchesStatusSerializer)
    def get_switches_per_status(self, location: Location):
        switches = Switch.objects.filter(energy_meter_billing_info__location__in=location.with_sub_locations)\
            .aggregate(
                sent_to_mug=Count(Case(When(status=SwitchStatus.SENT_TO_MUG, then=Value(1)))),
                supplier_downloaded_contract=Count(Case(When(status=SwitchStatus.SUPPLIER_DOWNLOADED_CONTRACT, then=Value(1)))),
                switch_accepted=Count(Case(When(status=SwitchStatus.SWITCH_ACCEPTED, then=Value(1)))),
                live_switch_complete=Count(Case(When(status=SwitchStatus.LIVE_SWITCH_COMPLETE, then=Value(1)))),
                failed_contract=Count(Case(When(status=SwitchStatus.FAILED_CONTRACT, then=Value(1))))
            )

        serializer = MugSwitchesStatusSerializer(data=dict(
            sent_to_mug=switches['sent_to_mug'],
            supplier_downloaded_contract=switches['supplier_downloaded_contract'],
            switch_accepted=switches['switch_accepted'],
            live_switch_complete=switches['live_switch_complete'],
            failed_contract=switches['failed_contract']
        ))
        serializer.is_valid(raise_exception=True)
        return serializer.data

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField)
    def get_require_resource_linking(self, location: Location):
        energy_meters_billing_infos = EnergyMeterBillingInfo.objects.filter(
            location__in=Location.objects.in_location(location)
        )
        return any(energy_meter_billing_info.resource_id is None
                   for energy_meter_billing_info in energy_meters_billing_infos)


class SchoolsMetricsSerializer(LocationSerializer):
    smart_things_app_token = serializers.SerializerMethodField(read_only=True)
    tariffs = serializers.SerializerMethodField(read_only=True)
    consumption = serializers.SerializerMethodField(read_only=True)
    energy_meters = serializers.SerializerMethodField(read_only=True)
    mug_data = serializers.SerializerMethodField(read_only=True)
    last_dashboard_ping = serializers.SerializerMethodField(read_only=True)

    class Meta(LocationSerializer.Meta):
        model = Location
        fields = LocationSerializer.Meta.fields + get_serializer_fields(
            'smart_things_app_token',
            'tariffs',
            'consumption',
            'energy_meters',
            'mug_data',
            'last_dashboard_ping',
            model.is_test,
            model.pupils_count,
        )

    @staticmethod
    @swagger_serializer_method(serializer_or_field=SmartThingsAppTokenSerializer)
    def get_smart_things_app_token(location: Location):
        smart_app: SmartThingsApp = location.smart_things_apps.first()

        serializer = SmartThingsAppTokenSerializer(data=dict(
            app_id=smart_app.id if smart_app else None,
            status=smart_app.get_refresh_token_status() if smart_app else SmartAppConnectivityStatus.NO_SMART_APP,
            refresh_token_updated_at=smart_app.refresh_token_updated_at if smart_app else None,
        ))
        serializer.is_valid(raise_exception=True)
        return serializer.data

    @staticmethod
    @swagger_serializer_method(serializer_or_field=CurrentLocationTariffsSerializer)
    def get_tariffs(location: Location):
        serializer = CurrentLocationTariffsSerializer(location)
        return serializer.data

    @swagger_serializer_method(serializer_or_field=SchoolMetricsConsumptionDataSerializer)
    def get_consumption(self, location: Location):
        timezone_offset = self.context['request'].query_params.get('timezone_offset', None)
        serializer = SchoolMetricsConsumptionDataSerializer(location, context={'timezone_offset': timezone_offset})
        return serializer.data

    @staticmethod
    @swagger_serializer_method(serializer_or_field=SchoolsMetricsEnergyMetersSerializer)
    def get_energy_meters(location: Location):
        serializer = SchoolsMetricsEnergyMetersSerializer(location)
        return serializer.data

    @staticmethod
    @swagger_serializer_method(serializer_or_field=MUGDataSerialiser)
    def get_mug_data(location: Location):
        serializer = MUGDataSerialiser(location)
        return serializer.data

    @staticmethod
    @swagger_serializer_method(serializer_or_field=DashboardPingSerializer(many=True))
    def get_last_dashboard_ping(location: Location):
        serializer = DashboardPingSerializer(
            DashboardPing.get_dashboard_pings_in_location(location).filter(
                type__in=[DashboardType.DASHBOARD_V3, DashboardType.DASHBOARD_V3_LEGACY]
            ), many=True
        )
        return serializer.data
