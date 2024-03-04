from copy import deepcopy
from datetime import datetime, timedelta, timezone

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import Meter, MeterType
from apps.energy_providers.providers.n3rgy import N3RGYProviderConnection
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from utilities.requests_mock import RequestMock


LOGIN_MOCK = RequestMock(
    request_url='https://customer.data.n3rgy.com/api/keys?email=log&state=active',
    request_method=RequestMock.Method.GET,
    response_json=[
        {"token": "xxx", "type": "API_KEY_SANDBOX",
         "customerId": "CUSTOMER#1", "revocationDate": "Sep 14, 2019 8:57:17 PM"},
        {"token": "xxx", "type": "API_KEY_PORTAL",
         "customerId": "CUSTOMER#1", "revocationDate": "Sep 14, 2019 8:57:17 PM"}
    ]
)

N3RGY_RESPONSE_JSON = {
    "consumptions": [
        {"value": 4.96, "readingTimestamp": "2013-05-01"},
        {"value": 3.299, "readingTimestamp": "2013-05-02"},
        {"value": 3.86, "readingTimestamp": "2013-05-03"},
        {"value": 4.248, "readingTimestamp": "2013-05-04"},
        {"value": 4.206, "readingTimestamp": "2013-05-05"},
        {"value": 4.856, "readingTimestamp": "2013-05-06"},
        {"value": 4.309, "readingTimestamp": "2013-05-07"},
        {"value": 4.243, "readingTimestamp": "2013-05-08"},
        {"value": 4.559, "readingTimestamp": "2013-05-09"},
        {"value": 4.083, "readingTimestamp": "2013-05-10"},
        {"value": 4.634, "readingTimestamp": "2013-05-11"},
        {"value": 3.22, "readingTimestamp": "2013-05-12"},
        {"value": 4.722, "readingTimestamp": "2013-05-13"},
        {"value": 4.431, "readingTimestamp": "2013-05-14"}
    ],
    "responseTimestamp": 1537376304363
}

FROM = datetime.now(timezone.utc) - timedelta(minutes=10)
TO = datetime.now(timezone.utc)

USAGE_REQUEST_MOCK = RequestMock(
    request_url=f'https://sandboxapi.data.n3rgy.com/any/electricity/consumption/1?'
                f'start={FROM.year}{FROM.month}{FROM.day}{FROM.hour}{FROM.minute}&'
                f'end={TO.year}{TO.month}{TO.day}{TO.hour}{TO.minute}&granularity=halfhour',
    request_method=RequestMock.Method.GET,
    response_json=N3RGY_RESPONSE_JSON
)

N3RGY_RESPONSE_JSON_DIFF = deepcopy(N3RGY_RESPONSE_JSON)
N3RGY_RESPONSE_JSON_DIFF['consumptions'][0]['value'] = 10000000

USAGE_REQUEST_MOCK_DIFFERENT = RequestMock(
    request_url=f'https://sandboxapi.data.n3rgy.com/any/electricity/consumption/1?'
                f'start={FROM.year}{FROM.month}{FROM.day}{FROM.hour}{FROM.minute}&'
                f'end={TO.year}{TO.month}{TO.day}{TO.hour}{TO.minute}&granularity=halfhour',
    request_method=RequestMock.Method.GET,
    response_json=N3RGY_RESPONSE_JSON_DIFF
)


class TestN3RGYProvider(EnergyProviderBaseTestCase):
    provider = EnergyProviderAccount.Provider.N3RGY

    @RequestMock.assert_requests([LOGIN_MOCK, USAGE_REQUEST_MOCK])
    def test_get_consumption_cached(self):
        values_prepared = [entry['value'] for entry in N3RGY_RESPONSE_JSON['consumptions']]
        values = []
        for index in range(5):
            value = self.energy_provider.connection.get_consumption(Meter(
                meter_id='any',
                type=MeterType.ELECTRICITY
            ))
            values.append(value[1])

        self.assertEqual(values_prepared[:5], values)

    @RequestMock.assert_requests([LOGIN_MOCK, USAGE_REQUEST_MOCK, USAGE_REQUEST_MOCK_DIFFERENT])
    def test_get_consumption_without_cache(self):
        prev_value = 0
        for _ in range(2):
            N3RGYProviderConnection.call_api.invalidate_all()
            value = self.energy_provider.connection.get_consumption(Meter(
                meter_id='any',
                type=MeterType.ELECTRICITY
            ))
            self.assertNotEqual(value, prev_value)  # SHOULD BE 1000000 TODO REPLACE BETTER CHECK
            prev_value = value
