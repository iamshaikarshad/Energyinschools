import logging
import json
from http import HTTPStatus
from typing import Dict, List, Union

import funcy
import pytz
import requests
from dateutil import parser
from django.conf import settings
from requests import Response

from apps.mug_service.decorators import check_mug_disabled
from apps.mug_service.exceptions import MUGAPIException, MUGBadCredentials, MUGEmptyData, MUGBadRequest,\
    MUGBadRequestData
from apps.mug_service.internal_types import DeleteMUGEntityParams, MUGMeterRateType, MUGComparisonResult, MUGAddress,\
    MUGCustomerId, MUGEntityId, MUGLoginParams, MUGMeterParams, MUGMeterSavings, MUGCarbonIntensity, MUGSupplier, MUGCustomerBankInfo, MUGSiteBankInfo
from apps.mug_service.constants import MUGMeterType, METER_TYPE__MUG_METER_TYPE__MAP
from apps.energy_providers.providers.abstract import MeterType
from utilities.rest import RestSessionPayload

RETRY_COUNT = 2
RETRY_INTERVAL = 2

logger = logging.getLogger(__name__)

class MUGAPIEndpoints:
    REQUEST_ADDRESS_BY_POSTCODE = '/request/Address/list/company'
    REQUEST_CUSTOMER = '/request/customer'
    REQUEST_SITE = '/request/customer/{customer_id}/site'
    REQUEST_SITE_DELETE = '/request/customer/{customer_id}/site/{site_id}'
    REQUEST_METER = '/request/customer/{customer_id}/site/{site_id}/meter/{meter_type}'
    REQUEST_METER_DELETE = '/request/customer/{customer_id}/site/{site_id}/meter/{meter_type}/{meter_id}'
    REQUEST_QUOTE = '/request/customer/{customer_id}/site/{site_id}/meter/{meter_type}/{meter_id}/quote'
    REQUEST_BANK_VALIDATION = '/request/Bank/Is-Valid?sortCode={sort_code}&accountNumber={account_number}'
    REQUEST_SUPPLIERS = '/request/Suppliers'
    REQUEST_SWITCH = '/request/customer/{customer_id}/site/{site_id}/meter/{meter_type}/{meter_id}/switch/{result_id}'
    REQUEST_BATTERY = '/request/customer/{customer_id}/site/{site_id}/meter/{meter_type}/{meter_id}/battery'
    REQUEST_METER_SAVINGS = '/request/customer/{customer_id}/site/{site_id}/meter/electric/{meter_id}/savings'
    REQUEST_CARBON_INTENSITY = '/request/customer/{customer_id}/site/{site_id}/meter/electric/{meter_id}/carbonintensity'
    REQUEST_MPAN_MPRN_INFO = '/request/Info/{meter_type_by_fuel}'
    REQUEST_UPDATE_SITE_PAYMENT_INFO = '/request/customer/{customer_id}/site/{site_id}/payment'
    REQUEST_UPDATE_CUSTOMER_PAYMENT_INFO = '/request/customer/{customer_id}/payment'


class MUGResponseKeys:
    ADDRESS = 'verifiedAddresses'
    VERIFIED_ADDRESS = 'verifiedAddressDto'
    COMPARISON_RESULTS = 'results'
    COMPARISON_HH_RESULTS = 'hhResults'
    ABOUT_BANK_DTO = 'aboutBankDto'
    IS_VALID = 'isValid'


def mug_request_decorator(request_func):
    return classmethod(
        funcy.retry(RETRY_COUNT, MUGAPIException, RETRY_INTERVAL)(
            check_mug_disabled(request_func)
        )
    )


class PostcodeMUGApiClientMixin:

    @mug_request_decorator
    def request_by_postcode(cls: 'MUGApiClient', postcode: str):
        """
            Make API Call for query addresses by postcode

            Request Format

            {
              "postcode": "sample string 1"
            }

            Response Format

            {
              "apiVersion": "sample string 1",
              "uri": "sample string 2",
              "verifiedAddressDto": {
                "verifiedAddresses": [
                  {
                    "parts": {
                      "siteName": {}
                    },
                    "text": "sample string 1"
                  },
                  {
                    "parts": {
                      "siteName": {}
                    },
                    "text": "sample string 1"
                  }
                ]
              }
            }
        """
        response = requests.post(f'{cls._api_endpoint}{MUGAPIEndpoints.REQUEST_ADDRESS_BY_POSTCODE}',
                                 json.dumps({'postcode': postcode}), headers=cls.get_headers())

        cls._check_response_status(response)

        return response.json().get(MUGResponseKeys.VERIFIED_ADDRESS, {MUGResponseKeys.ADDRESS: []})[
            MUGResponseKeys.ADDRESS]


class CustomerMUGApiClientMixin:
    @mug_request_decorator
    def request_add_customer(cls: 'MUGApiClient', customer_data_json: str) -> int:
        """
            Make API Call for customer creation

            Request Format (JSON)

            {
                "companyName": "sample string 1",
                "sicCode": 1,
                "correspondenceAddress": {
                    "line1": "sample string 1",
                    "line2": "sample string 2",
                    "city": "sample string 3",
                    "county": "sample string 4",
                    "postcode": "sample string 5"
                },
                "registeredAddress": {
                  "line1": "sample string 1",
                  "line2": "sample string 2",
                  "city": "sample string 3",
                  "county": "sample string 4",
                  "postcode": "sample string 5"
                },
                "billingAddress": {
                    "line1": "sample string 1",
                    "line2": "sample string 2",
                    "city": "sample string 3",
                    "county": "sample string 4",
                    "postcode": "sample string 5"
                },
                "companyType": 64,
                "companyRegistrationNumber": "sample string 2",
                "landline": "sample string 3",
                "mobile": "sample string 4",
                "email": "sample string 5",
                "vatNumber": "sample string 6",
                "parentCustomerId": 1,
                "microBusiness": true,
                "noOfPupils": 1,
                "industryType": "sample string 7",
                "vatRate": 1.0,
                "paperBilling": true
            }

            Response Format (integer)

            1

        """
        response = requests.post(
            f'{cls._api_endpoint}{MUGAPIEndpoints.REQUEST_CUSTOMER}',
            customer_data_json,
            headers=cls.get_headers()
        )

        cls._check_response_status(response)

        customer_id = MUGCustomerId.from_mug_api_response(response).id
        return customer_id


class SiteMUGApiClientMixin:
    @mug_request_decorator
    def request_add_site(cls: 'MUGApiClient', customer_id: int, site_data_json: str) -> int:
        """

            Make API Call for site creation

            Request Format (JSON)

            {
              "siteName": "sample string 1", (REQUIRED)
              "siteStatusId": 64,
              "address": {
                "line1": "sample string 1",
                "line2": "sample string 2",
                "city": "sample string 3",
                "county": "sample string 4",
                "postcode": "sample string 5"
              },
              "isElectricityCommissionOption": true,
              "electricityCommission": 1.0,
              "isGasCommissionOption": true,
              "gasCommission": 1.0,
              "landline": "sample string 2",
              "mobile": "sample string 3",
              "email": "sample string 4",
              "buildingSQFT": 1,
              "numberOfEmployees": 1,
              "siteType": "sample string 5"
            }

            Response Format (JSON)

            {
              "id": 1
            }

        """

        response = requests.post(
            f'{cls._api_endpoint}{MUGAPIEndpoints.REQUEST_SITE.format(customer_id=customer_id)}',
            site_data_json,
            headers=cls.get_headers()
        )
        cls._check_response_status(response)
        return MUGEntityId.from_mug_api_response(response.json()).id

    @mug_request_decorator
    def request_delete_site(cls: 'MUGApiClient', customer_id: int, site_id: int) -> bool:
        """

            Make API call to delete site

            Request Format (JSON)

            {
              "deleteReasonId": 1
            }

        """

        request_endpoint = MUGAPIEndpoints.REQUEST_SITE_DELETE.format(customer_id=customer_id, site_id=site_id)
        response = requests.delete(
            f'{cls._api_endpoint}{request_endpoint}',
            data=DeleteMUGEntityParams().to_json(),
            headers=cls.get_headers()
        )

        cls._check_response_status(response)
        return response.status_code == HTTPStatus.NO_CONTENT


class MeterMUGApiClientMixin:
    @mug_request_decorator
    def request_delete_meter(cls: 'MUGApiClient', customer_id: int, site_id: int, meter_id: int, meter_type: MUGMeterType) -> bool:
        """
            Make API Call to delete electric meter

            Request Format (JSON)

            {
              "deleteReasonId": 1
            }

        """

        request_endpoint = MUGAPIEndpoints.REQUEST_METER_DELETE.format(
            customer_id=customer_id,
            site_id=site_id,
            meter_id=meter_id,
            meter_type=meter_type.value,
        )
        response = requests.delete(
            f'{cls._api_endpoint}{request_endpoint}',
            data=DeleteMUGEntityParams().to_json(),
            headers=cls.get_headers(),
        )
        cls._check_response_status(response)
        return response.status_code == HTTPStatus.NO_CONTENT

    @mug_request_decorator
    def request_add_meter(cls: 'MUGApiClient', customer_id: int, site_id: int, meter_data_json: str, meter_type: MUGMeterType) -> int:
        """
            Make API Call for meter creation

            Request Format (JSON)

            {
              "supplierId": 1,
              "mpan": "sample string 1", (FOR ELECTRIC METER)
              "mprn": "sample string 1", (FOR GAS METER)
              "mpanOverwritten": true,
              "isAmr": 64,
              "standingCharge": 1.0,
              "unitRate": 1.0,
              "usage": 1,
              "nightUnitRate": 1.0,
              "nightUsage": 1,
              "weekendUnitRate": 1.0,
              "weekendUsage": 1,
              "standingChargePeriodId": 4,
              "consumptionPeriodId": 5,
              "currentContractEndDate": "2019-04-15T10:20:19.1935783+00:00",
              "preferredContractStartDate": "2019-04-15T10:20:19.1935783+00:00",
              "preferredContractEndDate": "2019-04-15T10:20:19.1935783+00:00",
              "isCommisionFromCustomer": true,
              "isCommisionFromSite": true,
              "commission": 1.0,
              "rateType": "Single",
              "meterVoltage": "sample string 6",
              "availableSupplyCapacity": 1.0,
              "included": true,
              "outOfContract": true,
              "comparison": true,
              "type": "sample string 10"
            }

            Response Format (JSON)

            {
              "id": 1
            }

        """

        request_endpoint = MUGAPIEndpoints.REQUEST_METER.format(customer_id=customer_id, site_id=site_id,
                                                                 meter_type=meter_type.value)

        response = requests.post(
            f'{cls._api_endpoint}{request_endpoint}',
            meter_data_json,
            headers=cls.get_headers()
        )
        cls._check_response_status(response)
        return MUGEntityId.from_mug_api_response(response.json()).id

    @mug_request_decorator
    def request_get_meter_info(cls: 'MUGApiClient', meter_type: MUGMeterType, meter_id: str) -> int:
        if meter_type == MeterType.ELECTRICITY.value:
            meter_type_abbr = 'mpan'
        elif meter_type == MeterType.GAS.value:
            meter_type_abbr = 'mprn'
        else:
            raise MUGBadRequestData
        request_endpoint = MUGAPIEndpoints.REQUEST_MPAN_MPRN_INFO.format(
            meter_type_by_fuel=meter_type_abbr.capitalize()
        )

        response = requests.post(
            f'{cls._api_endpoint}{request_endpoint}',
            json.dumps({meter_type_abbr: meter_id}),
            headers=cls.get_headers()
        )
        cls._check_response_status(response)
        if response.status_code == HTTPStatus.NO_CONTENT:
            raise MUGEmptyData
        return MUGMeterRateType.from_mug_api_response(response.json(), meter_type_abbr)

    @mug_request_decorator
    def request_get_meter_savings(cls: 'MUGApiClient', customer_id: str, site_id:str, meter_id: str):
        request_endpoint = MUGAPIEndpoints.REQUEST_METER_SAVINGS.format(customer_id=customer_id, site_id=site_id, meter_id=meter_id)
        try:
            response = requests.get(f'{cls._api_endpoint}{request_endpoint}', headers=cls.get_headers())
        except Exception as e:
            logger.error(f'request SAVINGS fails with exception: {e}')

        cls._check_response_status(response)
        if response.status_code == HTTPStatus.NO_CONTENT:
            raise MUGEmptyData
        return json.loads(MUGMeterSavings.from_savings_response(response.json()).to_json())

    @mug_request_decorator
    def request_get_carbon_intensity(cls: 'MUGApiClient', customer_id: str, site_id:str, meter_id: str):
        request_endpoint = MUGAPIEndpoints.REQUEST_CARBON_INTENSITY.format(customer_id=customer_id, site_id=site_id, meter_id=meter_id)
        try:
            response = requests.get(f'{cls._api_endpoint}{request_endpoint}', headers=cls.get_headers())
        except Exception as e:
            logger.error(f'request carbon intensity fails with exception: {e}')
        cls._check_response_status(response)
        if response.status_code == HTTPStatus.NO_CONTENT:
            raise MUGEmptyData
        return json.loads(MUGCarbonIntensity.from_carbon_response(response.json()).to_json())

    @classmethod
    def bulk_create_meters(cls: 'MUGApiClient', customer_id, site_id, meters: list) -> Dict[str, int]:
        mug_meters_id: Dict[str, int] = {}

        for meter in meters:
            mug_meter_id = cls.create_meter(customer_id, site_id, meter)
            if mug_meter_id:
                mug_meters_id[meter['meter_id']] = mug_meter_id

        return mug_meters_id

    @classmethod
    def create_meter(cls: 'MUGApiClient', customer_id, site_id, meter: dict) -> int:
        meter_params = MUGMeterParams.from_serializer_data(meter)
        mug_meter_id = None

        if meter_params.fuel_type in METER_TYPE__MUG_METER_TYPE__MAP:
            meter_type = METER_TYPE__MUG_METER_TYPE__MAP[meter_params.fuel_type]
            mug_meter_id = cls.request_add_meter(
                customer_id=customer_id,
                site_id=site_id,
                meter_data_json=meter_params.to_json(),
                meter_type=meter_type
            )
        return mug_meter_id

    @classmethod
    def post_extra_meter_details(cls: 'MUGApiClient', customer_id, site_id, meter_id, meter):
        request_endpoint = MUGAPIEndpoints.REQUEST_BATTERY.format(
            customer_id=customer_id,
            site_id=site_id,
            meter_type='electric',
            meter_id=meter_id,
        )
        data = {
            'BatteryCapacity': meter.battery_capacity,
            'IsBatteryPhysical': meter.is_battery_physical,
            'IsSolar': meter.has_solar,
            'SolarCapacity': meter.solar_capacity,
        }
        try:
            requests.post(
                f'{cls._api_endpoint}{request_endpoint}',
                json.dumps(data),
                headers=cls.get_headers()
            )
            print("post extra meter details successfully")

        except Exception as e:
            print(f"Error posting extra meter details: {e}")

class ComparisonMUGApiClientMixin:
    @mug_request_decorator
    def request_comparison(
            cls: 'MUGApiClient', customer_id: int, site_id: int, meter_id: int, meter_type: MUGMeterType
    ) -> Dict[str, List[MUGComparisonResult]]:

        """
            Make API call for comparison

            Response format (JSON)

            {
              "quoteId": 1,
              "results": [
                {
                  "resultId": 1,
                  ...
                  RESULT PARAMS
                  ...
                },
                {
                  "resultId": 2,
                  ...
                  RESULT PARAMS
                  ...
                }
              ],
              "hhResults": [
                {
                  "resultId": 3,
                  ...
                  RESULT PARAMS
                  ...
                },
                {
                  "resultId": 4,
                  ...
                  RESULT PARAMS
                  ...
                }
              ]
            }

        """

        request_endpoint = MUGAPIEndpoints.REQUEST_QUOTE.format(
            customer_id=customer_id,
            site_id=site_id,
            meter_id=meter_id,
            meter_type=meter_type.value,
        )
        response = requests.get(
            f'{cls._api_endpoint}{request_endpoint}',
            headers=cls.get_headers(),
        )
        cls._check_response_status(response)

        if response.status_code == HTTPStatus.PARTIAL_CONTENT:
            raise MUGAPIException(response.json())

        mug_data = response.json()
        compare_data = mug_data[MUGResponseKeys.COMPARISON_RESULTS]
        compare_hh_data = mug_data[MUGResponseKeys.COMPARISON_HH_RESULTS]

        if not (compare_data or compare_hh_data):
            raise MUGEmptyData

        results = [MUGComparisonResult.from_mug_api_response(result)._asdict()
                   for result in compare_data] if compare_data else []

        hh_results = [MUGComparisonResult.from_mug_api_response(result, is_hh=True)._asdict()
                      for result in compare_hh_data] if compare_hh_data else []

        return results + hh_results


class SwitchMUGApiClientMixin:
    @mug_request_decorator
    def request_switch(
            cls: 'MUGApiClient', customer_id: int, site_id: int, meter_id: int, meter_type: MUGMeterType, result_id: int
    ) -> int:
        """
            Make API call to make a tariff switching request

            Response format (JSON)

            {
              "contractId": 1
            }

        """

        request_endpoint = MUGAPIEndpoints.REQUEST_SWITCH.format(
            customer_id=customer_id,
            site_id=site_id,
            meter_id=meter_id,
            meter_type=meter_type.value,
            result_id=result_id
        )
        response = requests.get(
            f'{cls._api_endpoint}{request_endpoint}',
            headers=cls.get_headers(),
        )
        cls._check_response_status(response)

        return MUGEntityId.from_mug_api_response(data=response.json(), field_lookup='contractId').id

    @mug_request_decorator
    def request_bank_validation(cls: 'MUGApiClient', sort_code: str, account_number: str) -> bool:
        """
            Make API call to validate bank data

            Response format (JSON)

            {
              "aboutBankDto": {
                "sortcode": "sample string 1",
                "accountNumber": "sample string 2",
                "name": "sample string 3",
                "info": "sample string 4",
                "isValid": true,
                "branch": "sample string 6",
                "bankAddressLine1": "sample string 7",
                "bankAddressLine2": "sample string 8",
                "bankAddressTown": "sample string 9",
                "bankAddressPostCode": "sample string 10"
              },
              "apiVersion": "sample string 1",
              "uri": "sample string 2"
            }

        """

        request_endpoint = MUGAPIEndpoints.REQUEST_BANK_VALIDATION.format(
            sort_code=sort_code,
            account_number=account_number
        )
        response = requests.get(
            f'{cls._api_endpoint}{request_endpoint}',
            headers=cls.get_headers(),
        )
        cls._check_response_status(response)

        return response.json()[MUGResponseKeys.ABOUT_BANK_DTO][MUGResponseKeys.IS_VALID]


class SupplierMUGApiClientMixin:
    @mug_request_decorator
    def request_suppliers(cls: 'MUGApiClient') -> List[MUGSupplier]:

        '''
            Make API call to get suppliers list

            Response format (JSON)

            [
                {'id': 1,
                'name': 'CORONA ENERGY RETAIL 4 LIMITED',
                'description': 'CORONA ENERGY RETAIL 4 LIMITED'},
                ...
            ]
        '''

        response = requests.get(
            f'{cls._api_endpoint}{MUGAPIEndpoints.REQUEST_SUPPLIERS}',
            headers=cls.get_headers(),
        )
        cls._check_response_status(response)

        return [MUGSupplier.from_mug_api_response(supplier)._asdict()
                for supplier in response.json()]


class UpdateCustomerSitePaymentInfoMixin:

    @mug_request_decorator
    def update_payment_info(cls, switch_data: dict,
                            update_info_type: Union[MUGCustomerBankInfo, MUGSiteBankInfo],
                            customer_id: int, site_id: int = None):
        if update_info_type == MUGCustomerBankInfo:
            request_endpoint = MUGAPIEndpoints.REQUEST_UPDATE_CUSTOMER_PAYMENT_INFO.format(customer_id=customer_id)
            request_url = f'{cls._api_endpoint}{request_endpoint}'
        else:
            request_endpoint = MUGAPIEndpoints.REQUEST_UPDATE_SITE_PAYMENT_INFO.format(customer_id=customer_id,
                                                                                       site_id=site_id)
            request_url = f'{cls._api_endpoint}{request_endpoint}'

        request_data = update_info_type(
            **{
                key: switch_data[key] for key in switch_data.keys() if key in update_info_type._fields
            }
        )

        response = requests.put(
            request_url,
            request_data.to_json(),
            headers=cls.get_headers(),
        )
        cls._check_response_status(response)


class MUGApiClient(
    PostcodeMUGApiClientMixin,
    CustomerMUGApiClientMixin,
    SiteMUGApiClientMixin,
    MeterMUGApiClientMixin,
    ComparisonMUGApiClientMixin,
    SwitchMUGApiClientMixin,
    SupplierMUGApiClientMixin,
    UpdateCustomerSitePaymentInfoMixin,
):
    _session_payload: RestSessionPayload = None
    _api_auth_endpoint = settings.MUG_AUTH_API_URL
    _api_endpoint = settings.MUG_API_URL
    retry_count = 2
    retry_interval = 2
    acceptable_statuses = [HTTPStatus.OK, HTTPStatus.ACCEPTED, HTTPStatus.CREATED, HTTPStatus.NO_CONTENT,
                           HTTPStatus.PARTIAL_CONTENT, HTTPStatus.BAD_REQUEST]
    service_statuses = [HTTPStatus.UNAUTHORIZED, HTTPStatus.FORBIDDEN]

    @classmethod
    def refresh_session_payload(cls):
        cls._session_payload = cls.authorize()

    @classmethod
    def _check_response_status(cls, response: Response):
        if response.status_code not in cls.acceptable_statuses and response.status_code not in cls.service_statuses:
            raise MUGAPIException(
                f'MUG API returned non acceptable status {response.status_code}. Acceptable status list {cls.acceptable_statuses}')
        elif response.status_code == HTTPStatus.UNAUTHORIZED:
            cls.refresh_session_payload()
        elif response.status_code == HTTPStatus.FORBIDDEN:
            raise MUGBadCredentials(f'Forbidden returned bad mug API credentials')
        elif response.status_code == HTTPStatus.BAD_REQUEST:
            raise MUGBadRequest(response.content)

    @classmethod
    def get_auth_token(cls) -> str:
        """Method check token in class attribute if not exist than call authorize and save to class attribute"""

        try:
            if not cls._session_payload or cls._session_payload.is_expired():
                cls.refresh_session_payload()
        except (KeyError, AttributeError, json.decoder.JSONDecodeError,):
            cls.refresh_session_payload()
        return cls._session_payload.token

    @classmethod
    def get_auth_headers(cls) -> dict:
        """Prepare Authorization header for MUG API"""
        return {'Authorization': f'Bearer {cls.get_auth_token()}'}

    @classmethod
    def get_headers(cls) -> dict:
        """Required headers for request"""
        return {
            **cls.get_auth_headers(),
            'content-type': 'application/json'
        }

    @classmethod
    def get_login_params(cls) -> MUGLoginParams:
        """Convert Raw Login Params to internal structure"""
        mug_credentials: dict = settings.MUG_API_CREDENTIALS

        return MUGLoginParams(
            **mug_credentials
        )

    @classmethod
    def authorize(cls) -> RestSessionPayload:
        """Call Auth endpoint for access_token and for expiration date. Token is valid for one day"""
        response = requests.post(cls._api_auth_endpoint, cls.get_login_params()._asdict())

        cls._check_response_status(response)

        json_data: dict = response.json()

        return RestSessionPayload.from_custom_token_with_expiry_date(json_data.get('access_token'),
                                                                     parser.parse(json_data.get('.expires')).replace(
                                                                         tzinfo=pytz.utc))
