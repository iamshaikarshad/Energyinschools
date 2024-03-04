import json
from datetime import datetime, timedelta, timezone
from http import HTTPStatus

import jwt

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import TimeRangeIsTooLargeError
from apps.energy_providers.providers.geo import GeoProviderConnection, logger
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.resources.types import ResourceDataNotAvailable, ResourceValue, TimeResolution, Unit
from utilities.requests_mock import RequestMock


class GeoProviderRequest:
    _EMAIL = 'the@e.mail'
    _PASSWORD = 'the password'
    _TOKEN = jwt.encode({'exp': datetime.now() + timedelta(hours=1)}, 'key').decode()
    _AUTH_HEADERS = {'Accept': 'application/json', 'Authorization': f'Bearer {_TOKEN}'}
    _METER_ID = 'the-meter-id'

    CREDENTIALS = {
        'login': _EMAIL,
        'password': _PASSWORD
    }

    LOGIN = RequestMock(
        request_url='https://solo3.energynote.eu/api/userapi/account/login',
        request_json={"emailAddress": _EMAIL, "password": _PASSWORD},
        request_headers={'Content-Type': 'application/json'},
        request_method=RequestMock.Method.POST,
        response_json={"token": _TOKEN}
    )

    LIVE_CONSUMPTION = RequestMock(
        request_url=f'https://solo3.energynote.eu/api/userapi/system/smets2-live-data/{_METER_ID}',
        response_json={
            "latestUtc": 1456254967,
            "id": _METER_ID,
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
        request_url=f'https://solo3.energynote.eu/api/userapi/system/smets2-live-data/{_METER_ID}',
        response_json={
            "latestUtc": 0,
            "id": _METER_ID,
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

    PER_DAY_HISTORICAL_CONSUMPTION = RequestMock(
        request_url=f'https://solo3.energynote.eu/api/userapi/system/smets2-historic-day/{_METER_ID}?'
                    f'from=2000-10-05&to=2000-10-15',
        response_json={
            "totalsList": [
                {
                    "id": "string",
                    "year": 2000,
                    "month": 10,
                    "day": 10,
                    "commodityTotalsList": [
                        {
                            "commodityType": "ELECTRICITY",
                            "energyKWh": 10,
                            "costPence": 10
                        }
                    ]
                }
            ]
        }
    )

    PER_WEAK_HISTORICAL_CONSUMPTION = PER_DAY_HISTORICAL_CONSUMPTION._replace(
        request_url=f'https://solo3.energynote.eu/api/userapi/system/smets2-historic-week/{_METER_ID}?'
                    f'from=2000-10-05&to=2000-10-15'
    )

    PER_MONTH_HISTORICAL_CONSUMPTION = PER_DAY_HISTORICAL_CONSUMPTION._replace(
        request_url=f'https://solo3.energynote.eu/api/userapi/system/smets2-historic-month/{_METER_ID}?'
                    f'fromMonth=10&fromYear=2000&toMonth=10&toYear=2000'
    )

    PER_DAY_HISTORICAL_CONSUMPTION_TO_LARGE_TIME_RANGE = PER_DAY_HISTORICAL_CONSUMPTION._replace(
        response_status_code=HTTPStatus.BAD_REQUEST,
        response_json={
            "reason": "Failed to get epochs:max search limit exceeded"
        }
    )


class TestGeo(EnergyProviderBaseTestCase):
    METER_VALUE = ResourceValue(value=11470, time=datetime.fromtimestamp(1456254967, tz=timezone.utc), unit=Unit.WATT)
    HISTORICAL_METER_VALUES = [
        ResourceValue(time=datetime(2000, 10, 10, tzinfo=timezone.utc), value=10, unit=Unit.WATT)
    ]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logger.disabled = True

    @classmethod
    def create_energy_provider(cls, **kwargs):
        energy_provider = EnergyProviderAccount(
            provider=EnergyProviderAccount.Provider.GEO,
            credentials=json.dumps({
                'login': GeoProviderRequest._EMAIL,
                'password': GeoProviderRequest._PASSWORD
            }).encode(),
            location=cls.get_user().location,
            name='the name',
            description='the description',
        )

        energy_provider.save()

        return energy_provider

    def setUp(self):
        super().setUp()
        GeoProviderConnection.USE_NOW_INSTEAD_REAL_TIMESTAMP = False
        GeoProviderConnection.get_consumption.invalidate_all()
        GeoProviderConnection.get_historical_consumption.invalidate_all()

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN])
    def test_login(self):
        connection = self.energy_provider.connection
        connection.login()

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN,
                                  GeoProviderRequest.LIVE_CONSUMPTION])
    def test_get_live_consumption(self):
        with self.subTest('Test request'):
            self.assertEqual(self.METER_VALUE, self.energy_meter.fetch_current_value())

        with self.subTest('Test cache'):
            self.assertEqual(self.METER_VALUE, self.energy_meter.fetch_current_value())
            self.assertEqual(self.METER_VALUE, self.energy_meter.fetch_current_value())

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN,
                                  GeoProviderRequest.LIVE_CONSUMPTION_NO_DATA,
                                  GeoProviderRequest.LIVE_CONSUMPTION_NO_DATA,
                                  GeoProviderRequest.LIVE_CONSUMPTION_NO_DATA])
    def test_get_live_consumption_no_data(self):
        with self.assertRaises(ResourceDataNotAvailable):
            self.energy_meter.fetch_current_value()

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN,
                                  GeoProviderRequest.PER_DAY_HISTORICAL_CONSUMPTION])
    def test_get_daily_historical_consumption(self):
        self.validate_historical_value(TimeResolution.DAY)

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN,
                                  GeoProviderRequest.PER_WEAK_HISTORICAL_CONSUMPTION])
    def test_get_weekly_historical_consumption(self):
        self.validate_historical_value(TimeResolution.WEEK)

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN,
                                  GeoProviderRequest.PER_MONTH_HISTORICAL_CONSUMPTION])
    def test_get_monthly_historical_consumption(self):
        self.validate_historical_value(TimeResolution.MONTH)

    @RequestMock.assert_requests([GeoProviderRequest.LOGIN,
                                  GeoProviderRequest.PER_DAY_HISTORICAL_CONSUMPTION_TO_LARGE_TIME_RANGE])
    def test_get_historical_consumption_with_too_large_time_range(self):
        with self.assertRaises(TimeRangeIsTooLargeError):
            self.validate_historical_value(TimeResolution.DAY)

    def validate_historical_value(self, time_resolution: TimeResolution):
        meter_values = self.energy_meter.fetch_historical_consumption(
            datetime(2000, 10, 5),
            datetime(2000, 10, 15),
            time_resolution
        )

        self.assertEqual(self.HISTORICAL_METER_VALUES, meter_values)
