from http import HTTPStatus
from unittest.mock import patch, MagicMock

from apps.accounts.permissions import RoleName
from apps.smart_things_apps.base_test_case import SmartThingsAppBaseTestCase
from apps.smart_things_apps.types import SmartAppConnectivityStatus
from utilities.requests_mock import RequestMock


class RequestsMocks:
    GET_LOCATION_OK = RequestMock(
        request_url=f'https://api.smartthings.com/v1/locations/{SmartThingsAppBaseTestCase.smart_things_location_id}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.OK,
    )
    GET_LOCATION_UNAUTHORIZED = RequestMock(
        request_url=f'https://api.smartthings.com/v1/locations/{SmartThingsAppBaseTestCase.smart_things_location_id}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.UNAUTHORIZED,
    )
    GET_LOCATION_INVALID_GRANT = RequestMock(
        request_url=f'https://api.smartthings.com/v1/locations/{SmartThingsAppBaseTestCase.smart_things_location_id}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.BAD_REQUEST,
        response_json={'error': 'invalid_grant'},
    )
    GET_LOCATION_BAD_GATEWAY = RequestMock(
        request_url=f'https://api.smartthings.com/v1/locations/{SmartThingsAppBaseTestCase.smart_things_location_id}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.BAD_GATEWAY,
    )
    GET_LOCATION_BAD_REQUEST = RequestMock(
        request_url=f'https://api.smartthings.com/v1/locations/{SmartThingsAppBaseTestCase.smart_things_location_id}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.BAD_REQUEST,
    )


class TestSmartThingsAppConnector(SmartThingsAppBaseTestCase):
    URL = '/api/v1/smart-things/applications/'
    FORCE_LOGIN_AS = RoleName.ADMIN

    @patch('apps.smart_things_apps.models.SmartThingsApp.refresh_old_refresh_tokens')
    def test_refresh(self, mock: MagicMock):
        response = self.client.post(self.get_url('refresh-tokens'))

        self.assertEqual(HTTPStatus.OK, response.status_code)
        mock.assert_called_once()

    @RequestMock.assert_requests([
        RequestsMocks.GET_LOCATION_OK,
        RequestsMocks.GET_LOCATION_UNAUTHORIZED,
        RequestsMocks.GET_LOCATION_INVALID_GRANT,
        RequestsMocks.GET_LOCATION_BAD_REQUEST,
        RequestsMocks.GET_LOCATION_BAD_GATEWAY,
    ])
    def test_refresh_token_health(self):
        for test_name, token_status_expected in (
                ('SmartThings response: 200', SmartAppConnectivityStatus.CONNECTED.value),
                ('SmartThings response: 401', SmartAppConnectivityStatus.REFRESH_TOKEN_BROKEN.value),
                ('SmartThings response: 400 INVALID_GRANT', SmartAppConnectivityStatus.REFRESH_TOKEN_BROKEN.value),
                ('SmartThings response: 400', SmartAppConnectivityStatus.UNKNOWN.value),
                ('SmartThings response: 502', SmartAppConnectivityStatus.UNKNOWN.value),
        ):
            with self.subTest(test_name):
                response = self.client.get(self.get_url(self.smart_things_app.id, 'refresh_token_health'))
                self.assertResponse(response)
                self.assertDictEqual(
                    dict(
                        app_id=self.smart_things_app.id,
                        status=token_status_expected,
                        refresh_token_updated_at=self.smart_things_app.refresh_token_updated_at.isoformat()[:-6] + 'Z'
                    ),
                    response.data,
                )
