from datetime import datetime, timezone, timedelta
from rest_framework import serializers
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework.relations import PrimaryKeyRelatedField

from apps.historical_data.serializers import TimeValueSerializer
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.energy_meters_billing_info.serializers import EnergyMeterBillingInfoSerializer
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.constants import METER_TYPE__MUG_METER_TYPE__MAP, HHDataRequestErrorMessages, PaymentType, \
    BANK_VALIDATION_ERROR_MESSAGE, SwitchStatus, MUGMeterRateTypes
from apps.locations.serializer_fileds import InOwnLocationPrimaryKeyRelatedField
from apps.mug_service.models import Savings, CarbonIntensity, Switch
from apps.resources.types import Unit
from apps.energy_providers.providers.abstract import MeterType
from utilities.serializer_helpers import get_serializer_fields


class PostcodeSerializer(serializers.Serializer):
    """Serializer for post request of getting addresses by postcode from MUG API"""
    post_code = serializers.CharField(max_length=100, required=True)


class MUGPostcodeRequestAddressSerializer(serializers.Serializer):
    """Serializer for request by postcode response"""

    # address Lines
    address_line_1 = serializers.CharField(max_length=140, required=False)  # MUG example has not required
    address_line_2 = serializers.CharField(max_length=140,
                                           required=False,
                                           allow_blank=True)  # MUG example has not required
    full_address = serializers.CharField(max_length=300, required=True)

    # town
    town = serializers.CharField(max_length=140, required=True)
    county = serializers.CharField(max_length=140, required=True)

    # postcode
    postcode = serializers.CharField(max_length=100, required=True)


class MUGPostcodeRequestAddressWithMetersSerializer(MUGPostcodeRequestAddressSerializer):
    """Serializer for request by postcode response with meters list"""
    mpan = serializers.ListField(child=serializers.CharField(max_length=50))
    mprn = serializers.ListField(child=serializers.CharField(max_length=50))


class EnergyMeterBillingInfoIdSerializer(serializers.Serializer):
    """Serializer for comparison request"""

    energy_meter_billing_info = InOwnLocationPrimaryKeyRelatedField(
        queryset=EnergyMeterBillingInfo.objects.filter(fuel_type__in=METER_TYPE__MUG_METER_TYPE__MAP)
    )


class MUGResultTariffRateInfo(serializers.Serializer):
    """Serializer for MUG comparison result tariff_rate_infos field"""
    total_cost = serializers.FloatField(min_value=0, allow_null=True)
    rate_meter_type = serializers.CharField(max_length=50, allow_null=True)
    unit_rate = serializers.FloatField(min_value=0, allow_null=True)


class MUGResultSerializer(serializers.Serializer):
    """Serializer for MUG comparison result"""
    result_id = serializers.IntegerField(min_value=0)
    switch_key_info = serializers.CharField(max_length=300, allow_null=True)
    supplier_id = serializers.IntegerField(min_value=0)
    supplier_name = serializers.CharField(max_length=300, allow_null=True)
    supplier_description = serializers.CharField(max_length=300, allow_null=True)
    tariff_name = serializers.CharField(max_length=300, allow_null=True)
    savings_including_vat = serializers.FloatField(allow_null=True)
    savings_excluding_vat = serializers.FloatField(allow_null=True)
    total_cost_including_vat = serializers.FloatField(allow_null=True)
    total_cost_excluding_vat = serializers.FloatField(allow_null=True)
    standing_charge = serializers.FloatField(allow_null=True)
    standing_charge_unit = serializers.CharField(max_length=50, allow_null=True)
    total_standing_charge = serializers.FloatField(allow_null=True)
    site_capacity = serializers.IntegerField(allow_null=True)
    capacity_charge = serializers.IntegerField(allow_null=True)
    solar_capacity = serializers.IntegerField(allow_null=True)
    contract_start_date = serializers.CharField(max_length=50, allow_null=True)
    contract_end_date = serializers.CharField(max_length=50, allow_null=True)
    contract_type_name = serializers.CharField(max_length=50, allow_null=True)
    contract_length_in_months = serializers.IntegerField(allow_null=True)
    pay_method_name = serializers.CharField(max_length=50, allow_null=True)
    is_green = serializers.BooleanField(default=False)
    rate_type = serializers.CharField(max_length=50, allow_null=True)
    tariff_rate_infos = MUGResultTariffRateInfo(many=True)
    is_hh = serializers.BooleanField()

    # Fields for HH tariffs
    total_green_cost = serializers.FloatField(allow_null=True)
    total_amber_cost = serializers.FloatField(allow_null=True)
    total_red_cost = serializers.FloatField(allow_null=True)


class HHDataRequestSerializer(serializers.Serializer):
    """Serializer for hh-data request"""
    from_datetime = serializers.DateTimeField()
    to_datetime = serializers.DateTimeField(required=False, default=datetime.now(tz=timezone.utc))

    @staticmethod
    def validate_to_datetime(to_datetime):
        if to_datetime > datetime.now(tz=timezone.utc):
            raise serializers.ValidationError(HHDataRequestErrorMessages.DATE_IN_FUTURE.value)
        return to_datetime

    @staticmethod
    def validate_from_datetime(from_datetime):
        if from_datetime > datetime.now(tz=timezone.utc):
            raise serializers.ValidationError(HHDataRequestErrorMessages.DATE_IN_FUTURE.value)
        return from_datetime

    def validate(self, attrs):
        date_interval = attrs['to_datetime'] - attrs['from_datetime']
        if date_interval > timedelta(days=365):
            raise serializers.ValidationError(HHDataRequestErrorMessages.TOO_BIG_INTERVAL.value)
        elif date_interval < timedelta():
            raise serializers.ValidationError(HHDataRequestErrorMessages.INCORRECT_ORDER.value)
        return attrs


class HHDataSerializer(EnumSupportSerializerMixin, serializers.Serializer):
    """Serializer for hh-data response"""
    unit = EnumField(Unit)
    hh_data = TimeValueSerializer(many=True)


class SwitchRequestSerializer(EnumSupportSerializerMixin, serializers.Serializer):
    """Serializer for switch request"""
    result_id = serializers.IntegerField(min_value=0)
    supplier_id = serializers.IntegerField()
    tariff_name = serializers.CharField(max_length=100)
    payment_type = EnumField(PaymentType)
    bank_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    city = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=50)
    address_line_1 = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=200)
    address_line_2 = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=200)
    postcode = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=50)
    reference_number = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=50)
    account_holder_name = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=300)
    account_number = serializers.CharField(required=False, allow_null=True, allow_blank=True, min_length=8)
    sort_code = serializers.CharField(required=False, allow_null=True, allow_blank=True, min_length=5, max_length=7)
    to_standing_charge = serializers.FloatField(min_value=0.0)
    tariff_rate_infos = MUGResultTariffRateInfo(many=True)
    contract_start_date = serializers.DateTimeField()
    contract_end_date = serializers.DateTimeField()

    def validate(self, attrs):
        if attrs['payment_type'] == PaymentType.MONTHLY_DIRECT_DEBIT and \
                not MUGApiClient.request_bank_validation(attrs['sort_code'], attrs['account_number']):
            raise serializers.ValidationError(BANK_VALIDATION_ERROR_MESSAGE)
        return attrs


class SwitchModelSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    """Serializer for switch model"""

    energy_meter_billing_info = EnergyMeterBillingInfoSerializer(read_only=True, required=False)
    energy_meter_billing_info_id = PrimaryKeyRelatedField(queryset=EnergyMeterBillingInfo.objects.all(),
                                                          source='energy_meter_billing_info', write_only=True)

    class Meta:
        model = Switch
        fields = get_serializer_fields(
            Switch.contract_id,
            Switch.quote_id,
            Switch.created_at,
            Switch.from_supplier_id,
            Switch.to_supplier_id,
            Switch.to_tariff_name,
            Switch.status,
            Switch.energy_meter_billing_info,
            Switch.to_standing_charge,
            Switch.to_day_unit_rate,
            Switch.to_night_unit_rate,
            Switch.to_evening_and_weekend_unit_rate,
            Switch.contract_start_date,
            Switch.contract_end_date,
            'energy_meter_billing_info',
        )


class SupplierSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=0)
    name = serializers.CharField()
    description = serializers.CharField()


class UpdateSwitchSerializer(EnumSupportSerializerMixin, serializers.Serializer):  # Serializer for MUG user
    status = EnumField(SwitchStatus)

    def validate(self, data):
        if self.context['switch'].status.order >= data['status'].order:
            raise serializers.ValidationError(
                f'You can\'t change statuses '
                f'from \'{self.context["switch"].status.value}\' to \'{data["status"].value}\''
            )
        return data


class MugLocationSitesSerializer(serializers.Serializer):
    sub_location_id = serializers.IntegerField(source='id', min_value=0)
    sub_location_name = serializers.CharField(source='name', max_length=100)
    mug_site_id = serializers.IntegerField(source='mug_site.mug_site_id', min_value=0)


class MugMetersSerializer(serializers.Serializer):
    meter_id = serializers.CharField(max_length=100)
    mug_meter_id = serializers.IntegerField(source='mug_meter.mug_meter_id', min_value=0)


class MugSwitchesStatusSerializer(serializers.Serializer):
    sent_to_mug = serializers.IntegerField(min_value=0)
    supplier_downloaded_contract = serializers.IntegerField(min_value=0)
    switch_accepted = serializers.IntegerField(min_value=0)
    live_switch_complete = serializers.IntegerField(min_value=0)
    failed_contract = serializers.IntegerField(min_value=0)


class MUGPostcodeRequestMetersSerializer(serializers.Serializer):
    """Serializer for meters request by postcode"""

    mpan = serializers.ListField(child=serializers.CharField(max_length=50))
    mprn = serializers.ListField(child=serializers.CharField(max_length=50))

class MUGMeterToCreateSerializer(serializers.Serializer):
    energy_meter_billing_info_id = serializers.IntegerField(min_value=1)

class MUGSavingsRequestSerializer(serializers.Serializer):
    meter_id = serializers.IntegerField(min_value=1)

class MUGSavingsSerializer(serializers.Serializer):
    class Meta:
        model = Savings
        fields = '__all__'

    battery_capacity = serializers.IntegerField(min_value=0)
    calculation_date = serializers.CharField(max_length=50, allow_null=True)
    charging_hours = serializers.IntegerField(min_value=0, allow_null=True)
    charging_start_time = serializers.TimeField(allow_null=True)
    cumulative_battery_savings = serializers.FloatField(min_value=0.0)
    cumulative_solar_savings = serializers.FloatField(min_value=0.0)
    current_battery_capacity = serializers.FloatField(min_value=0.0)
    daily_battery_savings = serializers.FloatField(min_value=0.0)
    daily_solar_savings = serializers.FloatField(min_value=0.0) 
    discharging_hours = serializers.IntegerField(min_value=0, allow_null=True)
    discharging_start_time = serializers.TimeField(allow_null=True)
    is_battery_physical = serializers.BooleanField(allow_null=True)
    is_solar = serializers.BooleanField(allow_null=True)
    solar_capacity = serializers.IntegerField(min_value=0)

class MUGCarbonIntensitySerializer(serializers.Serializer):
    class Meta:
        model = CarbonIntensity
        fields = '__all__'

    calculation_date = serializers.CharField(max_length=50, allow_null=True)
    charging_carbon_intensity = serializers.IntegerField(allow_null=True)
    discharging_carbon_intensity = serializers.IntegerField(allow_null=True)
    daily_net_carbon_intensity = serializers.IntegerField(allow_null=True)
    cumulative_net_carbon_intensity = serializers.IntegerField(allow_null=True)

class MUGMeterToFetchInfoSerializer(EnumSupportSerializerMixin, serializers.Serializer):
    """Serializer for fetching meter info by mpan/mprn id"""
    meter_id = serializers.CharField(max_length=50)
    meter_type = EnumField(MeterType)


class MUGMeterRateTypeSerializer(EnumSupportSerializerMixin, serializers.Serializer):
    meter_rate_type = EnumField(MUGMeterRateTypes)
