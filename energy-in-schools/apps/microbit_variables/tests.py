import json
import uuid

from rest_framework import status

from apps.hubs.models import Hub
from apps.main.base_test_case import BaseTestCase
from apps.microbit_variables.models import MicrobitVariable


class TestMicrobitValues(BaseTestCase):
    URL = '/api/v1/micro-bit/variables/'
    VARIABLE_NAME = 'the-variable'

    def setUp(self):
        super().setUp()
        self.hub = self._create_hub()

    def test_variables(self):
        with self.subTest('Create Variable'):
            response = self.client.post(self.get_url(self.VARIABLE_NAME),
                                        data=self._get_variable_data(),
                                        **{'HTTP_SCHOOL_ID': self.hub.sub_location.uid,
                                           'HTTP_PI_ID': self.hub.uid})

            self.assertResponse(response, status.HTTP_201_CREATED)

        with self.subTest('Get Variable'):

            response = self.client.get(self.get_url(self.VARIABLE_NAME, 'school', self.hub.sub_location.uid),
                                       **{'HTTP_SCHOOL_ID': str(self.hub.sub_location.uid),
                                          'HTTP_PI_ID': self.hub.uid})

            self.assertResponse(response)

            for key, value in self._get_variable_data().items():
                self.assertEqual(value, response.data.get(key))

        with self.subTest('Update Variable'):
            response = self.client.patch(self.get_url(self.VARIABLE_NAME),
                                         json.dumps(self._get_new_variable_data()),
                                         content_type='application/json',
                                         **{'HTTP_SCHOOL_ID': str(self.hub.sub_location.uid),
                                            'HTTP_PI_ID': self.hub.uid})

            self.assertResponse(response)

            for key, value in self._get_new_variable_data().items():
                self.assertEqual(value, response.data.get(key))

        with self.subTest('Delete Variable'):
            response = self.client.delete(self.get_url(self.VARIABLE_NAME),
                                          **{'HTTP_SCHOOL_ID': str(self.hub.sub_location.uid),
                                             'HTTP_PI_ID': self.hub.uid})

            self.assertResponse(response, status.HTTP_204_NO_CONTENT)

    def test_list_variables(self):
        self._create_variable()
        response = self.client.get(self.get_url(),
                                   **{'HTTP_SCHOOL_ID': str(self.hub.sub_location.uid),
                                      'HTTP_PI_ID': self.hub.uid})

        self.assertResponse(response)
        self.assertEqual(1, len(response.data))

    def _create_hub(self):
        hub = Hub.objects.create(name='hub',
                                 description='description',
                                 sub_location=self.get_user().location,
                                 uid=str(uuid.uuid4())[:5])
        return hub

    def _create_variable(self):
        MicrobitVariable.objects.create(key='variable',
                                        shared_with=MicrobitVariable.ShareType.MY_SCHOOL,
                                        value='0',
                                        location=self.get_user().location,
                                        raspberry=self._create_hub())

    @staticmethod
    def _get_variable_data():
        return {'shared_with': MicrobitVariable.ShareType.MY_SCHOOL.value,
                'value': '0'}

    @staticmethod
    def _get_new_variable_data():
        return {'shared_with': MicrobitVariable.ShareType.NOBODY.value,
                'value': '10'}
