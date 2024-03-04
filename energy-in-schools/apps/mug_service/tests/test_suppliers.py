from unittest.mock import MagicMock, patch

from apps.accounts.permissions import RoleName
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from utilities.requests_mock import RequestMock


class MUGAPIRequestSuppliers(MUGBaseTestCase):
    URL = '/api/v1/mug-api/suppliers/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_GET_SUPPLIERS])
    def test_suppliers(self):
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(len(response.data), 3)
        for index, supplier in enumerate(response.json()):
            self.assertEqual(supplier, MUGAPIMockedRequests.REQUEST_GET_SUPPLIERS.response_json[index])

    @patch('apps.mug_service.api_client.MUGApiClient.request_suppliers')
    def test_permissions(self, _: MagicMock):
        self._test_permissions_is_forbidden(
            url=self.get_url(),
            allowed_user_roles={RoleName.SEM_ADMIN, RoleName.ADMIN},
            request_func=self.client.get,
        )

    def test_mug_client_error_handler__view(self):
        self._test_mug_client_error_handler__view(
            'apps.mug_service.api_client.MUGApiClient.request_suppliers',
            self.client.get,
            self.get_url(),
            check_response_data_on_api_error=None,
            check_response_data_on_disabled=[],
        )
