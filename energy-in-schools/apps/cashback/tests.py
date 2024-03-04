from datetime import datetime, timezone, date
from unittest.mock import Mock, patch, MagicMock

from django.test import override_settings

from apps.accounts.permissions import RoleName
from apps.cashback.cashback_calculation import calculate_daily_cash_back_for_location
from apps.cashback.models import OffPeakyPoint
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.main.base_test_case import BaseTestCase

datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = datetime(2000, 1, 4)


class TestLocationCashback(EnergyHistoryBaseTestCase, EnergyTariffBaseTestCase):
    FORCE_LOGIN_AS = RoleName.ES_USER
    URL = '/api/v1/energy-cashback/'

    def setUp(self):
        super().setUp()
        self.off_peaky_points = [
            OffPeakyPoint(day=date(2000, 1, 1), value=10.0, location=self.location),
            OffPeakyPoint(day=date(2000, 10, 1), value=15.0, location=self.location),
            OffPeakyPoint(day=date(2004, 1, 1), value=20.0, location=self.location),
            OffPeakyPoint(day=date(2006, 1, 1), value=25.0, location=self.location),
        ]
        self.extra_rows = tuple((self.energy_meter, datetime(2000, 1, 1 + data_index, hour, tzinfo=timezone.utc))
                           for data_index in range(3)
                           for hour in (18, 17, 10, 23, 6)  # TOU hours
                           )

        self.create_energy_history(
            default_rows=False,
            is_detailed_history=False,
            extra_rows=self.extra_rows,
            long_term_history_in_watt_hour=True,
        )

    @patch('apps.cashback.cashback_calculation.datetime', new=datetime_mock)
    @override_settings(OFF_PEAKY_POINTS_START_DATE=date(2000, 1, 1))
    def test_total_cashback(self):

        with self.subTest('Off-peaky creation'):
            for index, expected_value in enumerate((3.972814, 0.0, 0.0)):
                off_peaky, _, _ = OffPeakyPoint.create_or_update_for_location(self.location, datetime(2000, 1, 1 + index,
                                                                              tzinfo=timezone.utc).date())
                self.assertAlmostEqual(expected_value, off_peaky.value)

        with self.subTest('Total in response'):
            response = self.client.get(self.get_url(self.location.uid, 'total'))
            self.assertResponse(response)
            self.assertEqual(dict(current=3.972814, goal=1250.0), response.data)

        with self.subTest(f'Test off-peaky from to query params'):
            response = self.client.get(self.get_url(self.location.uid, 'total',
                                                    query_param={'from_': self.extra_rows[-2][1].date().isoformat(),
                                                                 'to': self.extra_rows[-1][1].date().isoformat()}))
            self.assertResponse(response)
            self.assertEqual(dict(current=0.0, goal=1250.0), response.data)

    @patch('apps.cashback.cashback_calculation.LearningDay.is_learning_day_by_default')
    def test_school_day_types(self, learning_day_mock: MagicMock):
        for test_name, is_school_day, expected_off_peaky in (
                ('school_day', True, 11.218196),
                ('non_school_day', False, 3.972814),
        ):
            learning_day_mock.return_value = is_school_day
            with self.subTest(test_name):
                off_peaky = calculate_daily_cash_back_for_location(self.location, datetime(2000, 1, 1).date())
                self.assertAlmostEqual(expected_off_peaky, off_peaky)

    @override_settings(OFF_PEAKY_POINTS_START_DATE=date(2000, 1, 1))
    def test_cash_back_retrieve(self):
        OffPeakyPoint.objects.bulk_create(self.off_peaky_points)

        response = self.client.get(self.get_url(self.location.uid))
        self.assertResponse(response)
        self.assertListEqual(
            [dict(day=str(off_peaky_point.day), value=off_peaky_point.value)
             for off_peaky_point in self.off_peaky_points[::-1]],
            response.data,
        )

    def test_off_peaky_calculations_start_date(self):
        OffPeakyPoint.objects.bulk_create(self.off_peaky_points)

        for off_peaky_calculations_start_date, expected_off_peaky_points in (
                (date(2000, 1, 1), 70.0),
                (date(2000, 10, 1), 60.0),
                (date(2001, 1, 1), 45.0),
                (date(2004, 1, 1), 45.0),
                (date(2005, 1, 1), 25.0),
                (date(2006, 1, 1), 25.0),
                (date(2006, 1, 2), 0.0),
        ):
            with self.subTest(off_peaky_calculations_start_date):
                with override_settings(OFF_PEAKY_POINTS_START_DATE=off_peaky_calculations_start_date):
                    response = self.client.get(self.get_url(self.location.uid, 'total'))
                    self.assertResponse(response)
                    self.assertEqual(expected_off_peaky_points, response.data['current'])

    def test_off_peaky_calculation_timezones(self):
        day = date(2000, 1, 1)

        # correct values were calculated manually
        for location_tz, off_peaky_points in (
                ('UTC', 3.972814),
                ('Europe/London', 3.972814),
                ('Poland', 1.409583286),
                ('Etc/GMT+3', 6.135279),
                ('US/Central', 0.466114),
                ('Singapore', 0.0),
        ):
            self._update_location_timezone(timezone=location_tz)

            with self.subTest(f'Test timezone {location_tz}'):
                self.assertAlmostEqual(
                    off_peaky_points,
                    calculate_daily_cash_back_for_location(self.location, day)
                )


class TestCustomCreateUpdateActions(BaseTestCase):
    URL = '/admin/cashback/offpeakypoint/{id}/change/'
    FORCE_LOGIN_AS = RoleName.ADMIN

    def test_update_off_peaky_points(self):
        update_data = {
            'location': self.location.id,
            'day': '2000-01-01',
            'value': 10.0,
            'calculate-off-peaky': 'on',
            '_save': 'Save'
        }
        off_peaky_object = OffPeakyPoint(day=date(2000, 1, 1), value=10.0, location=self.location)
        off_peaky_object.save()
        expected_update_value = calculate_daily_cash_back_for_location(self.location, off_peaky_object.day)
        self.client.post(self.URL.format(id=off_peaky_object.id), update_data)
        self.assertAlmostEqual(OffPeakyPoint.objects.get(id=off_peaky_object.id).value, expected_update_value)

    def test_create_off_peaky_point_with_no_value(self):
        off_peaky_point = OffPeakyPoint(
            location=self.location,
            day=date(2000, 1, 1),
        )
        off_peaky_point.save()

        expected_update_value = calculate_daily_cash_back_for_location(
            self.location,
            date(2000, 1, 1)
        )
        self.assertAlmostEqual(OffPeakyPoint.objects.get(id=off_peaky_point.id).value, expected_update_value)