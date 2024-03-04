from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.hubs.base_test_case import HubBaseTestCase
from apps.microbit_variables.models import MicrobitVariable


class TestVariables(HubBaseTestCase):
    URL = '/api/v1/storage/variables/'
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN

    def setUp(self):
        super().setUp()
        self._create_variable()

    def test_get_variables(self):
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(1, len(response.data))

    def test_get_variable_value(self):
        response = self.client.get(self.get_url('variable'))
        self.assertResponse(response)
        self.assertEqual('0', response.data['value'])

    def test_get_variable_value_not_exists(self):
        response = self.client.get(self.get_url('variable_missing'))
        self.assertResponse(response, HTTPStatus.NOT_FOUND)

    def test_create_variable(self):
        body = self._get_request_body()
        response = self.client.post(self.get_url(), body)
        self.assertResponse(response, HTTPStatus.CREATED)

    def test_update_variable(self):
        body = self._get_request_body()
        response = self.client.put(self.get_url('variable'), data=body, content_type='application/json')
        self.assertResponse(response)

    def test_remove_variable(self):
        response = self.client.delete(self.get_url('variable'))
        self.assertResponse(response, HTTPStatus.NO_CONTENT)

    def test_bad_permission(self):
        self.client.force_login(self.es_admin)
        response = self.client.get(self.get_url())
        self.assertResponse(response, HTTPStatus.FORBIDDEN)

    def _get_request_body(self):
        return {
            "key": "test",
            "value": "test",
            "shared_with": 'ALL',
            "hub_uid": self.hub.uid,
            "location_id": self.location.id,
        }

    def _create_variable(self):
        MicrobitVariable.objects.create(key='variable',
                                        shared_with=MicrobitVariable.ShareType.MY_SCHOOL,
                                        value='0',
                                        location=self.get_user().location,
                                        raspberry=self.hub)
