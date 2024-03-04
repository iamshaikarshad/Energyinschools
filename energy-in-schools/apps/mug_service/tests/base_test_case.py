from datetime import datetime
from http import HTTPStatus
from unittest.mock import patch

from django.test import override_settings

from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo, UsedMeterType
from apps.energy_providers.providers.abstract import MeterType
from apps.main.base_test_case import BaseTestCase
from apps.mug_service.decorators import MUG_SERVICE_DISABLED, MUG_API_ERROR
from apps.mug_service.exceptions import MUGAPIException
from apps.mug_service.models import Customer, Site, Meter
from apps.mug_service.tests.mocked_requests import DUMMY_ELECTRIC_METER_ID, DUMMY_SITE_ID, DUMMY_CUSTOMER_ID, \
    DUMMY_SUPPLIER_ID
from apps.registration_requests.models import RegistrationRequest


class MUGBaseTestCase(BaseTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.registration_request = cls.create_registration_request(cls.get_user())
        cls.mug_customer = cls.create_mug_customer(cls.registration_request)

        cls.mug_site = cls.create_mug_site(cls.get_user().location)

        cls.energy_meter_billing_info = cls.create_energy_meter_billing_info(cls.get_user())

        cls.meter = cls.create_meter(cls.energy_meter_billing_info)

    def _test_mug_client_error_handler__view(
            self,
            request_func_path,
            request_func,
            *args,
            content_type=None,
            check_response_data_on_api_error=MUG_API_ERROR,
            check_response_status_on_api_error=HTTPStatus.BAD_GATEWAY,
            check_response_data_on_disabled=MUG_SERVICE_DISABLED,
            check_response_status_on_disabled=HTTPStatus.OK,
    ):
        def raise_mug_api_exception(*_, **__):
            raise MUGAPIException("SOMETHING BAD HAPPENED")

        content_type = {'content_type': content_type} if content_type else {}
        with self.subTest(f'MUG API error {request_func_path}'):
            with patch(request_func_path) as request_patch:
                request_patch.side_effect = raise_mug_api_exception
                response = request_func(*args, **content_type)
                self.assertResponse(response, expected_status=check_response_status_on_api_error)
                self.assertEqual(response.data, check_response_data_on_api_error)

        with self.subTest(f'MUG disabled {request_func_path}'):
            with override_settings(MUG_AUTH_API_URL='', MUG_API_URL=''):
                response = request_func(*args, **content_type)
                self.assertResponse(response, expected_status=check_response_status_on_disabled)
                self.assertEqual(response.data, check_response_data_on_disabled)

    @staticmethod
    def create_registration_request(user):
        return RegistrationRequest.objects.create(school_name="New school",
                                                  registered_school=user.location)

    @staticmethod
    def create_mug_customer(registration_request):
        return Customer.objects.create(registration_request=registration_request,
                                       mug_customer_id=DUMMY_CUSTOMER_ID)

    @staticmethod
    def create_mug_site(location):
        return Site.objects.create(sub_location=location, mug_site_id=DUMMY_SITE_ID)

    @staticmethod
    def create_energy_meter_billing_info(user):
        return EnergyMeterBillingInfo.objects.create(
            fuel_type=MeterType.ELECTRICITY.value, meter_type=UsedMeterType.NON_AMR.value,
            meter_id='the id', standing_charge=24.0,
            contract_ends_on=datetime.now(), location=user.location,
            supplier_id=DUMMY_SUPPLIER_ID)

    @staticmethod
    def create_meter(energy_meter_billing_info):
        return Meter.objects.create(energy_meter_billing_info=energy_meter_billing_info,
                                    mug_meter_id=DUMMY_ELECTRIC_METER_ID)
