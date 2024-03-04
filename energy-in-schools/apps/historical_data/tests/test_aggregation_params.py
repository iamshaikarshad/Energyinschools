from datetime import date, time, timedelta, timezone

from django.utils.datetime_safe import datetime

from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.energy_tariffs.models import EnergyTariff
from apps.historical_data.utils.aggregation_params_manager import AggregationParamsManager
from apps.historical_data.utils.aggregations import TimeValuePair, aggregate_to_list, aggregate_to_one
from apps.historical_data.utils.button_events_aggregation_utils import ButtonAggregationOption
from apps.historical_data.utils.energy_cost_calculation_utils import CostAggregationOption
from apps.resources.models import Resource
from apps.resources.types import DataCollectionMethod, ResourceValue, TimeResolution, Unit, ResourceChildType
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from apps.smart_things_sensors.models import SmartThingsEnergyMeter
from apps.smart_things_devices.models import SmartThingsCapability
from apps.smart_things_devices.types import Capability
from apps.accounts.permissions import RoleName


class TestAggregationParams(EnergyHistoryBaseTestCase, EnergyTariffBaseTestCase):
    def test_float_value_aggregations(self):
        self.create_energy_tariff()
        second_energy_meter = self.create_energy_meter()

        self.create_energy_history(
            extra_rows=(
                (self.energy_meter, datetime(2000, 10, 10, 10, 0, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 10, 10, 10, 30, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 10, 10, 11, 30, tzinfo=timezone.utc)),
                (second_energy_meter, datetime(2000, 10, 10, 11, 00, tzinfo=timezone.utc)),
                (second_energy_meter, datetime(2000, 10, 10, 11, 30, tzinfo=timezone.utc)),
            ),
            default_rows=False,
            is_detailed_history=False
        )

        cash_back_total = 0.0035 * 10 - 0.0035 + 0.0315 * 10 - 0.0315

        for native_unit, unit, option, value1, value2, total in (
                (Unit.WATT, Unit.WATT, None, 5, 55, 45),
                (Unit.WATT, Unit.KILOWATT, None, 5 / 1000, 55 / 1000, 45 / 1000),
                (Unit.WATT, Unit.WATT_HOUR, None, 5, 45, 50),
                (Unit.WATT, Unit.KILOWATT_HOUR, None, 5 / 1000, 45 / 1000, 50 / 1000),
                (Unit.WATT, Unit.POUND_STERLING, None, 0.00035, 0.00315, 0.00035 + 0.00315),
                (Unit.WATT, Unit.POUND_STERLING, CostAggregationOption.WATT_HOUR_COST, 0.00035, 0.00315,
                 0.00035 + 0.00315),
                (Unit.WATT, Unit.POUND_STERLING, CostAggregationOption.FULL_COST, 0.00035, 0.00315, 0.00035 + 0.00315),
                (Unit.WATT, Unit.POUND_STERLING, CostAggregationOption.CASH_BACK, cash_back_total, None,
                 cash_back_total),
                (Unit.CELSIUS, Unit.CELSIUS, None, 5, 27.5, 22.5),
        ):
            Resource.objects.update(unit=native_unit)

            with self.subTest(f'aggregate_to_list {unit} ({option})'):
                result = list(aggregate_to_list(aggregation_rules=AggregationParamsManager().get_aggregation_rules(
                    resources=Resource.objects.all(),
                    unit=unit,
                    time_resolution=TimeResolution.HOUR,
                    aggregation_option=option,
                )))

                if option == CostAggregationOption.CASH_BACK:
                    # cash back have daily data only.
                    # todo raise exception when time resolution is less then 1 day
                    self.assertEqual(1, len(result))
                    self.assertEqual(datetime(2000, 10, 10, tzinfo=timezone.utc), result[0].time)
                    self.assertAlmostEqual(value1, result[0].value)

                else:
                    self.assertEqual(2, len(result))
                    self.assertEqual(datetime(2000, 10, 10, 10, tzinfo=timezone.utc), result[0].time)
                    self.assertEqual(datetime(2000, 10, 10, 11, tzinfo=timezone.utc), result[1].time)
                    self.assertAlmostEqual(value1, result[0].value)
                    self.assertAlmostEqual(value2, result[1].value)

            with self.subTest(f'aggregate_to_one {unit} ({option})'):
                result = aggregate_to_one(
                    resources=Resource.objects.all(),
                    unit=unit,
                    aggregation_option=option,
                )

                self.assertAlmostEqual(total, result.value)

    def test_enum_value_aggregations(self):
        resource_1 = self._create_resource()
        resource_2 = self._create_resource()

        for resource_index, (resource, minutes_offsets) in enumerate((
                (resource_1, (0, 1)),
                (resource_2, (1,)),
        )):
            for seconds_offset, value in (
                    (0, 0),
                    (10, 1),
                    (20, 2),
                    (30, 3),
            ):
                for duplicate_index in range(value + 1):
                    for minutes_offset in minutes_offsets:
                        resource.add_value(ResourceValue(
                            time=(datetime(2000, 1, 1, tzinfo=timezone.utc) +
                                  timedelta(minutes=minutes_offset,
                                            seconds=seconds_offset + resource_index + duplicate_index * 2)),
                            value=value,
                            unit=Unit.UNKNOWN,
                        ))

        for native_unit, used_value, option in (
                (Unit.MOTION_STATE, 1, None),
                (Unit.CONTACT_STATE, 1, None),
                (Unit.BUTTON_STATE, None, None),
                (Unit.BUTTON_STATE, None, ButtonAggregationOption.ANY),
                (Unit.BUTTON_STATE, 1, ButtonAggregationOption.PUSHED),
                (Unit.BUTTON_STATE, 2, ButtonAggregationOption.DOUBLE),
                (Unit.BUTTON_STATE, 3, ButtonAggregationOption.HELD),
        ):
            resource_1.unit = native_unit
            resource_2.unit = native_unit

            if used_value is None:
                events_count = 1 + 2 + 3 + 4  # all events

            else:
                events_count = used_value + 1  # regarding to data generation

            with self.subTest(f'aggregate_to_list {native_unit} ({option})'):
                result = list(aggregate_to_list(aggregation_rules=AggregationParamsManager().get_aggregation_rules(
                    resources=[resource_1, resource_2],
                    unit=Unit.EVENTS_COUNT,
                    time_resolution=TimeResolution.MINUTE,
                    aggregation_option=option,
                )))

                self.assertListEqual([
                    TimeValuePair(time=datetime(2000, 1, 1, tzinfo=timezone.utc), value=events_count),
                    TimeValuePair(time=datetime(2000, 1, 1, 0, 1, tzinfo=timezone.utc), value=events_count * 2),
                ], result)

    def _create_resource(self):
        return Resource.objects.create(
            name='name',
            description='desc',
            sub_location=self.location,
            child_type=Resource.ChildType.ENERGY_METER,  # it doesn't meter
            supported_data_collection_methods=[DataCollectionMethod.PULL],
            preferred_data_collection_method=DataCollectionMethod.PULL,
            unit=Unit.UNKNOWN,
            detailed_time_resolution=TimeResolution.SECOND,
            long_term_time_resolution=TimeResolution.HALF_HOUR,
        )

    def test_full_cost_for_years(self):
        self.create_energy_tariff()

        self.create_energy_history(
            extra_rows=(
                (self.energy_meter, datetime(2000, 10, 10, 10, 0, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 10, 10, 10, 30, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2003, 10, 10, 11, 30, tzinfo=timezone.utc)),
            ),
            default_rows=False,
            is_detailed_history=False
        )

        with self.subTest('to list'):
            result = list(aggregate_to_list(aggregation_rules=AggregationParamsManager().get_aggregation_rules(
                resources=Resource.objects.all(),
                unit=Unit.POUND_STERLING,
                time_resolution=TimeResolution.YEAR,
                aggregation_option=CostAggregationOption.FULL_COST,
            )))
            watt_hour_cost = 0.07 / 1000
            daily_cost = 0.5
            monthly_cost = 1.5

            self.assertEqual(2, len(result))
            self.assertAlmostEqual(
                (datetime(2001, 1, 1) - datetime(2000, 1, 1)).days * daily_cost +
                12 * monthly_cost +
                5 * watt_hour_cost,
                result[0].value
            )
            self.assertAlmostEqual(
                (datetime(2004, 1, 1) - datetime(2003, 1, 1)).days * daily_cost +
                12 * monthly_cost +
                10 * watt_hour_cost,
                result[1].value
            )

        with self.subTest('to one'):
            result = aggregate_to_one(
                resources=Resource.objects.all(),
                unit=Unit.POUND_STERLING,
                aggregation_option=CostAggregationOption.FULL_COST,
                from_=datetime(1990, 10, 10, 10, 0, tzinfo=timezone.utc),
                to=datetime(2010, 10, 10, 10, 0, tzinfo=timezone.utc),
            )

            self.assertAlmostEqual(
                (datetime(2003, 10, 10, 11, 30, tzinfo=timezone.utc) -
                 datetime(2000, 10, 10, 10, 0, tzinfo=timezone.utc)).days * daily_cost +
                3 * 12 * monthly_cost +
                15 * watt_hour_cost,
                result.value
            )

    def test_energy_cost_for_concrete_meter(self):
        EnergyTariff.objects.create(
            type=EnergyTariff.Type.NORMAL,
            resource_id=self.energy_meter.id,
            meter_type=self.energy_meter.type,
            active_time_start=time(0),
            active_time_end=None,
            active_date_start=datetime(2000, 1, 1, tzinfo=timezone.utc),
            active_date_end=None,
            watt_hour_cost=1,
            daily_fixed_cost=2,
            monthly_fixed_cost=3,
        )
        self.create_energy_history(is_detailed_history=False)

        result = aggregate_to_one(
            [self.energy_meter],
            unit=Unit.POUND_STERLING,
            aggregation_option=CostAggregationOption.WATT_HOUR_COST
        )

        self.assertEqual(15.0, result.value)

    def test_negative_cache_back(self):
        EnergyTariff.objects.create(
            type=EnergyTariff.Type.CASH_BACK_TOU,
            provider_account=self.energy_provider,
            meter_type=MeterType.ELECTRICITY,
            active_time_start=time(0),
            active_date_start=date(1999, 1, 1),
            watt_hour_cost=10,
            daily_fixed_cost=10,
            monthly_fixed_cost=10,
        )
        EnergyTariff.objects.create(
            type=EnergyTariff.Type.CASH_BACK_TARIFF,
            provider_account=self.energy_provider,
            meter_type=MeterType.ELECTRICITY,
            active_time_start=time(0),
            active_date_start=date(1999, 1, 1),
            watt_hour_cost=1,
            daily_fixed_cost=1,
            monthly_fixed_cost=1,
        )
        self.create_energy_history(is_detailed_history=False)

        result = aggregate_to_one(
            resources=Resource.objects.all(),
            unit=Unit.POUND_STERLING,
            aggregation_option=CostAggregationOption.CASH_BACK,
        )

        self.assertEqual(0, result.value)


class TestAggregationParamsSTEnergyMeters(EnergyHistoryBaseTestCase, SmartThingsSensorsBaseTestCase):
    URL = '/api/v1/energy-meters/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    def setUp(self):
        super().setUp()
        self.smart_things_device.capabilities.set([
            SmartThingsCapability.objects.get_or_create(capability=capability.value)[0]
            for capability in [Capability.POWER_METER, Capability.ENERGY_METER]
        ])
        self.smart_things_device.save()

        self.smart_things_energy_meter = SmartThingsEnergyMeter.objects.filter(
            device=self.smart_things_device,
            capability=Capability.POWER_METER
        ).get()
        self.smart_things_energy_meter.type = MeterType.ELECTRICITY
        self.smart_things_energy_meter.save()

    def test_smart_things_sensor_energy_cost(self):
        EnergyTariff.objects.create(
            type=EnergyTariff.Type.NORMAL,
            resource_id=self.smart_things_energy_meter.id,
            meter_type=MeterType.ELECTRICITY,
            active_time_start=time(0),
            active_time_end=None,
            active_date_start=datetime(2000, 1, 1, tzinfo=timezone.utc),
            active_date_end=None,
            watt_hour_cost=1,
            daily_fixed_cost=2,
            monthly_fixed_cost=3,
        )

        self.create_energy_history(
            is_detailed_history=False,
            default_rows=False,
            extra_rows=(
                (self.smart_things_energy_meter, datetime(2000, 10, 10, 10, 10, 10, tzinfo=timezone.utc)),
                (self.smart_things_energy_meter, datetime(2000, 10, 10, 10, 10, 20, tzinfo=timezone.utc)),
                (self.smart_things_energy_meter, datetime(2000, 10, 10, 10, 10, 30, tzinfo=timezone.utc)),
            ),
        )

        result = aggregate_to_one(
            resources=[self.smart_things_energy_meter],
            unit=Unit.POUND_STERLING,
        )

        self.assertEqual(15.0, result.value)

    def test_consumption_total_different_energy_types(self):
        self.create_energy_history(
            is_detailed_history=False,
            extra_rows=(
                (self.smart_things_energy_meter, datetime(2000, 10, 10, 10, 10, 10, tzinfo=timezone.utc)),
                (self.smart_things_energy_meter, datetime(2000, 10, 10, 10, 10, 20, tzinfo=timezone.utc)),
                (self.smart_things_energy_meter, datetime(2000, 10, 10, 10, 10, 30, tzinfo=timezone.utc)),
            ),
        )

        with self.subTest('ELECTRICITY'):
            response = self.client.get(
                self.get_url(
                    'aggregated-consumption',
                    'total',
                    query_param=dict(
                        unit=Unit.WATT.value,
                        meter_type=MeterType.ELECTRICITY.value
                    )
                ),
            )

            self.assertResponse(response)
            self.assertEqual(80.0, response.data.get('value'))

        with self.subTest('GAS'):
            response = self.client.get(
                self.get_url(
                    'aggregated-consumption',
                    'total',
                    query_param=dict(
                        unit=Unit.WATT.value,
                        meter_type=MeterType.GAS.value
                    )
                ),
            )
            self.assertResponse(response)
            self.assertEqual(40.0, response.data.get('value'))

        with self.subTest('TOTAL'):
            response = self.client.get(
                self.get_url(
                    'aggregated-consumption',
                    'total',
                    query_param=dict(
                        unit=Unit.WATT.value
                    )
                ),
            )
            self.assertResponse(response)
            self.assertEqual(120.0, response.data.get('value'))

