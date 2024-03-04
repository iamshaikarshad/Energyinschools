from enumfields import Enum

from django.db import models
from django.core.validators import MinValueValidator

from apps.energy_providers.providers.abstract import MeterType
from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.addresses.models import Address
from apps.main.models import BaseModel
from apps.resources.models import Resource
from utilities.custom_serializer_fields import AutoLengthEnumField
from apps.mug_service.constants import MUGMeterRateTypes, MUGMeterRatePeriod


class UsedMeterType(Enum):
    SMART_OR_AMR = 'smart_or_amr'
    NON_AMR = 'non_amr'


class EnergyMeterBillingInfo(BaseModel):
    class Meta:
        verbose_name_plural = "Energy meter billing info"
        unique_together = ('location', 'meter_id')

    UsedMeterType = UsedMeterType

    objects = InLocationQuerySet.as_manager()

    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    school_address = models.CharField(max_length=500, null=True, blank=True)

    halfhourly_non_halfhourly = models.BooleanField(null=True)
    site_capacity = models.IntegerField()
    capacity_charge = models.IntegerField()

    has_solar = models.BooleanField(null=True)
    solar_capacity = models.IntegerField(default=0)

    is_battery_physical = models.BooleanField(null=True)
    battery_capacity = models.IntegerField(default=0)

    tpi_name = models.CharField(max_length=100, null=True)

    resource = models.OneToOneField(Resource, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='energy_meter_billing_info')

    fuel_type = AutoLengthEnumField(MeterType)
    meter_type = AutoLengthEnumField(UsedMeterType)
    meter_id = models.CharField(max_length=100)

    unit_rate_type = AutoLengthEnumField(MUGMeterRateTypes, default=MUGMeterRateTypes.SINGLE)
    standing_charge = models.FloatField()

    contract_starts_on = models.DateField(null=True, blank=True)
    contract_ends_on = models.DateField()

    supplier_id = models.IntegerField(null=True, blank=True)

    def update_on_switch_complete(self, tariff_switch):
        self.standing_charge = tariff_switch.to_standing_charge
        self.contract_starts_on = tariff_switch.contract_start_date
        self.contract_ends_on = tariff_switch.contract_end_date
        self.save()


class EnergyMeterBillingInfoConsumption(BaseModel):
    energy_meter_billing_info = models.ForeignKey(EnergyMeterBillingInfo,
                                                  on_delete=models.CASCADE,
                                                  related_name='consumption_by_rates')
    unit_rate_period = AutoLengthEnumField(MUGMeterRatePeriod, default=MUGMeterRatePeriod.DAY)
    unit_rate = models.FloatField(validators=[MinValueValidator(0.0)])
    consumption = models.FloatField(validators=[MinValueValidator(1.0)])

    def update_on_switch_complete(self, tariff_switch):
        unit_rate = getattr(tariff_switch, f'to_{self.unit_rate_period.period_name}_unit_rate')
        self.unit_rate = unit_rate
        self.save()
