from json import dumps
from datetime import datetime
from http import HTTPStatus
from unittest.mock import MagicMock, patch

import pytz
from dateutil import parser
from django.test import override_settings

from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from utilities.requests_mock import RequestMock
from utilities.rest import RestSessionPayload

from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.internal_types import MUGAddress, MUGCustomerParams, MUGSiteParams
from apps.mug_service.constants import MUGMeterType
from apps.mug_service.exceptions import MUGAPIException, MUGBadCredentials
from apps.mug_service.models import Customer, Site, Meter
from apps.mug_service.exceptions import MUGServiceDisabled
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests, DUMMY_CUSTOMER_ID, DUMMY_SITE_ID,\
    DUMMY_ELECTRIC_METER_ID, DUMMY_GAS_METER_ID
from apps.locations.models import Location
from apps.registration_requests.models import RegistrationRequest
from apps.energy_meters_billing_info.tests import EnergyMetersBillingInfoTestCase
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.energy_providers.providers.abstract import MeterType


def get_rest_session_payload(json_data=MUGAPIMockedRequests.AUTHORIZE_REQUEST.response_json) -> RestSessionPayload:
    return RestSessionPayload.from_custom_token_with_expiry_date(json_data.get('access_token'),
                                                                 parser.parse(json_data.get('.expires')).replace(
                                                                     tzinfo=pytz.utc))


class MUGClientTestCase(MUGBaseTestCase):
    """WARN Execution order matters in case of token saving as class attribute"""

    @RequestMock.assert_requests([MUGAPIMockedRequests.AUTHORIZE_REQUEST, MUGAPIMockedRequests.AUTHORIZE_REQUEST_FAIL])
    def test_request_auth_token(self):
        """ Happy flow/ Fail flow Token """

        with self.subTest("Test Obtain Auth Token Success"):
            obtained_payload: RestSessionPayload = MUGApiClient.authorize()

            expires_date: datetime = parser.parse(MUGAPIMockedRequests.AUTHORIZE_REQUEST.response_json['.expires'])

            self.assertEqual(obtained_payload.token,
                             MUGAPIMockedRequests.AUTHORIZE_REQUEST.response_json['access_token'])
            self.assertEqual(obtained_payload.expired_at, expires_date.replace(tzinfo=pytz.utc))

        with self.subTest("Test Obtain Auth Token Fail"):
            with self.assertRaises(MUGBadCredentials):
                MUGApiClient.authorize()

    @patch('apps.mug_service.api_client.MUGApiClient._session_payload', return_value=None)
    @patch('apps.mug_service.api_client.MUGApiClient.authorize',
           return_value=get_rest_session_payload(MUGAPIMockedRequests._AUTH_ENDPOINT_RESPONSE_OLD_TOKEN))
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_BY_POSTCODE, MUGAPIMockedRequests.REQUEST_BY_POSTCODE])
    def test_token_expiration_refresh(self, mock: MagicMock, _: MagicMock):
        """ Test token expiration """
        MUGApiClient.request_by_postcode('test')

        mock.assert_called_once()

        MUGApiClient.request_by_postcode('test')

        self.assertEqual(mock.call_count, 2)

    @patch('apps.mug_service.api_client.MUGApiClient._session_payload', return_value=None)
    @patch('apps.mug_service.api_client.MUGApiClient.authorize', return_value=get_rest_session_payload())
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_BY_POSTCODE, MUGAPIMockedRequests.REQUEST_BY_POSTCODE])
    def test_0_api_call_count(self, mock: MagicMock, _: MagicMock):
        """ test api call count for MUGAPIClient Class """

        MUGApiClient.request_by_postcode('test')

        mock.assert_called_once()

        MUGApiClient.request_by_postcode('test')

        mock.assert_called_once()

    @patch('apps.mug_service.api_client.MUGApiClient._session_payload', return_value=None)
    @patch('apps.mug_service.api_client.MUGApiClient.authorize', return_value=get_rest_session_payload())
    @RequestMock.assert_requests(
        [MUGAPIMockedRequests.REQUEST_BY_POSTCODE_FAILED_500, MUGAPIMockedRequests.REQUEST_BY_POSTCODE_FAILED_500])
    def test_exception_on_bad_response(self, _: MagicMock, __: MagicMock):
        with self.assertRaises(MUGAPIException) as exception:
            MUGApiClient.request_by_postcode('test')
        self.assertEquals(
            f'MUG API returned non acceptable status 500. Acceptable status list {MUGApiClient.acceptable_statuses}',
            exception.exception.args[0])

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_ADD_CUSTOMER])
    def test_request_create_customer(self, mock: MagicMock):
        customer_json = MUGCustomerParams(
            company_name="test name",
            mobile="test mobile",
            email="test@dummy.mail",
            registered_address=MUGAddress(
                address_line_1="test_line_1",
                address_line_2="test_line_2",
                town="test city",
                postcode="t_postcode",
            ),
            registration_number="test reg number",
        ).to_json()

        mug_id = MUGApiClient.request_add_customer(customer_json)
        mock.assert_called_once()
        self.assertEqual(DUMMY_CUSTOMER_ID, mug_id)

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_ADD_SITE])
    def test_request_create_site(self, mock: MagicMock):

        site_data = MUGSiteParams(
            site_name="Test site",
            address=MUGAddress(
                address_line_1="address line 1",
                address_line_2="address line 2",
                town="Town",
                postcode="123qwe"
            )
        ).to_json()

        mug_site_id = MUGApiClient.request_add_site(DUMMY_CUSTOMER_ID, site_data)
        mock.assert_called_once()
        self.assertEqual(mug_site_id, MUGAPIMockedRequests.REQUEST_ADD_SITE.response_json['id'])

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([
        MUGAPIMockedRequests.REQUEST_DELETE_SITE,
        MUGAPIMockedRequests.REQUEST_DELETE_ELECTRIC_METER,
        MUGAPIMockedRequests.REQUEST_DELETE_GAS_METER,
    ])
    def test_request_delete_entity(self, mock: MagicMock):
        with self.subTest("Site"):
            MUGApiClient.request_delete_site(DUMMY_CUSTOMER_ID, DUMMY_SITE_ID)
            mock.assert_called_once()

        with self.subTest("Electric meter"):
            MUGApiClient.request_delete_meter(DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, DUMMY_ELECTRIC_METER_ID,
                                              MUGMeterType.ELECTRIC)
            self.assertEqual(2, mock.call_count)

        with self.subTest("Gas meter"):
            MUGApiClient.request_delete_meter(DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, DUMMY_GAS_METER_ID, MUGMeterType.GAS)
            self.assertEqual(3, mock.call_count)

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_ADD_SITE])
    def test_location_signal_post_save(self, mock: MagicMock):
        sub_location = Location.objects.create(name="new sublocation", parent_location=self.get_user().location)
        mock.assert_called_once()
        self.assertTrue(
            Site.objects.filter(
                sub_location=sub_location,
                mug_site_id=MUGAPIMockedRequests.REQUEST_ADD_SITE.response_json['id']
            ).exists()
        )

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_COMPARISON_ELECTRIC_METER,
                                  MUGAPIMockedRequests.REQUEST_COMPARISON_GAS_METER])
    def test_comparison_endpoints(self, _: MagicMock):
        with self.subTest("Electric meter endpoint"):
            MUGApiClient.request_comparison(DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, DUMMY_ELECTRIC_METER_ID,
                                            MUGMeterType.ELECTRIC)

        with self.subTest("Gas meter endpoint"):
            MUGApiClient.request_comparison(DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, DUMMY_GAS_METER_ID,
                                            MUGMeterType.GAS)

    @override_settings(MUG_AUTH_API_URL='', MUG_API_URL='')
    def test_mug_disabled(self):
        for request_method, args in (
            (MUGApiClient.request_add_customer, ("",)),
            (MUGApiClient.request_by_postcode, ("",)),
            (MUGApiClient.request_add_site, (DUMMY_SITE_ID, "")),
            (MUGApiClient.request_delete_site, (DUMMY_CUSTOMER_ID, DUMMY_SITE_ID)),
            (MUGApiClient.request_add_meter, (DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, "", None)),
            (MUGApiClient.request_delete_meter, (DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, DUMMY_ELECTRIC_METER_ID, None)),
            (MUGApiClient.request_comparison, (DUMMY_CUSTOMER_ID, DUMMY_SITE_ID, DUMMY_ELECTRIC_METER_ID, None)),
        ):
            self.assertRaises(MUGServiceDisabled, request_method, *args)


class EnergyMetersBillingInfoWithMUGTestCase(EnergyMetersBillingInfoTestCase):
    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([
        MUGAPIMockedRequests.REQUEST_ADD_ELECTRIC_METER,
        MUGAPIMockedRequests.REQUEST_ADD_GAS_METER,
        MUGAPIMockedRequests.REQUEST_DELETE_ELECTRIC_METER,
        MUGAPIMockedRequests.REQUEST_DELETE_GAS_METER,
    ])
    def test_mug_meter_creation_and_deletion(self, _: MagicMock):
        self.client.force_login(self.sle_admin)
        rr = RegistrationRequest.objects.create(school_nickname='nick', registered_school=self.location)
        Customer.objects.create(mug_customer_id=DUMMY_CUSTOMER_ID, registration_request=rr)
        Site.objects.create(sub_location_id=self.location.id, mug_site_id=DUMMY_SITE_ID)

        with self.subTest('bulk create meters'):
            electric_meter_data = {
                **self.request_data,
                'meter_id': 'electric meter id',
                'location_id': self.location.id
            }
            gas_meter_data = {
                **self.request_data,
                'meter_id': 'gas meter id',
                'location_id': self.location.id,
                'fuel_type': MeterType.GAS.value
            }
            response = self.client.post(
                path=self.get_url('bulk'),
                data=dumps([electric_meter_data, gas_meter_data]),
                content_type='application/json',
            )
            self.assertResponse(response, expected_status=HTTPStatus.CREATED)
            self.assertEqual(2, Meter.objects.count())

        with self.subTest('delete electric energy_meter_billing_info'):
            electric_meter_info_id = EnergyMeterBillingInfo.objects.filter(fuel_type=MeterType.ELECTRICITY).first().id
            response = self.client.delete(path=self.get_url(electric_meter_info_id))
            self.assertResponse(response, expected_status=HTTPStatus.NO_CONTENT)
            self.assertEqual(1, Meter.objects.count())

        with self.subTest('delete gas energy_meter_billing_info'):
            gas_meter_info_id = EnergyMeterBillingInfo.objects.filter(fuel_type=MeterType.GAS).first().id
            response = self.client.delete(path=self.get_url(gas_meter_info_id))
            self.assertResponse(response, expected_status=HTTPStatus.NO_CONTENT)
            self.assertEqual(0, Meter.objects.count())
