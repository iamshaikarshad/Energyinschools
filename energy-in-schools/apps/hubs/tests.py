import json
from http import HTTPStatus
from unittest.mock import patch

from rest_framework import status

from apps.accounts.permissions import RoleName
from apps.hubs.models import Hub
from apps.main.base_test_case import BaseTestCase


class TestRaspberryHubs(BaseTestCase):
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN
    URL = '/api/v1/hubs/'

    def test_raspberry_hubs(self):
        with self.subTest('Create Hub'):
            response = self.client.post(self.get_url(), data=self._get_hub_data(self.location))
            self.assertEqual(status.HTTP_201_CREATED, response.status_code)
            hub_id = response.json()['id']
            hub_uid = response.json()['uid']

        with self.subTest('Create duplicate'):
            self.assertResponse(
                self.client.post(self.get_url(), data=self._get_hub_data(self.location)),
                status.HTTP_400_BAD_REQUEST
            )

        with self.subTest('List Hubs'):
            response = self.client.get(self.get_url())

            self.assertEqual(status.HTTP_200_OK, response.status_code)
            self.assertEqual(1, len(response.data))

        with self.subTest('Get Hub'):
            response = self.client.get(self.get_url(hub_id))

            self.assertEqual(status.HTTP_200_OK, response.status_code)

            for key, value in self._get_hub_data(self.location).items():
                self.assertEqual(value, response.data.get(key))

        with self.subTest('Check Firmware by ID'), patch('builtins.print'):
            response = self.client.get(self.get_url('microbit-firmware', query_param={'id': hub_id}))
            self.assertResponse(response)

        with self.subTest('Check Firmware by UID'), patch('builtins.print'):
            response = self.client.get(self.get_url('microbit-firmware', query_param={'uid': hub_uid}))
            self.assertResponse(response)

        with self.subTest('Check Firmware by non existing hub'):
            response = self.client.get(self.get_url('microbit-firmware', query_param={'uid': 'faked'}))
            self.assertResponse(response, HTTPStatus.NOT_FOUND)

        with self.subTest('Check Firmware without IDs'):
            response = self.client.get(self.get_url('microbit-firmware'))
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)

        with self.subTest('Update Hub Patch'):
            response = self.client.patch(self.get_url(hub_id),
                                         json.dumps(self._get_new_hub_data(self.location)),
                                         content_type='application/json')

            self.assertEqual(status.HTTP_200_OK, response.status_code)

            for key, value in self._get_new_hub_data(self.location).items():
                self.assertEqual(value, response.data.get(key))

        with self.subTest('Update Hub Put'):
            sub_location = self.get_user().location.with_sub_locations.last()
            response = self.client.put(
                self.get_url(hub_id),
                {
                    **self._get_new_hub_data(self.location),
                    'sub_location_id': sub_location.id
                },
                content_type='application/json'
            )

            self.assertResponse(response)

            for key, value in self._get_new_hub_data(sub_location).items():
                self.assertEqual(value, response.data.get(key), key)

        with self.subTest('Location in firmware is from main location'), patch('builtins.print'):
            sub_location = self.get_user().location.with_sub_locations.last()
            response = self.client.get(self.get_url('microbit-firmware', query_param={'id': hub_id}))
            self.assertResponse(response)
            content_disposition = response.get('content-disposition')
            self.assertIsNotNone(content_disposition)
            self.assertTrue(sub_location.school.uid in content_disposition)

        with self.subTest('Update hub with different school'):
            location_to_change = self.get_user(school_number=1).location.with_sub_locations.last()
            response = self.client.put(
                self.get_url(hub_id),
                {
                    **self._get_new_hub_data(self.location),
                    'sub_location_id': location_to_change.id
                },
                content_type='application/json'
            )
            self.assertResponse(response, expected_status=status.HTTP_400_BAD_REQUEST)

        with self.subTest('Delete Hub'):
            response = self.client.delete(self.get_url(hub_id))

            self.assertEqual(status.HTTP_204_NO_CONTENT, response.status_code)
            self.assertEqual(1, Hub.deleted_objects.count())

        with self.subTest('Restore hub'):
            response = self.client.post(self.get_url(), data=self._get_new_hub_data(self.location))

            self.assertEqual(status.HTTP_201_CREATED, response.status_code)
            self.assertEqual(hub_id, response.json()['id'])

    @staticmethod
    def _get_hub_data(location):
        return {'name': 'hub',
                'type': 'raspberry',
                'description': 'hub description',
                'uid': 'testX',
                'sub_location_id': location.id}

    @staticmethod
    def _get_new_hub_data(location):
        return {'name': 'new_hub',
                'type': 'android',
                'description': 'new hub description',
                'uid': 'new_t',
                'sub_location_id': location.id}
