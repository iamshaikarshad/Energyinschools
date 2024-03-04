import logging
from typing import Any, Union
from datetime import date

from django.core.validators import MaxValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, QuerySet
from django.contrib.postgres.fields import ArrayField
from enumfields import Enum, EnumField

from apps.resources.models import Resource
from apps.resources.types import ResourceChildType
from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import MeterType
from apps.locations.models import Location
from apps.locations.querysets import AbstractInLocationQuerySet
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfoConsumption
from apps.historical_data.types import Week
from apps.main.models import BaseModel


logger = logging.getLogger(__name__)


# tariff(cash_back_tariff) - tariff(cash_back_tou) = cash back value
class TariffType(Enum):
    NORMAL = 'normal'
    CASH_BACK_TARIFF = 'cash_back_tariff'
    CASH_BACK_TOU = 'cash_back_tou'


class EnergyTariffInLocationQuerySet(AbstractInLocationQuerySet):
    def in_location(self, location: Location):
        return self.filter(
            Q(provider_account__location=location) | Q(resource__sub_location=location) |
            Q(resource__sub_location__parent_location=location)
        )

    def filter_by_location_uid(self, location_uid: str):
        try:
            location = Location.objects.get(uid=location_uid)
            location_with_sub_locations = Location.objects.in_location(location)

        except Location.DoesNotExist:
            return self.none()

        return self.filter(
            Q(resource__sub_location__in=location_with_sub_locations) |
            Q(provider_account__location__in=location_with_sub_locations)
        )


class EnergyTariff(BaseModel):
    sa: Union[Any, 'EnergyTariff']

    Type = TariffType
    objects = EnergyTariffInLocationQuerySet.as_manager()

    type = EnumField(Type, default=Type.NORMAL, max_length=20)

    provider_account = models.ForeignKey(
        EnergyProviderAccount,
        on_delete=models.CASCADE,
        db_index=True,
        null=True,
        blank=True
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        db_index=True,
        null=True,
        blank=True,
        limit_choices_to=Q(
            Q(child_type=ResourceChildType.ENERGY_METER) |
            Q(child_type=ResourceChildType.SMART_THINGS_ENERGY_METER)
        )
    )
    meter_type = EnumField(MeterType, max_length=20, db_index=True)

    energy_meter_billing_info_consumption = models.ForeignKey(EnergyMeterBillingInfoConsumption,
                                                              null=True, blank=True, on_delete=models.CASCADE,
                                                              related_name='energy_tariffs')

    active_time_start = models.TimeField()
    active_time_end = models.TimeField(blank=True, null=True)

    active_date_start = models.DateField()
    active_date_end = models.DateField(blank=True, null=True)

    watt_hour_cost = models.FloatField()
    daily_fixed_cost = models.FloatField(default=0)
    monthly_fixed_cost = models.FloatField(default=0)
    active_days_in_week = ArrayField(models.PositiveSmallIntegerField(validators=[MaxValueValidator(6)]),
                                     null=True, blank=True)

    def clean(self):
        active_days_in_week = list(Week.ALL_DAYS_IN_WEEK.days) if\
            self.active_days_in_week is None else self.active_days_in_week

        queryset = EnergyTariff.objects.filter(
            Q(active_time_end=None) | Q(active_time_end__gt=self.active_time_start),
            Q(active_date_end=None) | Q(active_date_end__gte=self.active_date_start),
            Q(active_days_in_week__overlap=active_days_in_week) | Q(active_days_in_week__isnull=True),
            Q(provider_account=self.provider_account),
            Q(resource=self.resource),
            ~Q(id=self.id),
            meter_type=self.meter_type,
            type=self.type,
        )

        if self.active_date_end:
            queryset = queryset.filter(active_date_start__lte=self.active_date_end)

        if self.active_time_end:
            queryset = queryset.filter(active_time_start__lt=self.active_time_end)

        if queryset:
            raise ValidationError('Energy tariff shouldn\'t intersect with another one!')

    @staticmethod
    def get_tariffs_for_location(location: Location, tariff_type: TariffType) -> QuerySet:
        """
        :return: active(date start and date end are valid for today) tariffs for location
        """
        return EnergyTariff.objects.filter(
            Q(type=tariff_type) &
            (
                    Q(resource__sub_location__in=Location.objects.in_location(location)) |
                    Q(provider_account__location__in=Location.objects.in_location(location))
            ) &
            (Q(active_date_end=None) | Q(active_date_end__gte=date.today())) &
            Q(active_date_start__lte=date.today())
        ).order_by(
            'meter_type',
            'active_time_start'
        )

    @classmethod
    def create_by_embi_consumption(cls, embi_consumption: EnergyMeterBillingInfoConsumption):
        energy_meter_billing_info = embi_consumption.energy_meter_billing_info

        if not energy_meter_billing_info.contract_starts_on:
            logger.warning('contract_starts_on isn\'t filled for EnergyMeterBillingInfo '
                           f'[EnergyMeterBillingInfo ID]-{energy_meter_billing_info.id}')
            return

        related_tariff = energy_meter_billing_info.unit_rate_type.related_tariff.getattr(
            embi_consumption.unit_rate_period.name
        ) if energy_meter_billing_info.unit_rate_type.related_tariff else None

        if related_tariff is None:
            logger.warning(f'no related tariff for {embi_consumption.unit_rate_period.name} '
                           f'EnergyMeterBillingInfoConsumption '
                           f'[EnergyMeterBillingInfo ID]-{energy_meter_billing_info.id}')
            return

        for period in related_tariff.active_periods:
            try:
                energy_tariff = cls(
                    energy_meter_billing_info_consumption=embi_consumption,
                    type=TariffType.NORMAL,
                    meter_type=energy_meter_billing_info.fuel_type,
                    active_time_start=period.start,
                    active_time_end=period.end,
                    active_date_start=energy_meter_billing_info.contract_starts_on,
                    active_date_end=energy_meter_billing_info.contract_ends_on,
                    watt_hour_cost=embi_consumption.unit_rate / 1000 / 100,  # Convert Pence per kWh to Pound per Wh
                    daily_fixed_cost=energy_meter_billing_info.standing_charge / 100,  # Convert Pence per Day to Pound per Day
                    resource=energy_meter_billing_info.resource,
                    active_days_in_week=None if period.days_in_week is Week.ALL_DAYS_IN_WEEK else list(period.days_in_week.days),
                )
                energy_tariff.clean()
                energy_tariff.save()

            except ValidationError as err:
                logger.error(f'EnergyTariff creation for EnergyMeterBillingInfoConsumption failed: '
                             f'{str(err)} [EnergyMeterBillingInfo ID]-{embi_consumption.id}')
