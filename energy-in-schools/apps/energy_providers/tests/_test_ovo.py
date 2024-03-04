import json
from datetime import datetime, timedelta, timezone

import jwt

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.ovo import OvoProviderConnection
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.resources.types import ResourceDataNotAvailable, ResourceValue
from utilities.requests_mock import RequestMock


class OvoProviderRequest:
    _LOGIN = 'the login'
    _PASSWORD = 'the password'
    _TOKEN = jwt.encode({'exp': datetime.now() + timedelta(hours=1)}, 'key').decode()
    _AUTH_HEADERS = {'Accept': 'application/json', 'Authorization': f'Bearer {_TOKEN}'}

    CREDENTIALS = {
        'login': _LOGIN,
        'password': _PASSWORD
    }

    LOGIN = RequestMock(
        request_url='https://my.ovoenergy.com/api/auth/login',
        request_json={'rememberMe': True, 'username': _LOGIN, 'password': _PASSWORD},
        request_headers={'Content-Type': 'application/json'},
        request_method=RequestMock.Method.POST,
        response_json={
            "authenticated": True,
            "token": _TOKEN,
            "persistentToken": "some token",
            "userId": "some id",
            "username": "some name",
            "identifiers": {
                "paym": "132",
                "global": "GT-CUS-123"
            },
            "roles": [
                "CUSTOMER"
            ],
            "userCreationTime": "2010-12-02T15:26:01.000Z"
        }
    )

    LIVE_CONSUMPTION = RequestMock(
        request_url='https://solo3.energynote.eu/api/userapi/system/smets2-live-data/the-meter-id',
        response_json={
            "latestUtc": 1456254967,
            "id": "the-meter-id",
            "power": [
                {
                    "type": "ELECTRICITY",
                    "watts": 11470,
                    "valueAvailable": True
                },
                {
                    "type": "GAS_ENERGY",
                    "watts": 398,
                    "valueAvailable": True
                }
            ],
            "powerTimestamp": 1456254967,
            "localTime": 946701625,
            "localTimeTimestamp": 1456254967,
            "creditStatus": None,
            "creditStatusTimestamp": 0,
            "remainingCredit": None,
            "remainingCreditTimestamp": 0,
            "zigbeeStatus": {
                "electricityClusterStatus": "CONNECTED",
                "gasClusterStatus": "CONNECTED",
                "hanStatus": "CONNECTED",
                "networkRssi": -77
            },
            "zigbeeStatusTimestamp": 1456254967,
            "emergencyCredit": None,
            "emergencyCreditTimestamp": 0,
            "systemStatus": [
                {
                    "component": "DISPLAY",
                    "statusType": "STATUS_OK",
                    "systemErrorCode": "ERROR_CODE_NONE",
                    "systemErrorNumber": 0
                },
                {
                    "component": "ZIGBEE",
                    "statusType": "STATUS_OK",
                    "systemErrorCode": "ERROR_CODE_NONE",
                    "systemErrorNumber": 0
                },
                {
                    "component": "ELECTRICITY",
                    "statusType": "STATUS_OK",
                    "systemErrorCode": "ERROR_CODE_NONE",
                    "systemErrorNumber": 0
                },
                {
                    "component": "GAS",
                    "statusType": "STATUS_OK",
                    "systemErrorCode": "ERROR_CODE_NONE",
                    "systemErrorNumber": 0
                }
            ],
            "systemStatusTimestamp": 1456254967,
            "temperature": 25,
            "temperatureTimestamp": 1456254967,
            "ttl": 120
        }
    )

    LIVE_CONSUMPTION_NO_DATA = RequestMock(
        request_url='https://solo3.energynote.eu/api/userapi/system/smets2-live-data/the-meter-id',
        response_json={
            "latestUtc": 0,
            "id": "5b055741-2b52-4bf0-9da7-5a029eb6f9d6",
            "power": None,
            "powerTimestamp": 0,
            "localTime": 0,
            "localTimeTimestamp": 0,
            "creditStatus": None,
            "creditStatusTimestamp": 0,
            "remainingCredit": None,
            "remainingCreditTimestamp": 0,
            "zigbeeStatus": None,
            "zigbeeStatusTimestamp": 0,
            "emergencyCredit": None,
            "emergencyCreditTimestamp": 0,
            "systemStatus": [
                {
                    "component": "WIFI",
                    "statusType": "STATUS_ERROR",
                    "systemErrorCode": "ERROR_CODE_WIFI_NOT_CONNECTED",
                    "systemErrorNumber": 39
                }
            ],
            "systemStatusTimestamp": 0,
            "temperature": 0,
            "temperatureTimestamp": 0,
            "ttl": 0
        }
    )

    ACCOUNTS = RequestMock(
        response_json=[  # can be used if get_meters api will be requested
            {
                "id": "123",
                "globalId": "GT-ACC-1123",
                "userId": "123321",
                "supplierAccountId": "2663146",
                "accountHolder": "Mr 123",
                "customer": {
                    "title": "Mr",
                    "firstName": "123",
                    "lastName": "321"
                },
                "contacts": {
                    "email": "123@gmail.com",
                    "homeNumber": "",
                    "mobileNumber": "321 123",
                    "workNumber": ""
                },
                "balance": {
                    "amount": "12.03000000",
                    "currency": "GBP"
                },
                "directDebit": {
                    "directDebitType": "RECOMMENDED",
                    "frequency": "MONTHLY",
                    "paymentDay": 28,
                    "payment": {
                        "amount": "321.00000000",
                        "currency": "GBP"
                    },
                    "nextPaymentDate": "2018-07-30",
                    "creationDate": "2018-02-20"
                },
                "bankDetails": {
                    "accountHolder": "Mr 321",
                    "accountNumber": "******12",
                    "sortCode": "****12"
                },
                "homeAddress": {
                    "line1": "62 Wallwood Road",
                    "line2": "",
                    "line3": "",
                    "line4": "",
                    "town": "",
                    "county": "London",
                    "postcode": "E11 1AZ"
                },
                "billingAddress": {
                    "line1": "43 Mattison Road",
                    "line2": "",
                    "line3": "",
                    "line4": "",
                    "town": "",
                    "county": "London",
                    "postcode": "N4 1BG"
                },
                "consumers": [
                    {
                        "id": "1234",
                        "mpan": "123",
                        "installationId": "1003632",
                        "utilityType": "ELECTRICITY",
                        "utilitySubType": "STANDARD",
                        "status": "FULLY_REGISTERED",
                        "supplierStartDate": "2014-11-28",
                        "salesDate": "2014-10-27",
                        "coolOffPeriodEndDate": "2014-11-10",
                        "serviceOrders": [],
                        "meters": [
                            {
                                "id": "1905903",
                                "accountId": "2663146",
                                "supplierConsumerId": "11018506",
                                "supplierMeterId": "1905903",
                                "itemType": "ELECTRICITY",
                                "unitOfMeasure": "KWH",
                                "estimatedAnnualConsumption": "5484.9",
                                "meterSerialNumber": "14P0156526",
                                "numDigits": 7,
                                "isSmart": True,
                                "installationDate": "2014-11-28"
                            }
                        ]
                    },
                    {
                        "id": "123",
                        "mpan": "321",
                        "installationId": "1003633",
                        "utilityType": "GAS",
                        "utilitySubType": "STANDARD",
                        "status": "FULLY_REGISTERED",
                        "supplierStartDate": "2014-11-28",
                        "salesDate": "2014-10-27",
                        "coolOffPeriodEndDate": "2014-11-10",
                        "serviceOrders": [],
                        "meters": [
                            {
                                "id": "2230189",
                                "accountId": "2663146",
                                "supplierConsumerId": "11018507",
                                "supplierMeterId": "2230189",
                                "itemType": "GAS",
                                "unitOfMeasure": "M3",
                                "estimatedAnnualConsumption": "25251",
                                "meterSerialNumber": "G4P01458161400",
                                "numDigits": 5,
                                "isSmart": True,
                                "installationDate": "2014-11-28"
                            }
                        ]
                    }
                ],
                "contracts": [
                    {
                        "id": "6906383",
                        "consumerId": "11018506",
                        "startDate": "2018-02-04",
                        "upForRenewal": False,
                        "upForRefix": True,
                        "utility": "ELECTRICITY",
                        "standingCharge": {
                            "amount": {
                                "amount": "0.27400000",
                                "currency": "GBP"
                            },
                            "unit": "PER_DAY",
                            "item": "ELECTRICITY_STANDING_CHARGE"
                        },
                        "rates": {
                            "amount": {
                                "amount": "0.14500000",
                                "currency": "GBP"
                            },
                            "unit": "KWH",
                            "item": "ELECTRICITY"
                        },
                        "plan": {
                            "name": "Simpler Energy Variable (all online)",
                            "planType": "SIMPLER_ONLINE_ENERGY_VARIABLE_RATE",
                            "isFixed": False,
                            "isOnlineDiscount": True
                        },
                        "isRenewed": False,
                        "status": "ACTIVE"
                    },
                    {
                        "id": "6906384",
                        "consumerId": "11018507",
                        "startDate": "2018-02-04",
                        "upForRenewal": False,
                        "upForRefix": True,
                        "utility": "GAS",
                        "standingCharge": {
                            "amount": {
                                "amount": "0.27400000",
                                "currency": "GBP"
                            },
                            "unit": "PER_DAY",
                            "item": "GAS_STANDING_CHARGE"
                        },
                        "rates": {
                            "amount": {
                                "amount": "0.03640000",
                                "currency": "GBP"
                            },
                            "unit": "KWH",
                            "item": "GAS"
                        },
                        "plan": {
                            "name": "Simpler Energy Variable (all online)",
                            "planType": "SIMPLER_ONLINE_ENERGY_VARIABLE_RATE",
                            "isFixed": False,
                            "isOnlineDiscount": True
                        },
                        "isRenewed": False,
                        "status": "ACTIVE"
                    }
                ],
                "credentials": {
                    "username": "321",
                    "password": "********",
                    "customerId": "123"
                },
                "discountStatus": "JROD_RECEIVING",
                "supplyStartDate": "2010-11-28",
                "statementFrequency": {
                    "period": "MONTHLY",
                    "day": 28
                },
                "accountType": "REGULAR",
                "customerType": "PRIMARY"
            }
        ]
    )


class TestOvo(EnergyProviderBaseTestCase):
    METER_VALUE = ResourceValue(value=11470, time=datetime.fromtimestamp(1456254967, tz=timezone.utc))

    @classmethod
    def create_energy_provider(cls, **kwargs):
        energy_provider = EnergyProviderAccount(
            provider=EnergyProviderAccount.Provider.OVO,
            credentials=json.dumps({
                'login': OvoProviderRequest._LOGIN,
                'password': OvoProviderRequest._PASSWORD
            }).encode(),
            location=cls.get_user().location,
            name='the name',
            description='the description',
        )
        energy_provider.save()
        return energy_provider

    def setUp(self):
        super().setUp()
        OvoProviderConnection.get_consumption.invalidate_all()

    def get_connection(self) -> OvoProviderConnection:
        return self.energy_provider.connection

    @RequestMock.assert_requests([OvoProviderRequest.LOGIN])
    def test_login(self):
        connection = self.get_connection()
        connection.login()

    @RequestMock.assert_requests([OvoProviderRequest.LOGIN,
                                  OvoProviderRequest.LIVE_CONSUMPTION])
    def test_get_live_consumption(self):
        with self.subTest('Test request'):
            self.assertEqual(self.METER_VALUE, self.energy_meter.fetch_current_value())

        with self.subTest('Test cache'):
            self.assertEqual(self.METER_VALUE, self.energy_meter.fetch_current_value())
            self.assertEqual(self.METER_VALUE, self.energy_meter.fetch_current_value())

    @RequestMock.assert_requests([OvoProviderRequest.LOGIN,
                                  OvoProviderRequest.LIVE_CONSUMPTION_NO_DATA,  # 3 retries
                                  OvoProviderRequest.LIVE_CONSUMPTION_NO_DATA,
                                  OvoProviderRequest.LIVE_CONSUMPTION_NO_DATA])
    def test_get_live_consumption_no_data(self):
        with self.assertRaises(ResourceDataNotAvailable):
            self.energy_meter.fetch_current_value()
