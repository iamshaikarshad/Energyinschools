from datetime import datetime, timedelta
from http import HTTPStatus
from json import dumps
from pytz import utc

from faker import Factory
from django.conf import settings

from apps.mug_service.api_client import MUGAPIEndpoints
from apps.mug_service.constants import MUGMeterType, MUGMeterRatePeriod, MUGMeterRateTypes, PeriodsByRateType
from apps.mug_service.internal_types import MUGMeterParams
from utilities.requests_mock import RequestMock


faker = Factory.create()

DUMMY_CUSTOMER_ID = 111
DUMMY_SITE_ID = 222
DUMMY_GAS_METER_ID = 3331
DUMMY_ELECTRIC_METER_ID = 3332
DUMMY_REGISTRATION_REQUEST_ID = 444
DUMMY_SUPPLIER_ID = 2
DUMMY_TARIFF_NAME = "tariff name"
DUMMY_CONTRACT_ID = 3
DUMMY_RESULT_ID = 1
SORT_CODE = "123456"
ACCOUNT_NUMBER = "AccountNumber"
METER_TYPE = "Mpan"
DEFAULT_RATE_TYPE = MUGMeterRateTypes.SINGLE
CONSUMPTION_BY_RATES = [
    {
        'unit_rate_period': period.value,
        'unit_rate': faker.random_number(),
        'consumption': faker.random_number(1, 100),
    } for period in list(MUGMeterRatePeriod)
]

day_consumption = MUGMeterParams.get_consumption_rate_request(MUGMeterRatePeriod.DAY, CONSUMPTION_BY_RATES)
night_consumption = MUGMeterParams.get_consumption_rate_request(MUGMeterRatePeriod.NIGHT, CONSUMPTION_BY_RATES)
weekend_consumption = MUGMeterParams.get_consumption_rate_request(MUGMeterRatePeriod.EVENING_AND_WEEKEND, CONSUMPTION_BY_RATES)


class MUGAPIMockedRequests:
    _AUTH_ENDPOINT_RESPONSE_OLD_TOKEN = {
        "access_token": "Token",
        "token_type": "bearer",
        "expires_in": 86399,
        "forcePassword": "false",
        ".issued": "Fri, 29 Mar 2019 11:34:29 GMT",
        ".expires": "Sat, 30 Mar 2019 11:34:29 GMT"
    }

    _AUTH_ENDPOINT_RESPONSE = {
        "access_token": "Token",
        "token_type": "bearer",
        "expires_in": 86399,
        "forcePassword": "false",
        ".issued": datetime.now().isoformat(),
        ".expires": (datetime.now() + timedelta(days=1)).isoformat()
    }

    _REQUEST_BY_POSTCODE_RESPONSE = {
        "apiVersion": "1.0",
        "uri": "https://business-home-api-uat.myutilitygenius.co.uk/request/Address/list/company",
        "verifiedAddressDto": {
            "verifiedAddresses": [
                {
                    "parts": {
                        "addressLine1": "Test line 1",
                        "addressLine2": "Test line 2",
                        "town": "Test town",
                        "county": "Test county",
                        "postCode": "AXX XXX",
                        "mpan": [
                            "111111111111111111"
                        ],
                        "mprn": [
                            "11111111111111111"
                        ],
                        "installingSupplierName": [
                            "TEST SUPER TEST"
                        ]
                    },
                    "text": "Test super test, Test line1, Test line2, AXX XXX"
                },
                {
                    "parts": {
                        "addressLine1": "Test line 1",
                        "addressLine2": "Test line 2",
                        "town": "Test town",
                        "county": "Test country",
                        "postCode": "AXD XXX",
                        "mpan": [
                            "111111111111111111"
                        ],
                        "mprn": [
                            "11111111111111111"
                        ],
                        "installingSupplierName": [
                            "TEST SUPER TEST"
                        ]
                    },
                    "text": "Test super test, Test line1, Test line2, AXD XXX"
                },
            ]
        }
    }

    _COMPARISON_RESULT_RESPONSE = {'resultId': 2,
                                   'switchKeyInfo': None,
                                   'localDistributionZone': None,
                                   'distributionNetworkOperatorAreaId': '10',
                                   'contractStartDate': '2019-06-03T00:00:00+00:00',
                                   'contractEndDate': '2020-06-02T00:00:00+00:00',
                                   'contractTypeName': 'Fixed',
                                   'contractLengthInMonths': 36,
                                   'isGreen': 0,
                                   'payMethodName': 'All Payment Methods',
                                   'rateType': 'WeekdayAndNightAndEveningAndWeekend',
                                   'tariffName': 'HH Octopus',
                                   'tariffDetails': None,
                                   'supplierId': 64,
                                   'supplierName': 'CORONA ENERGY RETAIL 4 LIMITED',
                                   'supplierDescription': 'CORONA ENERGY RETAIL 4 LIMITED',
                                   'standingCharge': 75.0,
                                   'standingChargeUnit': 'PencePerDay',
                                   'totalStandingCharge': 274.5,
                                   'tariffRateInfos': [
                                       {
                                           "totalUsage": 0.000000,
                                           "usageUnit": "Annually",
                                           "totalCost": 3068.000000,
                                           "rateMeterType": "Weekday",
                                           "unitRate": 15.640000,
                                           "unitRateUnit": None
                                       },
                                       {
                                           "totalUsage": 5000.000000,
                                           "usageUnit": "Annually",
                                           "totalCost": 479.000000,
                                           "rateMeterType": "Night",
                                           "unitRate": 9.880000,
                                           "unitRateUnit": "PencePerKwh"
                                       },
                                       {
                                           "totalUsage": 5000.000000,
                                           "usageUnit": "Annually",
                                           "totalCost": 654.500000,
                                           "rateMeterType": "Weekend",
                                           "unitRate": 13.390000,
                                           "unitRateUnit": None
                                       }
                                   ],
                                   'savingsExcludingVat': 134346.06438833,
                                   'savingsIncludingVat': None,
                                   'totalCostIncludinglvat': 17544.17561167,
                                   'totalCostExcludingVat': 17544.17561167
                                   # The rest of parameters have been reduced. All list can be find here
                                   # https://business-home-api-uat.myutilitygenius.co.uk/documentation/resourcemodel?modelName=Result
                                   }

    _REQUEST_COMPARISON_RESPONSE = {
        'quoteId': 2727,
        'results': [{**_COMPARISON_RESULT_RESPONSE, 'resultId': 1}],
        'hhResults': [{**_COMPARISON_RESULT_RESPONSE, 'resultId': 2},
                      {**_COMPARISON_RESULT_RESPONSE, 'resultId': 3}]
    }

    _REQUEST_BANK_VALIDATION_RESPONSE = {
      "aboutBankDto": {
        "sortcode": "sample string 1",
        "accountNumber": "sample string 2",
        "name": "sample string 3",
        "info": "sample string 4",
        "isValid": True,
        "branch": "sample string 6",
        "bankAddressLine1": "sample string 7",
        "bankAddressLine2": "sample string 8",
        "bankAddressTown": "sample string 9",
        "bankAddressPostCode": "sample string 10"
      },
      "apiVersion": "sample string 1",
      "uri": "sample string 2"
    }

    _REQUEST_GET_SUPPLIERS_RESPONSE = [
        {
            "id": 1,
            "name": "CORONA ENERGY RETAIL 4 LIMITED",
            "description": "CORONA ENERGY RETAIL 4 LIMITED"
        },
        {
            "id": 2,
            "name": "SSE",
            "description": "SSE"
        },
        {
            "id": 3,
            "name": "Dual Energy",
            "description": "Dual Energy"
        },
    ]

    _REQUEST_SWITCH_RESPONSE = {
        'contractId': DUMMY_CONTRACT_ID,
    }

    _REQUEST_GET_METER_INFO_RESPONSE = {
        "apiVersion": 1.0,
        "uri": "https://myutilitygenius-business-home-api-test.azurewebsites.net/request/Info/Mpan",
        "mpanInfoDto": {
            "llf": "902",
            "mtc": "801",
            "mpanProfileClassId": "1",
            "rateType": "Single",
            "dnoAreaId": "12",
            "ssc": 393,
            "requiredRateMeterTypes": [
                "Single"
            ],
            "unitRateName": "Unit Rate",
            "nightUnitRateName": None,
            "weekendUnitRateName": None,
        }
    }

    @staticmethod
    def get_create_electric_meter_body():
        base_obj = {
            'currentContractEndDate': utc.localize(datetime(2000, 1, 1)).isoformat('T', 'microseconds'),
            'standingCharge': 24.0,
            'isAmr': 0,
            'mpan': 'electric meter id',
            'supplierId': 1,
            'rateType': DEFAULT_RATE_TYPE.value,
        }
        if day_consumption:
            base_obj['unitRate'] = float(day_consumption['unit_rate'])
            base_obj['usage'] = float(day_consumption['consumption'])
        if night_consumption and MUGMeterRatePeriod.NIGHT in PeriodsByRateType[DEFAULT_RATE_TYPE.value]:
            base_obj['unitRate'] = float(night_consumption['unit_rate'])
            base_obj['usage'] = float(night_consumption['consumption'])
        if weekend_consumption and MUGMeterRatePeriod.EVENING_AND_WEEKEND in PeriodsByRateType[DEFAULT_RATE_TYPE.value]:
            base_obj['unitRate'] = float(weekend_consumption['unit_rate'])
            base_obj['usage'] = float(weekend_consumption['consumption'])
        return dumps(base_obj)

    @staticmethod
    def get_create_gas_meter_body():
        return dumps({
            'currentContractEndDate': utc.localize(datetime(2000, 1, 1)).isoformat('T', 'microseconds'),
            'standingCharge': 24.0,
            'isAmr': 0,
            'mprn': 'gas meter id',
            'supplierId': 1,
            'unitRate': float(day_consumption['unit_rate']) if day_consumption else None,
            'consumption': float(day_consumption['consumption']) if day_consumption else None,
        })

    _request_endpoint_site_delete = MUGAPIEndpoints.REQUEST_SITE_DELETE.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
    )

    _request_endpoint_electric_meter_delete = MUGAPIEndpoints.REQUEST_METER_DELETE.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_id=DUMMY_ELECTRIC_METER_ID,
        meter_type=MUGMeterType.ELECTRIC.value,
    )

    _request_endpoint_gas_meter_delete = MUGAPIEndpoints.REQUEST_METER_DELETE.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_id=DUMMY_GAS_METER_ID,
        meter_type=MUGMeterType.GAS.value,
    )

    _request_endpoint_electric_meter_add = MUGAPIEndpoints.REQUEST_METER.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_type=MUGMeterType.ELECTRIC.value,
    )

    _request_endpoint_gas_meter_add = MUGAPIEndpoints.REQUEST_METER.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_type=MUGMeterType.GAS.value,
    )

    _request_endpoint_bank_validation = MUGAPIEndpoints.REQUEST_BANK_VALIDATION.format(
        account_number=ACCOUNT_NUMBER,
        sort_code=SORT_CODE,
    )

    _request_endpoint_comparison_electric_meter = MUGAPIEndpoints.REQUEST_QUOTE.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_id=DUMMY_ELECTRIC_METER_ID,
        meter_type=MUGMeterType.ELECTRIC.value,
    )

    _request_endpoint_comparison_gas_meter = MUGAPIEndpoints.REQUEST_QUOTE.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_id=DUMMY_GAS_METER_ID,
        meter_type=MUGMeterType.GAS.value,
    )

    _request_endpoint_get_suppliers = MUGAPIEndpoints.REQUEST_SUPPLIERS

    _request_endpoint_switch = MUGAPIEndpoints.REQUEST_SWITCH.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
        meter_id=DUMMY_ELECTRIC_METER_ID,
        meter_type=MUGMeterType.ELECTRIC.value,
        result_id=DUMMY_RESULT_ID,
    )

    _request_endpoint_get_meter_info = MUGAPIEndpoints.REQUEST_MPAN_MPRN_INFO.format(
        meter_type_by_fuel=METER_TYPE,
    )

    _request_endpoint_update_customer_bank_info = MUGAPIEndpoints.REQUEST_UPDATE_CUSTOMER_PAYMENT_INFO.format(
        customer_id=DUMMY_CUSTOMER_ID,
    )

    _request_endpoint_update_site_bank_info = MUGAPIEndpoints.REQUEST_UPDATE_SITE_PAYMENT_INFO.format(
        customer_id=DUMMY_CUSTOMER_ID,
        site_id=DUMMY_SITE_ID,
    )

    AUTHORIZE_REQUEST = RequestMock(
        request_url=settings.MUG_AUTH_API_URL,
        request_method=RequestMock.Method.POST,
        response_json=_AUTH_ENDPOINT_RESPONSE,  # XXX TODO ADD Request JSON
    )

    AUTHORIZE_REQUEST_FAIL = RequestMock(
        request_url=settings.MUG_AUTH_API_URL,
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.FORBIDDEN,
    )

    REQUEST_BY_POSTCODE = RequestMock(
        request_url=f'{settings.MUG_API_URL}{MUGAPIEndpoints.REQUEST_ADDRESS_BY_POSTCODE}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_BY_POSTCODE_RESPONSE,
    )

    REQUEST_BY_POSTCODE_FAILED_500 = RequestMock(
        request_url=f'{settings.MUG_API_URL}{MUGAPIEndpoints.REQUEST_ADDRESS_BY_POSTCODE}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
    )

    REQUEST_ADD_CUSTOMER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{MUGAPIEndpoints.REQUEST_CUSTOMER}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.CREATED,
        response_json=DUMMY_CUSTOMER_ID,
    )

    REQUEST_ADD_SITE = RequestMock(
        request_url=f'{settings.MUG_API_URL}{MUGAPIEndpoints.REQUEST_SITE.format(customer_id=DUMMY_CUSTOMER_ID)}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.CREATED,
        response_json={"id": 123},
    )

    REQUEST_DELETE_SITE = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_site_delete}',
        request_method=RequestMock.Method.DELETE,
        response_status_code=HTTPStatus.NO_CONTENT,
    )

    REQUEST_DELETE_ELECTRIC_METER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_electric_meter_delete}',
        request_method=RequestMock.Method.DELETE,
        response_status_code=HTTPStatus.NO_CONTENT,
    )

    REQUEST_DELETE_GAS_METER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_gas_meter_delete}',
        request_method=RequestMock.Method.DELETE,
        response_status_code=HTTPStatus.NO_CONTENT,
    )

    REQUEST_ADD_ELECTRIC_METER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_electric_meter_add}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.CREATED,
        response_json={"id": DUMMY_ELECTRIC_METER_ID},
        request_body=get_create_electric_meter_body.__func__(),
    )

    REQUEST_ADD_GAS_METER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_gas_meter_add}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.CREATED,
        response_json={"id": DUMMY_GAS_METER_ID},
        request_body=get_create_gas_meter_body.__func__(),
    )

    REQUEST_COMPARISON_ELECTRIC_METER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_comparison_electric_meter}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_COMPARISON_RESPONSE,
    )

    REQUEST_COMPARISON_GAS_METER = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_comparison_gas_meter}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_COMPARISON_RESPONSE,
    )

    REQUEST_BANK_VALIDATION = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_bank_validation}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_BANK_VALIDATION_RESPONSE,
    )

    REQUEST_GET_SUPPLIERS = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_get_suppliers}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_GET_SUPPLIERS_RESPONSE,
    )

    REQUEST_SWITCH = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_switch}',
        request_method=RequestMock.Method.GET,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_SWITCH_RESPONSE,
    )

    REQUEST_MUG_METER_INFO = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_get_meter_info}',
        request_method=RequestMock.Method.POST,
        response_status_code=HTTPStatus.OK,
        response_json=_REQUEST_GET_METER_INFO_RESPONSE,
    )

    REQUEST_UPDATE_CUSTOMER_BANK_INFO = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_update_customer_bank_info}',
        request_method=RequestMock.Method.PUT,
        response_status_code=HTTPStatus.NO_CONTENT,
    )

    REQUEST_UPDATE_SITE_BANK_INFO = RequestMock(
        request_url=f'{settings.MUG_API_URL}{_request_endpoint_update_site_bank_info}',
        request_method=RequestMock.Method.PUT,
        response_status_code=HTTPStatus.NO_CONTENT,
    )
