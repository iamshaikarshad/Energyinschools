from http import HTTPStatus
from unittest.mock import MagicMock, patch

from django.db.models import Q

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.locations.models import Location
from apps.mug_service.internal_types import MUGComparisonResult
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests
from utilities.requests_mock import RequestMock


class MUGAPIRequestComparisonTestCase(MUGBaseTestCase):
    URL = '/api/v1/mug-api/comparison/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_COMPARISON_ELECTRIC_METER])
    def test_get_comparison(self, _: MagicMock):
        response = self.client.get(self.get_url(
            query_param={'energy_meter_billing_info': self.energy_meter_billing_info.id}
        ))
        self.assertResponse(response)
        response_data = response.json()

        mug_response_results = MUGAPIMockedRequests.REQUEST_COMPARISON_ELECTRIC_METER.response_json['results'] +\
                               MUGAPIMockedRequests.REQUEST_COMPARISON_ELECTRIC_METER.response_json['hhResults']

        hh_tariff_ids = [
            tariff['resultId'] for tariff in MUGAPIMockedRequests.REQUEST_COMPARISON_ELECTRIC_METER.response_json['hhResults']
        ]

        for mug_response_result, internal_response_result in zip(
                mug_response_results,
                response_data
        ):
            is_hh = mug_response_result['resultId'] in hh_tariff_ids
            self.assertEqual(MUGComparisonResult(**internal_response_result)._asdict(),
                             MUGComparisonResult.from_mug_api_response(mug_response_result, is_hh=is_hh)._asdict())

    @patch('apps.mug_service.api_client.MUGApiClient.request_comparison')
    def test_permissions(self, mug_client_mock: MagicMock):
        request_url = self.get_url(query_param={'energy_meter_billing_info': self.energy_meter_billing_info.id})

        with self.subTest('Test unauthorized'):
            self.client.logout()
            response = self.client.get(request_url)
            self.assertResponse(response, expected_status=HTTPStatus.UNAUTHORIZED)

        for user in User.objects.filter((Q(location=self.location) &
                                        ~Q(groups__name=RoleName.SEM_ADMIN)) | Q(groups__name=RoleName.ADMIN)):
            with self.subTest(f'Test forbidden for {self.admin.role}'):
                self.client.force_login(user)
                response = self.client.get(request_url)
                self.assertResponse(response, expected_status=HTTPStatus.FORBIDDEN)

        with self.subTest('Test Energy meter billing info in another location'):
            self.energy_meter_billing_info.location = Location.objects.create()
            self.energy_meter_billing_info.save()

            self.client.force_login(self.sem_admin)
            response = self.client.get(request_url)

            self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
            self.assertIn('energy_meter_billing_info', response.data)
            self.assertEqual(response.data['energy_meter_billing_info'][0].code, 'does_not_exist')

        mug_client_mock.assert_not_called()

    def test_mug_client_error_handler__view(self):
        self._test_mug_client_error_handler__view(
            'apps.mug_service.api_client.MUGApiClient.request_comparison',
            self.client.get,
            self.get_url(query_param={'energy_meter_billing_info': self.energy_meter_billing_info.id}),
        )
