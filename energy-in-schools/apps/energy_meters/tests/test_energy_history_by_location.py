from datetime import datetime, timezone
from http import HTTPStatus
from unittest.mock import Mock, patch

import pytz

from apps.accounts.permissions import RoleName
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.historical_data.models import LongTermHistoricalData
from apps.historical_data.types import PeriodicConsumptionType
from apps.resources.types import Unit


datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = datetime(2000, 2, 1, 4, tzinfo=timezone.utc)


class TestEnergyHistoryByLocation(EnergyHistoryBaseTestCase):
    URL = '/api/v1/energy-meters/aggregated-consumption/'
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN

    def test_live(self):
        time = self.create_detailed_history_fresh_data()

        response = self.client.get(
            self.get_url('live', query_param=dict(location_uid=self.location.uid))
        )

        self.assertResponse(response)
        self.assertEqual({
            'time': self.format_datetime(time),
            'value': 100,
            'unit': 'watt'
        }, response.data)

    def test_live_without_data(self):
        response = self.client.get(
            self.get_url('live', query_param=dict(location_uid=self.location.uid))
        )

        self.assertResponse(response, HTTPStatus.NO_CONTENT)

    def test_historical(self):
        self.create_energy_history(is_detailed_history=False)

        response = self.client.get(
            self.get_url(
                'historical',
                query_param=dict(
                    unit='watt',
                    location_uid=self.location.uid,
                    time_resolution='hour'
                )
            )
        )

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.WATT.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 10, tzinfo=timezone.utc)),
                    value=45,
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 11, tzinfo=timezone.utc)),
                    value=50,
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_historical_in_time_range(self):
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 9, 10, tzinfo=timezone.utc)),
        ), is_detailed_history=False)

        response = self.client.get(self.get_url(
            'historical',
            query_param={
                'location_uid': self.location.uid,
                'unit': 'watt',
                'time_resolution': 'hour',
                'from': datetime(2000, 10, 10, 10, tzinfo=timezone.utc).isoformat(),
                'to': datetime(2000, 10, 10, 11, tzinfo=timezone.utc).isoformat(),
            }
        ))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.WATT.value,
            values=[
                dict(
                    time=self.format_datetime(self.format_datetime(datetime(2000, 10, 10, 10, tzinfo=timezone.utc))),
                    value=45,
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_consumption_total(self):
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 6, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False, long_term_history_in_watt_hour=True)

        response = self.client.get(
            self.get_url(
                'total',
                query_param={
                    'from': datetime(2000, 10, 10, tzinfo=timezone.utc).isoformat(),
                    'to': datetime(2000, 10, 11, tzinfo=timezone.utc).isoformat(),
                    'location_uid': self.location.uid
                }
            )
        )

        self.assertResponse(response)
        self.assertDictEqual(dict(
            time=self.format_datetime(datetime(2000, 10, 10, 6, tzinfo=timezone.utc)),
            value=10,
            unit=Unit.WATT_HOUR.value
        ), response.data)

    def test_get_live_without_uid(self):
        time = self.create_detailed_history_fresh_data()

        response = self.client.get(
            self.get_url('live')
        )

        self.assertResponse(response)
        self.assertEqual({
            'time': self.format_datetime(time),
            'value': 100,
            'unit': 'watt'
        }, response.data)

    def test_get_live_with_wrong_uid(self):
        self.create_detailed_history_fresh_data()

        response = self.client.get(
            self.get_url(
                'live',
                query_param=dict(
                    location_uid='xxxxx'
                )
            )
        )

        self.assertResponse(response, HTTPStatus.NO_CONTENT)

    def test_es_user_get(self):
        self.client.force_login(self.get_user(RoleName.ES_USER))

        time = self.create_detailed_history_fresh_data()

        response = self.client.get(
            self.get_url('live', query_param=dict(location_uid=self.location.uid))
        )

        self.assertResponse(response)
        self.assertEqual({
            'time': self.format_datetime(time),
            'value': 100,
            'unit': 'watt'
        }, response.data)

    def test_historical_without_meter(self):
        self.energy_meter.delete()
        response = self.client.get(self.get_url('historical'))
        self.assertResponse(response, HTTPStatus.NO_CONTENT)

    def test_historical_cost_with_timezones(self):
        EnergyTariffBaseTestCase.create_TOU_energy_tariffs(self.energy_meter)
        day = datetime(2012, 7, 1, tzinfo=timezone.utc)
        LongTermHistoricalData.objects.bulk_create([
            LongTermHistoricalData(
                time=day.replace(hour=hour),
                value=hour + 1,
                resource=self.energy_meter,
            ) for hour in range(24)
        ])

        unit_rates = ([1] * 7) + ([2] * 16) + [3]  # unit rates per each hour

        for location_tz in ('UTC', 'Europe/London', 'Europe/Kiev', 'US/Central', 'Etc/GMT+12', 'Asia/Hong_Kong'):

            self._update_location_timezone(timezone=location_tz)
            offset = pytz.timezone(location_tz).utcoffset(day.replace(tzinfo=None)).seconds // 3600  # offset in hours
            unit_rates_with_offset = unit_rates[offset:] + unit_rates[0:offset]

            with self.subTest(f'Test timezone {location_tz}'):

                response = self.client.get(
                    self.get_url('historical', query_param=dict(
                        from_='2000-01-06T00:00:00+00:00',
                        unit='pound_sterling',
                        time_resolution='hour'
                    ))
                )

                self.assertResponse(response)

                self.assertListEqual(
                    [row['value'] for row in response.data['values']],
                    [value / 2 * unit_rate for value, unit_rate in zip(range(1, 25), unit_rates_with_offset)]
                )


class PeriodicConsumptionTestCase(EnergyHistoryBaseTestCase):
    URL = '/api/v1/energy-meters/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    @patch('apps.historical_data.utils.aggregations.datetime', new=datetime_mock)
    def test_periodical_consumption(self):
        self.create_energy_history(
            extra_rows=(
                # SUMMER_WEEKDAYS (expected: {1: 5.0, 15: 20.0})
                (self.energy_meter, datetime(1999, 5, 3, 1, tzinfo=timezone.utc)),  # VALUE=0 HOUR=1
                (self.energy_meter, datetime(1999, 6, 1, 1, tzinfo=timezone.utc)),  # VALUE=10 HOUR=1
                (self.energy_meter, datetime(1999, 9, 1, 15, tzinfo=timezone.utc)),  # VALUE=20 HOUR=15

                # WINTER_WEEKENDS (expected: {5: 35.0})
                (self.energy_meter, datetime(2000, 1, 1, 5, tzinfo=timezone.utc)),  # VALUE=30 HOUR=5
                (self.energy_meter, datetime(1999, 2, 21, 5, tzinfo=timezone.utc)),  # VALUE=40 HOUR=5

                # WINTER_WEEKDAYS (expected: {10: 65.0, 2: 90.0, 3: 100.0})
                (self.energy_meter, datetime(1999, 12, 31, 10, tzinfo=timezone.utc)),  # VALUE=50 HOUR=10
                (self.energy_meter, datetime(2000, 1, 3, 10, tzinfo=timezone.utc)),  # VALUE=60 HOUR=10
                (self.energy_meter, datetime(2000, 1, 4, 10, tzinfo=timezone.utc)),  # VALUE=70 HOUR=10
                (self.energy_meter, datetime(1999, 2, 24, 10, tzinfo=timezone.utc)),  # VALUE=80 HOUR=10
                (self.energy_meter, datetime(2000, 1, 5, 2, tzinfo=timezone.utc)),  # VALUE=90 HOUR=2
                (self.energy_meter, datetime(2000, 2, 1, 3, tzinfo=timezone.utc)),  # VALUE=100 HOUR=3

                # SHOULDN'T BE INCLUDED TO RESULT (only recent 365 days):
                (self.energy_meter, datetime(1998, 5, 1, 1, tzinfo=timezone.utc)),  # summer_weekend VALUE=110 HOUR=1
                (self.energy_meter, datetime(1998, 5, 8, 1, tzinfo=timezone.utc)),  # summer_weekend VALUE=120 HOUR=1
                (self.energy_meter, datetime(1998, 5, 15, 15, tzinfo=timezone.utc)),  # summer_weekend VALUE=130 HOUR=15
                (self.energy_meter, datetime(1999, 1, 31, 10, tzinfo=timezone.utc)),  # winter_weekday VALUE=140 HOUR=10

            ),
            default_rows=False,
            is_detailed_history=False,
        )

        for period, unit, expected_status, expected_values in (
            (PeriodicConsumptionType.SUMMER_WEEKENDS, Unit.WATT, HTTPStatus.NO_CONTENT, None),
            (PeriodicConsumptionType.SUMMER_WEEKDAYS, Unit.KILOWATT, HTTPStatus.OK, [
                dict(hour=1, value=0.005),
                dict(hour=15, value=0.02),
            ]),
            (PeriodicConsumptionType.WINTER_WEEKENDS, Unit.WATT, HTTPStatus.OK, [
                dict(hour=5, value=35.0),
            ]),
            (PeriodicConsumptionType.WINTER_WEEKDAYS, Unit.WATT, HTTPStatus.OK, [
                dict(hour=2, value=90.0),
                dict(hour=3, value=100.0),
                dict(hour=10, value=65.0),
            ]),
        ):
            with self.subTest(f'Period: {period.value}'):
                response = self.client.get(self.get_url(
                    self.energy_meter.id, 'periodic-consumption',
                    query_param=dict(
                        period=period.value,
                        unit=unit.value
                    )
                ))

                self.assertResponse(response, expected_status=expected_status)
                if expected_values:
                    self.assertEqual(expected_values, list(map(dict, response.data['values'])))
                    self.assertEqual(unit.value, response.data['unit'])

    @patch('apps.historical_data.utils.aggregations.datetime', new=datetime_mock)
    def test_fill_gaps(self):
        self.create_energy_history(
            extra_rows=(
                # SUMMER_WEEKDAYS (expected: {1: 5.0})
                (self.energy_meter, datetime(1999, 5, 3, 1, tzinfo=timezone.utc)),  # VALUE=0 HOUR=1
                (self.energy_meter, datetime(1999, 6, 1, 1, tzinfo=timezone.utc)),  # VALUE=10 HOUR=1
            ),
            default_rows=False,
            is_detailed_history=False,
        )

        response = self.client.get(self.get_url(
            self.energy_meter.id, 'periodic-consumption',
            query_param=dict(
                period=PeriodicConsumptionType.SUMMER_WEEKDAYS.value,
                fill_gaps=True
            )
        ))

        self.assertResponse(response)

        values = [{'hour': hour, 'value': None} for hour in range(24)]
        values[1] = {'hour': 1, 'value': 5.0}
        self.assertEqual(values, list(map(dict, response.data['values'])))
