from typing import TYPE_CHECKING
from datetime import datetime, timedelta, timezone, date
from unittest.mock import patch, Mock, MagicMock

from django.test import override_settings

from apps.accounts.permissions import RoleName
from apps.cashback.models import OffPeakyPoint
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.energy_providers.models import Provider
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase

if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter

datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = datetime(2000, 1, 10)


class TestLeaderboard(EnergyHistoryBaseTestCase, EnergyTariffBaseTestCase, SmartThingsSensorsBaseTestCase):
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN
    URL = '/api/v1/leaderboard/'

    @patch('apps.cashback.cashback_calculation.datetime', new=datetime_mock)
    @override_settings(OFF_PEAKY_POINTS_START_DATE=date(2000, 1, 1))
    def test_cashback_leaderboard(self):
        self._update_location_timezone()
        extra_rows = tuple((self.energy_meter, datetime(2000, 1, 1 + data_index, tzinfo=timezone.utc))
                           for data_index in range(3))

        self.create_energy_history(
            default_rows=False,
            is_detailed_history=False,
            extra_rows=extra_rows,
            long_term_history_in_watt_hour=True,
        )

        for row in extra_rows:
            OffPeakyPoint.create_or_update_for_location(self.location, row[1].date())

        response = self.client.get(self.get_url('cashback'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(3, len(data))
        first_school = next((location for location in data if location["location_name"] == "school #0"), None)
        self.assertIsNotNone(first_school)
        self.assertEqual(dict(current=34.599335, goal=1250.0), first_school['cashback'])

    def test_always_on_leaderboard(self):
        mock_energy_value_date = datetime.now(tz=timezone.utc).replace(hour=2)
        self.create_energy_history(
            default_rows=False,
            is_detailed_history=False,
            long_term_history_in_watt_hour=True,
            extra_rows=(
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=8)),
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=3)),
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=3, days=1)),
            ))
        response = self.client.get(self.get_url('always-on'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(1, len(data))
        first_school = next((location for location in data if location["location_name"] == "school #0"), None)
        self.assertIsNotNone(first_school)
        self.assertEqual({
            'value': 30.0,
            'unit': 'watt',
        }, first_school['always_on_energy'])

    def test_always_on_leaderboard_no_data(self):
        response = self.client.get(self.get_url('always-on'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(0, len(data))

    def test_leaderboard_with_dummy(self):
        mock_energy_value_date = datetime.now(tz=timezone.utc).replace(hour=2)
        dummy_energy_provider = self.create_energy_provider(provider=Provider.DUMMY, name='dummy')
        dummy_energy_meter = self._create_meter(dummy_energy_provider)
        dummy_st_energy_meter = self._create_ST_meter(dummy_energy_provider)
        self.create_energy_tariff_for_meter(dummy_energy_meter)
        self.create_energy_tariff_for_meter(dummy_st_energy_meter)
        self.create_energy_history(
            default_rows=False,
            is_detailed_history=False,
            long_term_history_in_watt_hour=True,
            extra_rows=(
                (dummy_energy_meter, mock_energy_value_date - timedelta(weeks=8)),
                (dummy_energy_meter, mock_energy_value_date - timedelta(weeks=3)),
                (dummy_energy_meter, mock_energy_value_date - timedelta(weeks=3, days=1)),
                (dummy_st_energy_meter, mock_energy_value_date - timedelta(weeks=8)),
                (dummy_st_energy_meter, mock_energy_value_date - timedelta(weeks=3)),
                (dummy_st_energy_meter, mock_energy_value_date - timedelta(weeks=3, days=1)),
            ),
        )
        with self.subTest('cashback'):
            response = self.client.get(self.get_url('cashback'))
            self.assertResponse(response)
            first_school = next((location for location in response.data if location["location_name"] == "school #0"), None)
            self.assertEqual({'current': 0.0, 'goal': 1250.0}, first_school['cashback'])

        with self.subTest('always-on'):
            response = self.client.get(self.get_url('always-on'))
            self.assertResponse(response)
            self.assertEqual([], response.data)

    @override_settings(OFF_PEAKY_POINTS_START_DATE=date(2000, 1, 1))
    @patch('apps.cashback.cashback_calculation.LearningDay.is_learning_day_by_default', side_effect=[True, True, False])
    def test_ST_meters_included(self, _: MagicMock):
        mock_energy_value_date = datetime.now(tz=timezone.utc).replace(hour=2)
        st_energy_meter = self._create_ST_meter(provider=None)
        self.create_energy_tariff()
        self.create_energy_tariff_for_meter(st_energy_meter)

        extra_rows = (
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=8)),
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=3)),
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=3, days=1)),
                (st_energy_meter, mock_energy_value_date - timedelta(weeks=8)),
                (st_energy_meter, mock_energy_value_date - timedelta(weeks=3)),
                (st_energy_meter, mock_energy_value_date - timedelta(weeks=3, days=1)),
        )

        self.create_energy_history(
            default_rows=False,
            is_detailed_history=False,
            long_term_history_in_watt_hour=True,
            extra_rows=extra_rows
        )

        for row in extra_rows[:3]:  # unique constraint
            OffPeakyPoint.create_or_update_for_location(self.location, row[1].date())

        with self.subTest('cashback'):
            response = self.client.get(self.get_url('cashback'))
            self.assertResponse(response)
            first_school = next((location for location in response.data if location["location_name"] == "school #0"), None)
            self.assertEqual({'current': 60.608701, 'goal': 1250.0}, first_school['cashback'])

        with self.subTest('always-on'):
            response = self.client.get(self.get_url('always-on'))
            self.assertResponse(response)
            first_school = next((location for location in response.data if location["location_name"] == "school #0"), None)
            self.assertEqual({
                'value': 120.0,
                'unit': 'watt',
            }, first_school['always_on_energy'])

    def _create_meter(self, provider) -> 'EnergyMeter':
        dummy_energy_meter = self.create_energy_meter(meter_id='dummy-energy-meter')
        dummy_energy_meter.provider_account = provider
        dummy_energy_meter.save()
        return dummy_energy_meter

    def _create_ST_meter(self, provider):
        dummy_st_energy_meter = self.create_smart_things_energy_meter()
        dummy_st_energy_meter.provider_account = provider
        dummy_st_energy_meter.save()
        return dummy_st_energy_meter
