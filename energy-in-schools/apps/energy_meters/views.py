import json
import logging

from operator import itemgetter
from typing import Optional
from safedelete.config import HARD_DELETE
from datetime import datetime, timedelta

from django.db.models import Q
from rest_framework import status
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.energy_providers.models import Provider, EnergyProviderAccount
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_tariffs.models import EnergyTariff, TariffType
from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.locations.models import Location
from apps.energy_meters.models import EnergyMeter, Type
from apps.energy_meters.serializers import EnergyMeterSerializer, serializer_set, common_serializer_set, \
    ExportDataQueryParamsSerializer, ManageHildebrandMeterSerializer
from apps.historical_data.utils.aggregation_params_manager import AggregationOption
from apps.historical_data.utils.energy_cost_calculation_utils import CostAggregationOption
from apps.historical_data.utils.history_data_aggregation_mixin import AggregateToOneValueAction, AlwaysOnAction, \
    HistoricalDataAction, LiveValueAction, ResourceHistoryFilterSet, ResourceHistoryMixin, PeriodicConsumptionAction,\
    HistoricalDataExportAction
from apps.locations.decorators import own_location_only
from apps.locations.filters import OwnLocationOnlyFilter
from apps.main.view_mixins import SoftDeleteCreateModelViewSetMixin
from apps.resources.types import Unit, ResourceChildType, TimeResolution
from apps.resources.models import Resource

logger = logging.getLogger(__name__)

class EnergyMeterViewSet(SoftDeleteCreateModelViewSetMixin, ModelViewSet):
    serializer_class = EnergyMeterSerializer

    @own_location_only
    def get_queryset(self):
        return EnergyMeter.objects.all()


class CommonEnergyMeterFilterSet(ResourceHistoryFilterSet):
    own_location_only = OwnLocationOnlyFilter()

    class Meta:
        model = Resource
        fields = (
            'own_location_only',
        )


class EnergyMeterHistoricalDataViewSet(ResourceHistoryMixin):
    """View for historical data for two types of energy meters: EnergyMeter and SmartThingsEnergyMeter"""
    filterset_class = CommonEnergyMeterFilterSet
    public_actions = ('live_value_multiple_resources',)

    @own_location_only
    def get_queryset(self):

        queryset = Resource.objects.filter(
            Q(child_type=ResourceChildType.ENERGY_METER) |
            Q(child_type=ResourceChildType.SMART_THINGS_ENERGY_METER)
        )

        if 'meter_type' in self.request.query_params:
            queryset = queryset.filter(
                Q(energy_meter__type=self.request.query_params['meter_type']) |
                Q(smart_things_sensor__smart_things_energy_meter__type=self.request.query_params['meter_type'])
            )
        return queryset

    @property
    def aggregation_option(self) -> Optional[AggregationOption]:
        if self.request.query_params.get('unit') == Unit.POUND_STERLING.value:
            if not self.detail and (
                (
                    hasattr(self.request.user, 'is_staff')
                    and self.request.user.is_staff
                    and self.request.query_params.get('location_uid')
                ) or (
                    hasattr(self.request.user, 'location')
                    and self.request.query_params.get('location_uid') == self.request.user.location.uid
                ) or self.request.path.endswith('aggregated-consumption/total/')
            ):
                return CostAggregationOption.FULL_COST

            else:
                return CostAggregationOption.WATT_HOUR_COST

    always_on_single_resource = AlwaysOnAction(
        detail=True,
        url_path='consumption/always-on',
        query_serializer_class=common_serializer_set.always_on
    )

    aggregate_to_one_multiple_resources = AggregateToOneValueAction(
        detail=False,
        url_path='aggregated-consumption/total',
        query_serializer_class=common_serializer_set.total
    )
    always_on_multiple_resources = AlwaysOnAction(
        detail=False,
        url_path='aggregated-consumption/always-on',
        query_serializer_class=common_serializer_set.always_on
    )
    live_value_multiple_resources = LiveValueAction(
        detail=False,
        url_path='aggregated-consumption/live',
        query_serializer_class=common_serializer_set.live
    )
    historical_values_multiple_resources = HistoricalDataAction(
        detail=False,
        url_path='aggregated-consumption/historical',
        query_serializer_class=common_serializer_set.sequence
    )
    export_historical_values_multiple_resources = HistoricalDataExportAction(
        detail=False,
        url_path='aggregated-consumption/historical/export',
        query_serializer_class=ExportDataQueryParamsSerializer
    )
    periodic_consumption = PeriodicConsumptionAction(
        detail=True,
        url_path='periodic-consumption',
        query_serializer_class=serializer_set.periodic
    )

    live_value_single_resource = LiveValueAction(
        detail=True,
        url_path='consumption/live',
        query_serializer_class=serializer_set.live
    )
    historical_values_single_resource = HistoricalDataAction(
        detail=True,
        url_path='consumption/historical',
        query_serializer_class=serializer_set.sequence
    )
    aggregate_to_one_single_resource = AggregateToOneValueAction(
        detail=True,
        url_path='consumption/total',
        query_serializer_class=serializer_set.total
    )


class ManageHildebrandMetersViewSet(ViewSet):
    permission_classes = [AllowAny]

    @staticmethod
    def check_permission(request):
        if not request.user.is_superuser:
            return Response({
                'status': 'Forbidden request',
                'message': 'You are not allowed to perform this operation'
            }, status=status.HTTP_403_FORBIDDEN)

    @staticmethod
    def create_meter(school, provider, meter_id, is_half_hour_meter, name, standalone_meter=True):
        return EnergyMeter(
            sub_location=school,
            provider_account=provider,
            meter_id=meter_id,
            minutes_delay=None if is_half_hour_meter else 0,
            name=name if standalone_meter or is_half_hour_meter else f'{name} (LIVE)',
            type=MeterType.ELECTRICITY,
            description=f'hildebrand {"" if is_half_hour_meter else "live"} meter',
            is_half_hour_meter=is_half_hour_meter
        )

    @staticmethod
    def fetch_tariffs(meter, tariff_id):
        tariffs = meter.fetch_tariff(tariff_id)
        EnergyTariff.objects.bulk_create([EnergyTariff(
            type=TariffType.NORMAL,
            provider_account=meter.provider_account,
            resource=meter.resource_ptr,
            meter_type=Type.ELECTRICITY,
            active_date_start=tariff['active_date_start'],
            daily_fixed_cost=tariff['daily_fixed_cost'] / 100,  # Convert Pence per Day to Pound per Day
            watt_hour_cost=tariff['watt_hour_cost'] / 1000 / 100,  # Convert Pence per kWh to Pound per Wh
            active_time_start=tariff['active_time_start'],
            active_time_end=tariff['active_time_end'],
        ) for tariff in tariffs])

    @staticmethod
    def fetch_historical_data_query(resource, data, _from, _to, period):
        historical_consumption = resource.fetch_historical_consumption(_from, _to, period)
        count = sum(1 if resource_value.value else 0 for resource_value in historical_consumption)
        if count:
            data.extend(
                    DetailedHistoricalData(
                        time=resource_value.time,
                        value=resource_value.value,
                        resource=resource.resource_ptr
                    ) if period.value == 'minute' else LongTermHistoricalData(
                        time=resource_value.time,
                        value=resource_value.value,
                        resource=resource.resource_ptr
                    ) for resource_value in historical_consumption
            )

        return data, count

    def fetch_historical_data(self, resource, period):
        data = []

        if period.value == 'minute':
            to_time = datetime.now() - timedelta(minutes=1)
            from_time = to_time - timedelta(days=2)
            data, _ = self.fetch_historical_data_query(resource, data, from_time, to_time, period)

            if len(data):
                now = datetime.now().replace(second=0, microsecond=0)
                last_timestamp = data[-1].time.timestamp()
                minutes_delay = (now - datetime.fromtimestamp(last_timestamp)).seconds // 60
                resource.minutes_delay = minutes_delay
                resource.save()

            to_time = from_time - timedelta(minutes=1)
            from_time = to_time - timedelta(days=2)
            data, _ = self.fetch_historical_data_query(resource, data, from_time, to_time, period)

            DetailedHistoricalData.objects.bulk_create(data)
        else:
            tomorrow = datetime.now() + timedelta(days=1)
            to_time = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
            from_time = to_time - timedelta(days=10)
            while True:
                data, last_period_count = self.fetch_historical_data_query(resource, data, from_time, to_time - timedelta(minutes=30), period)
                to_time = from_time
                from_time = to_time - timedelta(days=10)

                if last_period_count == 0:
                    break

            LongTermHistoricalData.objects.bulk_create(data)

    def refresh_historical_data(self, meter):
        DetailedHistoricalData.objects.filter(resource=meter.resource_ptr).delete()
        LongTermHistoricalData.objects.filter(resource=meter.resource_ptr).delete()

        if meter.is_half_hour_meter:
            meter.minutes_delay = None
            self.fetch_historical_data(meter, TimeResolution.HALF_HOUR)
        else:
            meter.minutes_delay = 0
            self.fetch_historical_data(meter, TimeResolution.MINUTE)
            try:
                EnergyMeter.objects.get(live_values_meter=meter.id)
            except EnergyMeter.DoesNotExist:
                self.fetch_historical_data(meter, TimeResolution.HALF_HOUR)
        meter.save()

    def create(self, request):
        self.check_permission(request)

        serializer = ManageHildebrandMeterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        meter_id, live_meter_id, tariff_id, name, school_id, credentials, is_half_hour_meter = itemgetter(
            'id', 'liveMeterId', 'tariffId', 'name', 'schoolId', 'credentials', 'isHalfHourMeter',
        )(serializer.validated_data)
        school = Location.objects.get(id=school_id)

        try:
            provider = EnergyProviderAccount.objects.get(provider=Provider.HILDEBRAND, location__id=school_id)
        except EnergyProviderAccount.DoesNotExist:
            provider = EnergyProviderAccount(
                name=f'{school.name} Hildebrand provider',
                provider=Provider.HILDEBRAND,
                location=school,
                credentials=json.dumps(credentials),
            )
            provider.save()

        try:
            meter = self.create_meter(school, provider, meter_id, is_half_hour_meter, name)

            if is_half_hour_meter and live_meter_id:
                try:
                    live_meter = self.create_meter(school, provider, live_meter_id, False, name, False)
                    live_meter.save()
                    meter.live_values_meter = live_meter
                except Exception as err:
                    logger.error(f'create hildebrand meter: (live) {err}')
                    live_meter = None

                if live_meter:
                    self.fetch_historical_data(live_meter, TimeResolution.MINUTE)
            meter.save()
        except Exception as err:
            logger.error(f'create hildebrand meter: {err}')
            meter = None

        if meter:
            try:
                if meter.is_half_hour_meter:
                    self.fetch_historical_data(meter, TimeResolution.HALF_HOUR)
                else:
                    self.fetch_historical_data(meter, TimeResolution.MINUTE)
                    try:
                        EnergyMeter.objects.get(live_values_meter=meter.id)
                    except EnergyMeter.DoesNotExist:
                        self.fetch_historical_data(meter, TimeResolution.HALF_HOUR)
            except Exception as err:
                logger.error(f'create hildebrand meter: (fetch data) {err}')
                meter.delete(force_policy=HARD_DELETE)
                meter = None

        if meter and tariff_id:
            try:
                self.fetch_tariffs(meter, tariff_id)
            except Exception as err:
                logger.error(f'create hildebrand meter: (tariff) {err}')
                meter.delete(force_policy=HARD_DELETE)
                meter = None

        if meter:
            return Response('Hildebrand meter is successfully created!', status=200)
        return Response(f'Cannot create Hildebrand meter!', status=400)

    def update(self, request, *args, **kwargs):
        self.check_permission(request)

        serializer = ManageHildebrandMeterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if 'pk' not in kwargs:
            return Response(f'Cannot edit Hildebrand meter!', status=400)

        pk = kwargs['pk']
        meter_id, live_meter_id, tariff_id, name, credentials, is_half_hour_meter = itemgetter(
            'id', 'liveMeterId', 'tariffId', 'name', 'credentials', 'isHalfHourMeter',
        )(serializer.validated_data)

        try:
            meter = EnergyMeter.objects.get(pk=pk)
            was_half_hour_meter = meter.is_half_hour_meter
            old_meter_id = meter.meter_id

            if meter.live_values_meter and not live_meter_id:
                live_meter = meter.live_values_meter
                meter.live_values_meter = None
                meter.save()
                live_meter.delete(force_policy=HARD_DELETE)

            meter.meter_id = meter_id
            meter.name = name
            meter.is_half_hour_meter = is_half_hour_meter
            meter.save()

            if is_half_hour_meter and live_meter_id:
                if meter.live_values_meter:
                    live_meter = meter.live_values_meter
                    old_live_meter_id = live_meter.meter_id
                    live_meter.meter_id = live_meter_id
                    live_meter.save()

                    if old_live_meter_id != live_meter_id:
                        DetailedHistoricalData.objects.filter(resource__id=live_meter.pk).delete()
                        self.fetch_historical_data(live_meter, TimeResolution.MINUTE)
                else:
                    try:
                        live_meter = self.create_meter(
                            meter.sub_location, meter.provider_account, live_meter_id, False, name, False
                        )
                        live_meter.save()
                        meter.live_values_meter = live_meter
                        meter.save()

                    except Exception as err:
                        logger.error(f'edit hildebrand meter: (live) {err}')
                        live_meter = None

                    if live_meter:
                        self.fetch_historical_data(live_meter, TimeResolution.MINUTE)

            if was_half_hour_meter is not is_half_hour_meter or old_meter_id != meter_id:
                self.refresh_historical_data(meter)

        except Exception as err:
            logger.error(f'edit hildebrand meter: {err}')
            meter = None

        if meter and tariff_id:
            try:
                EnergyTariff.objects.filter(resource=pk).delete()
                self.fetch_tariffs(meter, tariff_id)
            except Exception as err:
                logger.error(f'edit hildebrand meter: (tariff) {err}')
                meter = None

        if meter:
            return Response('Hildebrand meter is successfully edited!', status=200)
        return Response(f'Cannot edit Hildebrand meter!', status=400)

    def retrieve(self, request, pk, *args, **kwargs): 
        self.check_permission(request)
        try:
            meter = EnergyMeter.objects.get(pk=pk)
            self.refresh_historical_data(meter)

        except Exception as err:
            logger.error(f'Refresh Hildebrand meter error: {err}')
            meter = None
        
        if meter:
            return Response('Hildebrand meter data is successfully refreshed!', status=200)
        return Response('Can not refresh Hildebrand meter data!', status=400)
