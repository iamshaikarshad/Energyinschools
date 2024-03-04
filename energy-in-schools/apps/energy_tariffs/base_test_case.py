import random
from typing import Union, TYPE_CHECKING
from datetime import date, time

import factory
from faker import Factory

from apps.energy_providers.providers.abstract import MeterType
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.energy_tariffs.models import EnergyTariff, TariffType
from apps.resources.tests import ResourceFactory

if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter
    from apps.smart_things_sensors.models import SmartThingsEnergyMeter


faker = Factory.create()


class EnergyTariffFactory(factory.DjangoModelFactory):
    class Meta:
        model = EnergyTariff

    type = TariffType.NORMAL

    resource = factory.SubFactory(ResourceFactory)
    meter_type = factory.LazyFunction(lambda: random.choice(list(MeterType)))

    active_time_start = faker.time()

    active_date_start = faker.date()

    watt_hour_cost = faker.pyfloat(positive=True)
    daily_fixed_cost = 0.0
    monthly_fixed_cost = 0.0


class EnergyTariffBaseTestCase(EnergyProviderBaseTestCase):
    @classmethod
    def create_energy_tariff(cls, for_forever=True, active_days_in_week=None):
        for meter_type, active_time_start, active_time_end, cost in (
                (MeterType.GAS, time(hour=0), None, 0.064 / 1000),
                (MeterType.ELECTRICITY, time(hour=7), time(hour=16), 0.07 / 1000),
                (MeterType.ELECTRICITY, time(hour=16), time(hour=19), 0.14 / 1000),
                (MeterType.ELECTRICITY, time(hour=19), None, 0.05 / 1000),
                (MeterType.ELECTRICITY, time(hour=0), time(hour=7), 0.05 / 1000),
        ):
            for tariff_type, watt_hour_cost, daily_fixed_cost, monthly_fixed_cost in (
                    (EnergyTariff.Type.NORMAL, cost, 0.5, 1.5),
                    (EnergyTariff.Type.CASH_BACK_TOU, cost * 10, 0, 0),
                    (EnergyTariff.Type.CASH_BACK_TARIFF, cost * 100, 0, 0),
            ):
                EnergyTariff.objects.create(
                    type=tariff_type,
                    provider_account_id=cls._energy_provider_id,
                    meter_type=meter_type,
                    active_time_start=active_time_start,
                    active_time_end=active_time_end,
                    active_date_start=date(1999, 1, 1),
                    active_date_end=None if for_forever else date(2001, 1, 1),
                    watt_hour_cost=watt_hour_cost,
                    daily_fixed_cost=daily_fixed_cost,
                    monthly_fixed_cost=monthly_fixed_cost,
                    active_days_in_week=active_days_in_week,
                )

    @staticmethod
    def create_energy_tariff_for_meter(meter: Union['EnergyMeter', 'SmartThingsEnergyMeter']):
        for tariff_type, watt_hour_cost, daily_fixed_cost, monthly_fixed_cost in (
            (EnergyTariff.Type.NORMAL, 0.05 / 1000, 0.5, 1.5),
            (EnergyTariff.Type.CASH_BACK_TOU, 0.05 / 1000 * 10, 0, 0),
            (EnergyTariff.Type.CASH_BACK_TARIFF,  0.05 / 1000 * 100, 0, 0),
        ):
            EnergyTariff.objects.create(
                type=tariff_type,
                provider_account_id=None,
                meter_type=meter.type,
                active_time_start=time(hour=0),
                active_time_end=None,
                active_date_start=date(1999, 1, 1),
                active_date_end=None,
                watt_hour_cost=watt_hour_cost,
                daily_fixed_cost=daily_fixed_cost,
                monthly_fixed_cost=monthly_fixed_cost,
                resource=meter,
            )

    @staticmethod
    def create_TOU_energy_tariffs(meter: Union['EnergyMeter', 'SmartThingsEnergyMeter']):
        for (active_time_start, active_time_end), watt_hour_cost, stanging_charge in (
                ((time(hour=0), time(hour=7)), 1, 1),
                ((time(hour=7), time(hour=23)), 2, 2),
                ((time(hour=23), None), 3, 3),
        ):
            EnergyTariffFactory(resource=meter,
                                active_date_start=date(2000, 1, 1),
                                active_time_start=active_time_start,
                                active_time_end=active_time_end,
                                watt_hour_cost=watt_hour_cost,
                                daily_fixed_cost=stanging_charge,
                                meter_type=meter.type)
