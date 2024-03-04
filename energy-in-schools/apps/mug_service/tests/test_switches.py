import json
import random
from datetime import datetime, timezone, timedelta
from http import HTTPStatus
from unittest.mock import MagicMock, patch

import factory
from faker import Factory

from apps.accounts.permissions import RoleName
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo, UsedMeterType
from apps.energy_meters_billing_info.tests import EnergyMeterBillingInfoFactory
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.locations.models import Location
from apps.mug_service.constants import PaymentType, BANK_VALIDATION_ERROR_MESSAGE, SwitchStatus
from apps.mug_service.models import Switch
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests, ACCOUNT_NUMBER, SORT_CODE, DUMMY_RESULT_ID, \
    DUMMY_SUPPLIER_ID, DUMMY_TARIFF_NAME
from utilities.requests_mock import RequestMock


faker = Factory.create()


class SwitchFactory(factory.DjangoModelFactory):
    class Meta:
        model = Switch

    contract_id = factory.Sequence(lambda n: n + 1)
    quote_id = factory.Sequence(lambda n: n + 1)
    from_supplier_id = faker.random_number()
    to_supplier_id = faker.random_number()
    to_tariff_name = faker.word()
    status = factory.LazyFunction(lambda: random.choice(list(SwitchStatus)))
    contract_start_date = datetime.now(timezone.utc).date()
    contract_end_date = datetime.now(timezone.utc).date() + timedelta(days=30)


class SwitchesViewSetTestCase(MUGBaseTestCase):
    URL = '/api/v1/mug-api/energy-meters-billing-info/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.switch_request_data = dict(
            payment_type=PaymentType.MONTHLY_DIRECT_DEBIT.value,
            result_id=DUMMY_RESULT_ID,
            supplier_id=DUMMY_SUPPLIER_ID,
            from_supplier_id=DUMMY_SUPPLIER_ID,
            tariff_name=DUMMY_TARIFF_NAME,
            to_standing_charge=32.0,
            to_day_unit_rate=16.8,
            to_night_unit_rate=10.6,
            to_evening_and_weekend_unit_rate=14.3,
            contract_start_date='2021-01-01T00:00:00',
            contract_end_date='2021-12-31T00:00:00',
            tariff_rate_infos=[
                {
                    'rate_meter_type': 'Weekday',
                    'total_cost': 2828,
                    'unit_rate': 14.44
                }, {
                    'rate_meter_type': 'Night',
                    'total_cost': 507.5,
                    'unit_rate': 10.45,
                }, {
                    'rate_meter_type': 'Weekend',
                    'total_cost': 624.5,
                    'unit_rate': 12.79,
                }
            ]
        )

        cls.payment_request_data = dict(
            bank_name="Cool bank",
            address_line_1="221B Baker Street, LONDON",
            address_line_2=None,
            postcode="NW1 6XE",
            reference_number="Reference Number",
            account_holder_name=None,
            account_number=ACCOUNT_NUMBER,
            sort_code=SORT_CODE,
            city="London",
        )

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_BANK_VALIDATION,
                                  MUGAPIMockedRequests.REQUEST_UPDATE_CUSTOMER_BANK_INFO,
                                  MUGAPIMockedRequests.REQUEST_UPDATE_SITE_BANK_INFO,
                                  MUGAPIMockedRequests.REQUEST_SWITCH])
    def test_switch(self, _: MagicMock):
        with self.subTest('Success'):
            response = self.client.post(
                self.get_url(self.energy_meter_billing_info.id, 'switches'),
                json.dumps({
                    **self.switch_request_data,
                    **self.payment_request_data,
                }),
                content_type='application/json',
            )

            self.assertResponse(response, expected_status=HTTPStatus.CREATED)

        with self.subTest('Not Found'):
            another_location = Location.objects.create(name="another_location")
            another_energy_meter_billing_info = EnergyMeterBillingInfo.objects.create(
                location=another_location,
                fuel_type=MeterType.ELECTRICITY,
                meter_type=UsedMeterType.SMART_OR_AMR,
                standing_charge=0.0,
                contract_ends_on=datetime.now(timezone.utc)
            )

            response = self.client.post(
                self.get_url(another_energy_meter_billing_info.id, 'switches'),
                json.dumps({
                    **self.switch_request_data,
                    **self.payment_request_data,
                }),
                content_type='application/json',
            )

            self.assertResponse(response, expected_status=HTTPStatus.NOT_FOUND)

        with self.subTest('Bank validation error'):
            with patch('apps.mug_service.api_client.MUGApiClient.request_bank_validation', return_value=False):
                response = self.client.post(
                    self.get_url(self.energy_meter_billing_info.id, 'switches'),
                    json.dumps({
                        **self.switch_request_data,
                        **self.payment_request_data,
                    }),
                    content_type='application/json',
                )

                self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
                self.assertIn(BANK_VALIDATION_ERROR_MESSAGE, response.data['non_field_errors'])

    @patch('apps.mug_service.api_client.MUGApiClient.get_auth_token', return_value="auth token")
    @RequestMock.assert_requests([MUGAPIMockedRequests.REQUEST_SWITCH])
    def test_switch_with_pay_on_receipt_payment_type(self, _: MagicMock):
        response = self.client.post(
            self.get_url(self.energy_meter_billing_info.id, 'switches'),
            json.dumps({
                **self.switch_request_data,
                'payment_type': PaymentType.PAY_ON_RECEIPT_OF_BILL.value
            }),
            content_type='application/json',
        )

        self.assertResponse(response, expected_status=HTTPStatus.CREATED)

    @patch('apps.mug_service.api_client.MUGApiClient.request_switch')
    def test_permissions(self, _: MagicMock):
        self._test_permissions_is_forbidden(
            url=self.get_url(self.energy_meter_billing_info.id, 'switches'),
            allowed_user_roles={RoleName.SEM_ADMIN},
            request_func=self.client.post,
        )

    @patch('apps.mug_service.api_client.MUGApiClient.request_bank_validation', return_value=True)
    @patch('apps.mug_service.api_client.MUGApiClient.update_payment_info')
    @patch('apps.mug_service.api_client.MUGApiClient.update_payment_info')
    def test_mug_client_error_handler__view(self, _: MagicMock, __: MagicMock, ___: MagicMock):
        self._test_mug_client_error_handler__view(
            'apps.mug_service.api_client.MUGApiClient.request_switch',
            self.client.post,
            self.get_url(self.energy_meter_billing_info.id, 'switches'),
            json.dumps({
                **self.switch_request_data,
                **self.payment_request_data,
            }),
            content_type='application/json',
        )


class LocationSwitchesViewSetTestCase(MUGBaseTestCase, EnergyProviderBaseTestCase):
    URL = '/api/v1/mug-api/switches/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    def test_get_list(self):
        SwitchFactory.create_batch(5, energy_meter_billing_info=self.energy_meter_billing_info)
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(5, len(response.data))

        with self.subTest("Only own location"):
            switch = Switch.objects.first()
            switch.energy_meter_billing_info = EnergyMeterBillingInfoFactory(
                location=Location.objects.create(),
                resource=self.create_energy_meter(),
            )
            switch.save()

            response = self.client.get(self.get_url())
            self.assertResponse(response)
            self.assertEqual(4, len(response.data))

        with self.subTest('Get list with location_id query param'):
            self.client.force_login(self.admin)
            response = self.client.get(self.get_url(query_param={'location_id': self.location.id}))
            self.assertResponse(response)
            self.assertEqual(4, len(response.data))

    def test_permissions(self):
        self._test_permissions_is_forbidden(
            url=self.get_url(),
            allowed_user_roles={RoleName.SEM_ADMIN, RoleName.ADMIN},
            request_func=self.client.get,
        )
