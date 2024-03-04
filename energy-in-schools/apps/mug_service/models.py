import logging
import datetime

from django.db import models
from django.db.models.deletion import CASCADE
from django.shortcuts import get_object_or_404
from enumfields import EnumField
from django.utils import timezone

from apps.main.models import BaseModel
from apps.mug_service.api_client import MeterMUGApiClientMixin
from apps.mug_service.decorators import mug_client_error_handler
from apps.registration_requests.models import RegistrationRequest
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.locations.models import Location
from apps.mug_service.internal_types import MUGSiteParams, MUGCustomerParams, MUGMeterParams
from apps.mug_service.constants import METER_TYPE__MUG_METER_TYPE__MAP, SwitchStatus
from apps.mug_service.api_client import MUGApiClient


logger = logging.getLogger(__name__)


class Customer(BaseModel):
    registration_request = models.OneToOneField(RegistrationRequest,
                                                on_delete=models.CASCADE,
                                                related_name='mug_customer')
    mug_customer_id = models.PositiveIntegerField()

    @staticmethod
    @mug_client_error_handler()
    def create_from_registration_request(registration_request: RegistrationRequest):
        try:
            mug_customer_id = MUGApiClient.request_add_customer(
                MUGCustomerParams.from_registration_request(
                    registration_request
                ).to_json()
            )
            return Customer.objects.create(registration_request=registration_request, mug_customer_id=mug_customer_id)
        except Exception as e:
            logger.error(f'Add customer fails with error: {e}')


class Site(BaseModel):
    sub_location = models.OneToOneField(Location, on_delete=models.CASCADE, related_name='mug_site')
    mug_site_id = models.PositiveIntegerField()

    @staticmethod
    @mug_client_error_handler()
    def create_from_location(location: Location):
        
        try:
            Site.objects.get(sub_location=location)

        except Site.DoesNotExist:    
            try:
                mug_customer_id = location.school.registration_request.mug_customer.mug_customer_id
                site_data = MUGSiteParams.from_location(location).to_json()
                mug_site_id = MUGApiClient.request_add_site(mug_customer_id, site_data)
                return Site.objects.create(sub_location=location, mug_site_id=mug_site_id)

            except (RegistrationRequest.DoesNotExist, Customer.DoesNotExist):
                logger.exception(f"MUG Customer not found for Location '{location.uid}'")

class Meter(BaseModel):
    energy_meter_billing_info = models.OneToOneField(EnergyMeterBillingInfo,
                                                     on_delete=models.CASCADE,
                                                     related_name='mug_meter')
    mug_meter_id = models.PositiveIntegerField()
    
    @staticmethod
    @mug_client_error_handler()
    def create_from_energy_meter_billing_info(energy_meter_billing_info: EnergyMeterBillingInfo):
        try:
            school: Location = energy_meter_billing_info.location.school
            mug_customer_id = school.registration_request.mug_customer.mug_customer_id
            mug_site_id = school.mug_site.mug_site_id

            mug_meter_id = MUGApiClient.request_add_meter(
                customer_id=mug_customer_id,
                site_id=mug_site_id,
                meter_data_json=MUGMeterParams.from_energy_meter_billing_info(
                    energy_meter_billing_info
                ).to_json(),
                meter_type=METER_TYPE__MUG_METER_TYPE__MAP[energy_meter_billing_info.fuel_type],
            )
            MUGApiClient.post_extra_meter_details(mug_customer_id, mug_site_id, mug_meter_id, energy_meter_billing_info)

            return Meter.objects.create(energy_meter_billing_info=energy_meter_billing_info, mug_meter_id=mug_meter_id)

        except (RegistrationRequest.DoesNotExist, Customer.DoesNotExist):
            logger.exception(f"MUG Customer not found for Location '{energy_meter_billing_info.location.uid}'")

        except Site.DoesNotExist:
            logger.exception(f"MUG Site not found for Location '{energy_meter_billing_info.location.uid}'")

    def delete(self, using=None, keep_parents=False):
        location = self.energy_meter_billing_info.location
        mug_customer_id = location.mug_customer.mug_customer_id
        mug_site_id = location.school.mug_site.mug_site_id
        mug_meter_id = self.mug_meter_id
        mug_meter_type = METER_TYPE__MUG_METER_TYPE__MAP[self.energy_meter_billing_info.fuel_type]
        try:
            MUGApiClient.request_delete_meter( mug_customer_id, mug_site_id, mug_meter_id, mug_meter_type)
        except Exception as error:
            logger.error(f'request_delete_meter failed with error: {error}')

        return super().delete(using, keep_parents)


class Savings(BaseModel):
    meter = models.ForeignKey(Meter, on_delete=CASCADE)

    battery_capacity = models.IntegerField(default=0)
    calculation_date = models.CharField(default=0, max_length=50)
    charging_hours = models.IntegerField(default=1)
    charging_start_time = models.TimeField(default=timezone.now)
    cumulative_battery_savings = models.FloatField(default=0.0)
    cumulative_solar_savings = models.FloatField(default=0.0)
    current_battery_capacity = models.FloatField(default=0.0)
    daily_battery_savings = models.FloatField(default=0.0)
    daily_solar_savings = models.FloatField(default=0.0)
    discharging_hours = models.IntegerField(default=1)
    discharging_start_time = models.TimeField(default=timezone.now)
    is_battery_physical = models.BooleanField(default=False)
    is_solar = models.BooleanField(default=False)
    solar_capacity = models.IntegerField(default=0)

class CarbonIntensity(BaseModel):
    meter = models.ForeignKey(Meter, on_delete=CASCADE)

    calculation_date = models.CharField(default='', max_length=50)
    charging_carbon_intensity = models.IntegerField(default=0)
    discharging_carbon_intensity = models.IntegerField(default=0)
    daily_net_carbon_intensity = models.IntegerField(default=0)
    cumulative_net_carbon_intensity = models.IntegerField(default=0)

class Switch(BaseModel):
    class Meta:
        verbose_name_plural = 'switches'

    contract_id = models.PositiveIntegerField(unique=True)
    quote_id = models.PositiveIntegerField(unique=True)
    from_supplier_id = models.PositiveIntegerField()
    to_supplier_id = models.PositiveIntegerField()
    to_tariff_name = models.CharField(max_length=100)
    status = EnumField(SwitchStatus, max_length=40, null=False)
    energy_meter_billing_info = models.ForeignKey(EnergyMeterBillingInfo, on_delete=models.CASCADE,
                                                  related_name='switches')
    to_standing_charge = models.FloatField(default=0.0)
    to_day_unit_rate = models.FloatField(default=0.0)
    to_night_unit_rate = models.FloatField(default=0.0)
    to_evening_and_weekend_unit_rate = models.FloatField(default=0.0)
    to_peak_unit_rate = models.FloatField(default=0.0)
    contract_start_date = models.DateField()
    contract_end_date = models.DateField()
