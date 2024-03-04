import json
from http import HTTPStatus
from unittest.mock import patch
from datetime import date

from apps.accounts.permissions import RoleName
from apps.addresses.models import Address
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.locations.models import Location
from apps.cashback.models import OffPeakyPoint
from apps.main.base_test_case import BaseTestCase, AdminBaseTestCase
from apps.locations.constants import CALCULATE_OFF_PEAKY_POINTS_MESSAGE


class TestLocations(EnergyHistoryBaseTestCase):
    URL = '/api/v1/locations/'
    ALL_LOCATIONS = 7
    OWN_LOCATIONS = 3

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        location_data = cls.get_request_data()
        cls.sub_location = Location(
            address=Address.objects.create(**location_data.pop('address')),
            parent_location=cls.get_user().location,
            **location_data,
        )
        cls.sub_location.save()

    def setUp(self):
        super().setUp()
        self.client.force_login(self.get_user())

    @staticmethod
    def get_request_data():
        return {
            'name': 'some name',
            'description': 'some desc',
            'address': {
                'line_1': 'some address',
            },
            'current_theme': None,
        }

    def test_create(self):
        user = self.get_user()
        request_data = {
            'name': 'some name2',
            'description': 'some desc2',
            'address': {
                'line_1': 'some address2',
                'city': 'the city',
                'post_code': 'the post code'
            }
        }

        with self.subTest('Create'):
            response = self.client.post(self.get_url(), request_data, content_type='application/json')

            self.assertResponse(response, HTTPStatus.CREATED)

            location = Location.objects.last()
            self.assertDictValuesOnly(request_data, location)

            self.assertEqual(user.location.id, location.parent_location.id)

    def test_list(self):
        response = self.client.get(self.get_url())

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(self.ALL_LOCATIONS, len(response.data))

    @patch('django.conf.settings.TEST_MODE', False)
    def test_list_test_mode_false(self):
        own_testing_location = Location.objects.first()

        # create another test location
        Location.objects.create(
            name=f'school #3',
            description=f'The School Number 3',
            address=Address.objects.create(line_1=f'school address'),
            is_test=True
        )

        own_testing_location.is_test = True

        own_testing_location.save()

        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual(len(response.data), len(Location.objects.all()) - 1)

    @patch('django.conf.settings.TEST_MODE', False)
    def test_get_energy_mood_anonym(self):
        """Get current energy mood per location"""

        self.create_detailed_history_fresh_data()

        self.client.logout()

        # XXX TODO Try in different location
        response = self.client.get(self.get_url(self.location.uid, 'energy-mood', query_param={
            'uid': 'true'
        }))

        self.assertResponse(response, HTTPStatus.UNAUTHORIZED)

    def test_list_test_mode_true(self):
        own_testing_location = Location.objects.first()

        # create another test location
        Location.objects.create(
            name=f'school #3',
            description=f'The School Number 3',
            address=Address.objects.create(line_1=f'school address'),
            is_test=True
        )

        own_testing_location.is_test = True

        own_testing_location.save()

        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual(len(response.data), len(Location.objects.all()))

    def test_list_only_own(self):
        response = self.client.get(self.get_url(query_param=dict(own_location_only='true')))

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(self.OWN_LOCATIONS, len(response.data))

    def test_repr(self):
        repr(Location.objects.first())

    def test_str(self):
        str(Location.objects.first())

    def test_retrieve(self):
        response = self.client.get(self.get_url(self.sub_location.id))

        self.assertEqual(HTTPStatus.OK, response.status_code)
        data = response.data.copy()
        self.assertEqual(len(data.pop('uid')), 5)
        self.assertTrue(len(data.pop('created_at')))
        self.assertDictValuesOnly({
            'is_sub_location': True,
            'id': self.sub_location.id,
            'parent_location_id': self.location.id,
            **self.get_request_data()
        }, data)

    def test_update_root_location(self):
        response = self.client.patch(self.get_url(self.get_user().location.id), json.dumps({
            'description': 'new'
        }), content_type='application/json')

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)

    def test_update_sub_location(self):
        response = self.client.patch(self.get_url(self.sub_location.id), json.dumps({
            'description': 'new',
            'address': {
                'line_1': 'new line 1'
            },
        }), content_type='application/json')

        self.assertEqual(HTTPStatus.OK, response.status_code)
        data = response.data.copy()
        self.assertEqual(len(data.pop('uid')), 5)
        self.assertTrue(len(data.pop('created_at')))
        self.assertDictValuesOnly({
            **self.get_request_data(),
            'is_sub_location': True,
            'id': self.sub_location.id,
            'parent_location_id': self.location.id,
            'description': 'new',
            'address': {
                **self.get_request_data()['address'],
                'line_1': 'new line 1',
            }
        }, data)

    def test_get_energy_mood(self):
        """Get current energy mood per location"""

        self.create_detailed_history_fresh_data()

        # XXX TODO Try in different location
        response = self.client.get(self.get_url(self.location.id, 'energy-mood'))

        self.assertIn(response.json()['electricity'], range(1, 6))

    def test_get_uid_or_id(self):
        """Get by id and by uid"""

        response = self.client.get(self.get_url(self.location.id))

        self.assertEqual(HTTPStatus.OK, response.status_code)

        get_by_id_school = response.json()

        response = self.client.get(self.get_url(self.location.uid, query_param={'uid': 'true'}))

        self.assertEqual(HTTPStatus.OK, response.status_code)

        get_by_uid_school = response.json()

        self.assertEqual(get_by_uid_school['id'], get_by_id_school['id'])

    def test_with_sub_locations__for_parent(self):
        with self.subTest('for parent'):
            self.assertEqual(
                sorted([
                    self.location,
                    *self.location.sub_locations.all()
                ], key=lambda location: location.id),
                sorted(list(self.location.with_sub_locations), key=lambda location: location.id),
            )

        with self.subTest('for sub location'):
            self.assertEqual([
                self.sub_location
            ], list(self.sub_location.with_sub_locations))


class TestCreateOffPeakyPointsForLocation(BaseTestCase, AdminBaseTestCase):
    FORCE_LOGIN_AS = RoleName.ADMIN
    URL = '/admin/locations/location/calculate-off-peaky-points/'

    def test_non_admin_access(self):
        super().check_non_admin_access(url=f'{self.URL}?ids={self.location.id}')

    def setUp(self):
        super().setUp()
        OffPeakyPoint.objects.create(day=date(2000, 1, 1), value=10.0, location=self.location)

    def test_update_off_peaky_points(self):
        second_test_location = Location.objects.exclude(id=self.location.id).first()

        test_data_sets = [
            self.CHECK_RESULT_PAIR(
                {
                    'date': '2000-01-01',
                    'recalculate_value': 'on',
                    'apply': 'Re-calculate'
                }, CALCULATE_OFF_PEAKY_POINTS_MESSAGE.format(off_peaky_count=2, locations_label='locations',
                                                             created_count=1, updated_count=1)
            ),
            self.CHECK_RESULT_PAIR(
                {
                    'date': '2000-01-01',
                    'apply': 'Re-calculate'
                }, 'No created or updated data'
            )
        ]
        for index, data_set in enumerate(test_data_sets):
            with self.subTest(data_set.result_message):
                response = self.client.post(f'{self.URL}?ids={self.location.id},{second_test_location.id}', data_set.data)
                self.assertResponse(response, HTTPStatus.FOUND)
                self.assertMessage(response, index, data_set.result_message)
