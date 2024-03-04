from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.historical_data.constants import EXPORT_ENERGY_DATA_RANGE_LIMIT_DAYS, ENERGY_DATA_EXPORT_ACCEPTED_FORMATS
from apps.historical_data.serializers import HistoricalDataQuerySerializerSet
from apps.locations.serializer_fileds import InOwnLocationPrimaryKeyRelatedField, OwnSubLocationField
from apps.resources.models import Resource
from apps.resources.types import ResourceValidationError, Unit
from utilities.serializer_helpers import get_serializer_fields
from apps.energy_providers.providers.abstract import MeterType


class EnergyMeterSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    provider_account = InOwnLocationPrimaryKeyRelatedField(queryset=EnergyProviderAccount.objects.all())
    sub_location = OwnSubLocationField()

    class Meta:
        model = EnergyMeter
        fields = get_serializer_fields(
            EnergyMeter.meter_id,
            EnergyMeter.type,
            'sub_location',
            'provider_account',
            EnergyMeter.name,
            EnergyMeter.description,
            EnergyMeter.is_half_hour_meter,
            EnergyMeter.minutes_delay,
            'live_values_meter',
            'hh_values_meter',
        )

    def validate(self, attrs):
        if {'meter_id', 'type', 'provider_id'}.intersection(attrs):
            energy_meter = EnergyMeter()
            energy_meter.meter_id = attrs.get('meter_id') or self.instance.meter_id
            energy_meter.type = attrs.get('type') or self.instance.type
            energy_meter.provider_account = attrs.get('provider_account') or self.instance.provider_account

            try:
                energy_meter.validate()
            except ResourceValidationError as error:
                raise ValidationError('Meter confirmation failed!') from error

        return attrs


serializer_set = HistoricalDataQuerySerializerSet(
    'EnergyMeter',
    extra_fields=dict(unit=EnumField(Unit, required=False, default=Unit.WATT)),
    total_extra_fields=dict(unit=EnumField(Unit, required=False, default=Unit.WATT_HOUR)),
)

common_serializer_set = HistoricalDataQuerySerializerSet(
    'CommonEnergyMeter',
    extra_fields=dict(unit=EnumField(Unit, required=False, default=Unit.WATT), meter_type=EnumField(MeterType, required=False)),
    total_extra_fields=dict(unit=EnumField(Unit, required=False, default=Unit.WATT_HOUR)),
)


class ExportDataQueryParamsSerializer(common_serializer_set.sequence):
    format = serializers.ChoiceField(choices=ENERGY_DATA_EXPORT_ACCEPTED_FORMATS)
    resource_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        to = attrs.get('to', None)
        from_ = attrs.get('from_', None)
        resource_id = attrs.get('resource_id', None)

        if (to - from_).days > EXPORT_ENERGY_DATA_RANGE_LIMIT_DAYS:
            raise ValidationError({'message': 'Selected date period should not be greater than one year'})

        if to < from_:
            raise ValidationError({'message': 'FROM parameter should not be greater than TO parameter'})

        if resource_id and not Resource.objects.filter(pk=resource_id).exists():
            raise ValidationError({'message': 'Resource with provided ID not found'})

        return attrs


class ManageHildebrandMeterSerializer(serializers.Serializer):
    id = serializers.CharField()
    liveMeterId = serializers.CharField(default='', allow_blank=True)
    tariffId = serializers.CharField(default='', allow_blank=True)
    name = serializers.CharField()
    credentials = serializers.JSONField()
    schoolId = serializers.IntegerField()
    isHalfHourMeter = serializers.BooleanField()
