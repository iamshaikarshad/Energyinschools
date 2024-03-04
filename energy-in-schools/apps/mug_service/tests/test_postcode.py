from http import HTTPStatus

from apps.mug_service.internal_types import MUGAddress, MUGPostcodeMeters
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests
from utilities.requests_mock import RequestMock


class MUGAPIRequestByPostCodeBaseTestCase(MUGBaseTestCase):

    def mug_client_error_handler__view(self, *args, **kwargs):
        self._test_mug_client_error_handler__view(
            'apps.mug_service.api_client.MUGApiClient.request_by_postcode',
            self.client.post,
            self.get_url(),
            {'post_code': 'test'},
            check_response_status_on_disabled=HTTPStatus.BAD_REQUEST,
        )

    def check_request_no_postcode(self, *args, **kwargs):
        response = self.client.post(self.get_url())
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)


class MUGAPIRequestAddress(MUGAPIRequestByPostCodeBaseTestCase):
    URL = '/api/v1/mug-api/address/'

    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_BY_POSTCODE])
    def test_get_list(self):
        response = self.client.post(self.get_url(), {'post_code': 'test'})
        self.assertResponse(response)

        for index, address in enumerate(response.json()):
            internal_format: MUGAddress = MUGAddress(**address)
            self.assertEqual(internal_format._asdict(), MUGAddress.from_mug_api_response(
                MUGAPIMockedRequests.REQUEST_BY_POSTCODE.response_json['verifiedAddressDto'][
                    'verifiedAddresses'][index])._asdict())

    def test_mug_client_error(self):
        super().mug_client_error_handler__view()

    def test_request_no_postcode(self):
        super().check_request_no_postcode()


class MUGAPIRequestAddressWithMeters(MUGAPIRequestByPostCodeBaseTestCase):
    URL = '/api/v1/mug-api/address/meters/'

    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_BY_POSTCODE])
    def test_get_list(self):
        response = self.client.post(self.get_url(), {'post_code': 'test'})

        self.assertResponse(response)

        for index, address in enumerate(response.json()):
            internal_format: MUGAddress = MUGAddress(**address)
            self.assertEqual(internal_format._asdict(), MUGAddress.from_mug_api_response(
                MUGAPIMockedRequests.REQUEST_BY_POSTCODE.response_json['verifiedAddressDto'][
                    'verifiedAddresses'][index], include_meters=True)._asdict())

    def test_mug_client_error(self):
        super().mug_client_error_handler__view()

    def test_request_no_postcode(self):
        super().check_request_no_postcode()


class MUGAPIRequestMetersByPostcode(MUGAPIRequestByPostCodeBaseTestCase):
    URL = '/api/v1/mug-api/address/meter-ids/'

    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_BY_POSTCODE])
    def test_get_mpan_mprn_lists(self):
        response = self.client.post(self.get_url(), {'post_code': 'test'})

        self.assertResponse(response)
        internal_format: MUGPostcodeMeters = MUGPostcodeMeters(**response.json())
        self.assertEqual(internal_format._asdict(), MUGPostcodeMeters.from_mug_api_response(
            MUGAPIMockedRequests.REQUEST_BY_POSTCODE.response_json['verifiedAddressDto'][
                'verifiedAddresses'])._asdict())

    def test_mug_client_error(self):
        super().mug_client_error_handler__view()

    def test_request_no_postcode(self):
        super().check_request_no_postcode()
