from datetime import datetime, timezone, timedelta
from itertools import cycle
from unittest.mock import MagicMock, patch

import factory
from django.db.models.signals import post_save
from django.test import override_settings

from apps.accounts.permissions import RoleName
from apps.cashback.models import OffPeakyPoint
from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.leaderboard.serializers import LeaguePointsUnit
from apps.locations.models import Location
from apps.registration_requests.models import RegistrationRequest
from apps.registration_requests.types import Status


class TestLeagues(EnergyHistoryBaseTestCase, EnergyTariffBaseTestCase):
    FORCE_LOGIN_AS = RoleName.ES_USER
    URL = '/api/v1/leaderboard/leagues/'

    @override_settings(TEST_MODE=False)
    def test_leaderboard_only_for_accepted_locations(self):
        self._create_location_meters_and_energy_data()
        with factory.django.mute_signals(post_save):
            location_with_trial = self.get_user(school_number=1).location
            registration_request_trial = RegistrationRequest(
                status=Status.TRIAL_ACCEPTED,
                registered_school=location_with_trial,

            )
            registration_request_trial.save()

            location_accepted = self.get_user(school_number=2).location
            registration_request_accepted = RegistrationRequest(
                status=Status.ACTIVATION_ACCEPTED,
                registered_school=location_accepted,

            )
            registration_request_accepted.save()

        response = self.client.get(self.get_url('electricity-live'))
        self.assertResponse(response)
        data = response.data
        self.assertEqual(2, data['total_members'])
        self.assertIsNone(
            next(filter(lambda member: member['location_uid'] == location_with_trial.uid, data['members']), None)
        )

    def test_electricity_league_last_place(self):
        self._create_location_meters_and_energy_data(reverse=True)

        response = self.client.get(self.get_url('electricity-live'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(3, data['total_members'])
        self.assertEqual(3, data['own_rank'])
        self.assertEqual(30.0, data['own_points'])
        self.assertEqual(3, len(data['members']))
        self.assertEqual(self.location.uid, data['members'][-1]['location_uid'])

    def test_electricity_league_first_place(self):
        self._create_location_meters_and_energy_data()

        response = self.client.get(self.get_url('electricity-live'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(3, data['total_members'])
        self.assertEqual(1, data['own_rank'])
        self.assertEqual(10.0, data['own_points'])
        self.assertEqual(3, len(data['members']))
        self.assertEqual(self.location.uid, data['members'][0]['location_uid'])

    def test_electricity_league_in_the_middle_place(self):
        self._create_location_meters_and_energy_data(in_middle=True)

        response = self.client.get(self.get_url('electricity-live'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(3, data['total_members'])
        self.assertEqual(2, data['own_rank'])
        self.assertEqual(20.0, data['own_points'])
        self.assertEqual(3, len(data['members']))
        self.assertEqual(self.location.uid, data['members'][1]['location_uid'])

    @patch('apps.leaderboard.views.energy_dashboard_leagues.DashboardLeaguesViewSet.get_queryset',
           return_value=Location.objects.none())
    def test_electricity_league_no_schools(self, _: MagicMock):
        response = self.client.get(self.get_url('electricity-live'))
        self.assertResponse(response)
        data = response.data
        self.assertEqual(0, len(data['members']))

    @patch('apps.leaderboard.views.energy_dashboard_leagues.DashboardLeaguesViewSet.get_queryset')
    def test_electricity_league_only_own_school(self, queryset_mock: MagicMock):
        self._create_location_meters_and_energy_data()
        queryset_mock.return_value = Location.objects.filter(id=self.location.id)

        response = self.client.get(self.get_url('electricity-live'))
        self.assertResponse(response)
        data = response.data
        self.assertEqual(data['own_rank'], data['total_members'])
        self.assertEqual(1, len(data['members']))

    def test_electricity_yesterday_usage_league(self):
        self._create_location_meters_and_energy_data()

        response = self.client.get(self.get_url('electricity-yesterday'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(3, data['total_members'])
        self.assertEqual(1, data['own_rank'])
        self.assertEqual(5.0, data['own_points'])
        self.assertEqual(3, len(data['members']))
        self.assertEqual(self.location.uid, data['members'][0]['location_uid'])

    def test_gas_league(self):
        self._create_location_meters_and_energy_data(energy_type=EnergyMeter.Type.GAS, reverse=True)

        response = self.client.get(self.get_url('gas'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(data['own_rank'], data['total_members'])
        self.assertEqual(3, len(data['members']))
        self.assertEqual(15.0, data['own_points'])
        self.assertEqual(self.location.uid, data['members'][-1]['location_uid'])

    @patch('apps.cashback.cashback_calculation.LearningDay.is_learning_day_by_default', return_value=True)
    def test_off_peak_points_league(self, _: MagicMock):
        self.create_energy_tariff()
        self._create_location_meters_and_energy_data(energy_type=EnergyMeter.Type.ELECTRICITY, reverse=True)

        response = self.client.get(self.get_url('off-peak-points'))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(1, data['own_rank'])
        self.assertEqual(LeaguePointsUnit.POINT.value, data['points_unit'])
        self.assertEqual(3, len(data['members']))
        self.assertEqual(self.location.uid, data['members'][0]['location_uid'])
        self.assertEqual(26.01, data['members'][0]['league_points'])

    @override_settings(TEST_MODE=False)
    def test_locations_is_test_filter(self):
        Location.objects.update(is_test=True)
        with self.subTest('electricity'):
            response = self.client.get(self.get_url('electricity-live'))
            self.assertEqual(1, response.data['total_members'])
            self.assertEqual(self.get_user().location.uid, response.data['members'][0]['location_uid'])
        with self.subTest('gas'):
            response = self.client.get(self.get_url('gas'))
            self.assertEqual(1, response.data['total_members'])
            self.assertEqual(self.get_user().location.uid, response.data['members'][0]['location_uid'])

    @patch('apps.leaderboard.views.energy_dashboard_leagues.DashboardLeaguesViewSet.get_queryset')
    def test_minimal_number_locations_in_leagues(self, mocked_location_queryset: MagicMock):
        self._create_location_meters_and_energy_data(energy_type=EnergyMeter.Type.ELECTRICITY, reverse=True)

        all_locations = Location.get_schools()
        SCHOOLS_TO_TEST = 3

        for number_locations in range(0, SCHOOLS_TO_TEST):
            locations_to_return = all_locations.filter(
                id__in=[location.id for location in all_locations[number_locations:]]
            )

            mocked_location_queryset.return_value = locations_to_return

            with self.subTest(f'Test {len(locations_to_return)} location'):
                response = self.client.get(self.get_url('electricity-yesterday'))

                self.assertResponse(response)
                data = response.data
                self.assertEqual(SCHOOLS_TO_TEST - number_locations, data['total_members'])
                self.assertEqual(SCHOOLS_TO_TEST - number_locations, data['own_rank'])
                self.assertEqual(SCHOOLS_TO_TEST - number_locations, len(data['members']))
