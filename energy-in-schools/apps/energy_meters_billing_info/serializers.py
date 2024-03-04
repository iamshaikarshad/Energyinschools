from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator, UniqueValidator

from apps.resources.models import Resource
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo, EnergyMeterBillingInfoConsumption
from apps.locations.serializer_fileds import OwnLocationField, InOwnLocationPrimaryKeyRelatedField
from apps.mug_service.constants import PeriodsByRateType
from utilities.serializer_helpers import get_serializer_fields


class EnergyMeterBillingInfoConsumptionSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):

    class Meta:
        model = EnergyMeterBillingInfoConsumption
        fields = get_serializer_fields(
            model.unit_rate_period,
            model.unit_rate,
            model.consumption,
        )


class EnergyMeterBillingInfoSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    location_id = OwnLocationField(source='location', required=False)
    resource_id = InOwnLocationPrimaryKeyRelatedField(
        queryset=Resource.objects.all(), source='resource', required=False,
        validators=[UniqueValidator(queryset=EnergyMeterBillingInfo.objects.all())]
    )
    consumption_by_rates = EnergyMeterBillingInfoConsumptionSerializer(many=True)

    class Meta:
        model = EnergyMeterBillingInfo
        fields = get_serializer_fields(
            model.school_address,
            model.location,
            model.fuel_type,
            model.meter_type,
            model.meter_id,
            model.unit_rate_type,
            model.standing_charge,
            model.capacity_charge,
            model.site_capacity,
            model.halfhourly_non_halfhourly,
            model.has_solar,
            model.solar_capacity,
            model.is_battery_physical,
            model.battery_capacity,
            model.tpi_name,
            model.contract_starts_on,
            model.contract_ends_on,
            model.resource,
            model.supplier_id,
            'consumption_by_rates',
        )

        validators = [
            UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=model._meta.unique_together[0]
            )
        ]

    def validate(self, attrs):
        if attrs['contract_starts_on'] and attrs['contract_starts_on'] > attrs['contract_ends_on']:
            raise serializers.ValidationError('Contract Starts On should be less than Contract Ends On!')
        return attrs

    def create(self, validated_data):
        consumption_by_rates = validated_data.pop('consumption_by_rates')
        energy_meter_billing_info = EnergyMeterBillingInfo.objects.create(**validated_data)

        for consumption_rate in consumption_by_rates:
            if consumption_rate['unit_rate_period'] in PeriodsByRateType[validated_data['unit_rate_type'].value]:
                EnergyMeterBillingInfoConsumption.objects.create(
                    energy_meter_billing_info=energy_meter_billing_info,
                    unit_rate_period=consumption_rate['unit_rate_period'],
                    unit_rate=consumption_rate['unit_rate'],
                    consumption=consumption_rate['consumption'],
                )

        return energy_meter_billing_info


# noinspection PyAbstractClass
class EnergyMeterBillingInfoResourceSerializer(serializers.Serializer):
    energy_meter_billing_info = InOwnLocationPrimaryKeyRelatedField(queryset=EnergyMeterBillingInfo.objects.all())
    resource = InOwnLocationPrimaryKeyRelatedField(queryset=Resource.objects.all(), allow_null=True)
