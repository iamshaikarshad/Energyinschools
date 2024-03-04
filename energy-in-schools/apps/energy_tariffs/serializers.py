from datetime import time
from typing import Any, Dict

from django.conf import settings
from django.db.models import Q
from drf_yasg.utils import swagger_serializer_method
from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers

from apps.energy_providers.providers.abstract import MeterType
from apps.locations.models import Location
from apps.locations.serializers import LocationSerializer
from apps.resources.models import Resource
from apps.resources.types import ResourceChildType
from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_tariffs.models import EnergyTariff
from apps.locations.serializer_fileds import InOwnLocationPrimaryKeyRelatedField
from apps.cashback.cashback_calculation import FlatCashBackTariff, TOUCashBackTariffUnitRate, \
    TOUCashBackTariffTimeRanges
from utilities.serializer_helpers import get_serializer_fields


class EnergyTariffSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    provider_account_id = InOwnLocationPrimaryKeyRelatedField(
        queryset=EnergyProviderAccount.objects.all(),
        read_only=False,
        source='provider_account',
        required=False,
        allow_null=True,
    )
    resource_id = InOwnLocationPrimaryKeyRelatedField(
        queryset=Resource.objects.filter(
            Q(child_type=ResourceChildType.ENERGY_METER) |
            Q(child_type=ResourceChildType.SMART_THINGS_ENERGY_METER)
        ),
        read_only=False,
        source='resource',
        required=False,
        allow_null=True
    )

    class Meta:
        model = EnergyTariff

        fields = get_serializer_fields(
            model.type,
            model.provider_account,
            model.resource,
            model.meter_type,
            model.active_time_start,
            model.active_time_end,
            model.active_date_start,
            model.active_date_end,
            model.watt_hour_cost,
            model.daily_fixed_cost,
            model.active_days_in_week,
        )

    def validate(self, attrs: Dict[str, Any]):
        EnergyTariff(
            type=attrs.get('type', getattr(self.instance, 'type', None)),
            provider_account=attrs.get('provider_account', getattr(self.instance, 'provider_account', None)),
            resource=attrs.get('resource', getattr(self.instance, 'resource', None)),
            meter_type=attrs.get('meter_type', getattr(self.instance, 'meter_type', None)),
            active_time_start=attrs.get('active_time_start', getattr(self.instance, 'active_time_start', None)),
            active_time_end=attrs.get('active_time_end', getattr(self.instance, 'active_time_end', None)),
            active_date_start=attrs.get('active_date_start', getattr(self.instance, 'active_date_start', None)),
            active_date_end=attrs.get('active_date_end', getattr(self.instance, 'active_date_end', None)),
            watt_hour_cost=attrs.get('watt_hour_cost', getattr(self.instance, 'watt_hour_cost', None)),
            daily_fixed_cost=attrs.get('daily_fixed_cost', getattr(self.instance, 'daily_fixed_cost', None)),
        ).clean()

        return attrs


class CurrentLocationTariffsSerializer(LocationSerializer):
    current_energy_tariffs = serializers.SerializerMethodField(read_only=True)

    @staticmethod
    @swagger_serializer_method(serializer_or_field=EnergyTariffSerializer)
    def get_current_energy_tariffs(location: Location):
        energy_tariffs = EnergyTariff.get_tariffs_for_location(location, EnergyTariff.Type.NORMAL)
        serializer = EnergyTariffSerializer(energy_tariffs, many=True)
        return serializer.data

    class Meta:
        model = Location
        fields = ['current_energy_tariffs']
