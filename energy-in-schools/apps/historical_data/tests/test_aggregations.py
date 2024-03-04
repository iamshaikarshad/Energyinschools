from datetime import datetime, timedelta, timezone

from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.types import SUMMER_RANGE, WINTER_RANGE
from apps.historical_data.utils import aggregations
from apps.historical_data.utils.aggregation_params_manager import AggregationParamsManager
from apps.historical_data.utils.aggregations import TimeValuePair, TimeValueWithComparison, \
    _get_comparison_datetime_cutter, \
    aggregate_to_list_with_comparison, _get_current_period_date_ranges
from apps.resources.models import Resource
from apps.resources.types import TimeResolution, Unit


class TestEnergyHistory(EnergyHistoryBaseTestCase):
    def test_aggregate_to_list(self):
        energy_meter_2 = self._create_energy_meter()

        self.create_energy_history(extra_rows=(
            (self.energy_meter, datetime(2000, 10, 10, 12, 10, 30, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 12, 11, 30, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 10, 0, 0, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 13, 00, 00, tzinfo=timezone.utc)),
            (energy_meter_2, datetime(2000, 10, 10, 12, 00, 00, tzinfo=timezone.utc)),
            (energy_meter_2, datetime(2000, 10, 10, 12, 10, 00, tzinfo=timezone.utc)),
        ), is_detailed_history=False)

        results = list(aggregations.aggregate_to_list(AggregationParamsManager().get_aggregation_rules(
            resources=[self.energy_meter, energy_meter_2],
            unit=Unit.WATT,
            time_resolution=TimeResolution.HOUR,
            from_=datetime(2000, 10, 10, 10, 0, 0, tzinfo=timezone.utc),
            to=datetime(2000, 10, 10, 13, 00, 00, tzinfo=timezone.utc),
        )))

        self.assertEqual(
            [
                TimeValuePair(
                    time=datetime(2000, 10, 10, 10, 0, 0, tzinfo=timezone.utc),
                    value=110 / 4
                ),
                TimeValuePair(
                    time=datetime(2000, 10, 10, 12, 0, tzinfo=timezone.utc),
                    value=130 / 2 + 210 / 2
                )
            ],
            results
        )

    def test_aggregate_to_list_maximal_time_resolution(self):
        energy_meter_2 = self._create_energy_meter()

        self.create_energy_history(extra_rows=(
            (self.energy_meter, datetime(2001, 10, 10, 10, 0, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2001, 10, 10, 10, 1, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2001, 10, 10, 10, 2, tzinfo=timezone.utc)),
            (energy_meter_2, datetime(2001, 10, 10, 10, 1, tzinfo=timezone.utc)),
            (energy_meter_2, datetime(2001, 10, 10, 10, 2, tzinfo=timezone.utc)),
        ))

        results = list(aggregations.aggregate_to_list(AggregationParamsManager().get_aggregation_rules(
            resources=[self.energy_meter, energy_meter_2],
            unit=Unit.WATT,
            time_resolution=TimeResolution.MINUTE,
            from_=datetime(2001, 10, 10, 10, 0, 0, tzinfo=timezone.utc),
            to=datetime(2001, 10, 10, 11, 0, 0, tzinfo=timezone.utc),
        )))

        self.assertEqual(
            [
                TimeValuePair(
                    time=datetime(2001, 10, 10, 10, 0, tzinfo=timezone.utc),
                    value=60,
                ),
                TimeValuePair(
                    time=datetime(2001, 10, 10, 10, 1, tzinfo=timezone.utc),
                    value=70 + 90
                ),
                TimeValuePair(
                    time=datetime(2001, 10, 10, 10, 2, tzinfo=timezone.utc),
                    value=80 + 100
                ),
            ],
            results
        )

    def test_comparison(self):
        self.create_energy_history(extra_rows=(
            (self.energy_meter, datetime(2000, 10, 10, 10, 0, 00, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 10, 0, 20, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 11, 0, 20, tzinfo=timezone.utc)),

            (self.energy_meter, datetime(2000, 10, 11, 10, 0, 00, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 11, 12, 0, 00, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False)

        results = list(aggregations.aggregate_to_list_with_comparison(
            aggregation_rules=AggregationParamsManager().get_aggregation_rules(
                resources=[self.energy_meter],
                unit=Unit.WATT,
                time_resolution=TimeResolution.HOUR,
                from_=datetime(2000, 10, 11, 10, 0, 0, tzinfo=timezone.utc),
                to=datetime(2000, 10, 11, 13, 0, 00, tzinfo=timezone.utc)
            ),
            compare_from=datetime(2000, 10, 10, 10, 0, 0, tzinfo=timezone.utc),
            compare_to=datetime(2000, 10, 10, 13, 0, 00, tzinfo=timezone.utc),
        ))

        self.assertEqual(
            [
                TimeValueWithComparison(
                    time=datetime(2000, 10, 11, 10, 0, 0, tzinfo=timezone.utc),
                    value=30,
                    cmp_value=5,
                ),
                TimeValueWithComparison(
                    time=datetime(2000, 10, 11, 11, 0, 0, tzinfo=timezone.utc),
                    value=None,
                    cmp_value=20,
                ),
                TimeValueWithComparison(
                    time=datetime(2000, 10, 11, 12, 0, 0, tzinfo=timezone.utc),
                    value=40,
                    cmp_value=None,
                ),
            ],
            results
        )

    def test__get_comparison_datetime_cutter(self):
        source_datetime = datetime(2000, 10, 10, 10)

        cutter = _get_comparison_datetime_cutter(
            TimeResolution.WEEK,
            source_datetime
        )

        self.assertEqual(
            datetime(2000, 10, 11, 10),
            cutter(datetime(2000, 10, 10 + 8, 10))
        )

        self.assertEqual(
            datetime(2000, 10, 14, 10),
            cutter(datetime(2000, 10, 10 + 4, 10))
        )

    def _create_energy_meter(self):
        return EnergyMeter.objects.create(
            meter_id='the some id 2',
            type=MeterType.GAS,
            provider_account=self.energy_provider,
            sub_location=self.location,
        )

    def test_with_local_time(self):
        self.create_energy_history(
            extra_rows=(
                (self.energy_meter, datetime(2000, 10, 8, tzinfo=timezone.utc) + timedelta(minutes=30 * index))
                for index in range(2 * 24 * 30)
            ),
            default_rows=False,
            is_detailed_history=False
        )

        tz_info = timezone(offset=timedelta(hours=-2))
        for from_, to, compare_from, compare_to, time_resolution, count, first, last in (
                (
                        datetime(2000, 10, 16, tzinfo=tz_info),
                        datetime(2000, 10, 23, tzinfo=tz_info),
                        datetime(2000, 10, 9, tzinfo=tz_info),
                        datetime(2000, 10, 16, tzinfo=tz_info),
                        TimeResolution.DAY,
                        7,
                        TimeValueWithComparison(
                            time=datetime(2000, 10, 16, 2, 0, tzinfo=timezone.utc),
                            value=4115.0,
                            cmp_value=755.0
                        ),
                        TimeValueWithComparison(
                            time=datetime(2000, 10, 22, 2, 0, tzinfo=timezone.utc),
                            value=6995.0,
                            cmp_value=3635.0
                        ),
                ),
                (
                        datetime(2000, 10, 11, tzinfo=tz_info),
                        datetime(2000, 10, 12, tzinfo=tz_info),
                        datetime(2000, 10, 9, tzinfo=tz_info),
                        datetime(2000, 10, 10, tzinfo=tz_info),
                        TimeResolution.HOUR,
                        24,
                        TimeValueWithComparison(
                            time=datetime(2000, 10, 11, 2, 0, tzinfo=timezone.utc),
                            value=1485.0,
                            cmp_value=525.0
                        ),
                        TimeValueWithComparison(
                            time=datetime(2000, 10, 12, 1, 0, tzinfo=timezone.utc),
                            value=1945.0,
                            cmp_value=985.0
                        ),
                ),
        ):
            with self.subTest(time_resolution.value):
                result = list(
                    aggregate_to_list_with_comparison(
                        aggregation_rules=AggregationParamsManager().get_aggregation_rules(
                            resources=Resource.objects.all(),
                            time_resolution=time_resolution,
                            from_=from_,
                            to=to,
                        ),
                        compare_from=compare_from,
                        compare_to=compare_to,
                    )
                )

                self.assertEqual(count, len(result))
                self.assertEqual(first, result[0])
                self.assertEqual(last, result[-1])

    def test_get_current_period_date_ranges_function(self):  # Test has dependency on SUMMER_RANGE and WINTER_RANGE constants
        year = 2000

        for current_datetime, expected_summer_ranges, expected_winter_ranges in (
            (
                datetime(year, 2, 1, tzinfo=timezone.utc),
                [(datetime(year-1, 4, 1).date(), datetime(year-1, 9, 30).date())],
                [
                    (datetime(year-1, 10, 1).date(), datetime(year, 2, 1).date()),
                    (datetime(year-1, 2, 1).date(), datetime(year-1, 3, 31).date()),
                ],
            ),
            (
                datetime(year, 5, 15, tzinfo=timezone.utc),
                [
                    (datetime(year, 4, 1).date(), datetime(year, 5, 15).date()),
                    (datetime(year-1, 5, 15).date(), datetime(year-1, 9, 30).date()),
                ],
                [(datetime(year-1, 10, 1).date(), datetime(year, 3, 31).date())],
            ),
            (
                datetime(year, 9, 30, tzinfo=timezone.utc),
                [(datetime(year, 4, 1).date(), datetime(year, 9, 30).date())],
                [(datetime(year-1, 10, 1).date(), datetime(year, 3, 31).date())],
            ),
            (
                datetime(year, 12, 1, tzinfo=timezone.utc),
                [(datetime(year, 4, 1).date(), datetime(year, 9, 30).date())],
                [
                    (datetime(year, 10, 1).date(), datetime(year, 12, 1).date()),
                    (datetime(year-1, 12, 1).date(), datetime(year, 3, 31).date()),
                ],
            ),
        ):
            with self.subTest(f'Year: {year}, Month: {current_datetime.month}, Day: {current_datetime.day}'):

                summer_ranges = _get_current_period_date_ranges(SUMMER_RANGE, current_datetime)
                winter_ranges = _get_current_period_date_ranges(WINTER_RANGE, current_datetime)

                self.assertEqual(expected_summer_ranges,
                                 list(map(lambda x: (x[0].date(), x[1].date()), summer_ranges)))

                self.assertEqual(expected_winter_ranges,
                                 list(map(lambda x: (x[0].date(), x[1].date()), winter_ranges)))

    def test_from_parameter_first_value_included(self):
        self.create_energy_history(
            extra_rows=(
                (self.energy_meter, datetime(2000, 10, 8, 10, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 10, 9, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 10, 10, tzinfo=timezone.utc)),
            ),
            default_rows=False,
            is_detailed_history=False
        )

        result = list(aggregations.aggregate_to_list(
            aggregation_rules=AggregationParamsManager().get_aggregation_rules(
                resources=[self.energy_meter],
                time_resolution=TimeResolution.DAY,
                from_=datetime(2000, 10, 8, 1, tzinfo=timezone.utc),
            ),
        ))
        self.assertEqual(3, len(result))
        self.assertListEqual(
            [(datetime(2000, 10, 8, tzinfo=timezone.utc), 0.0),
             (datetime(2000, 10, 9, tzinfo=timezone.utc), 10.0),
             (datetime(2000, 10, 10, tzinfo=timezone.utc), 20.0)],
            result,
        )
