from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.main.base_test_case import BaseTestCase
from utilities.requests_mock import RequestMock
from .views import CarbonIntensityViewSet

INTENSITY_MOCK = RequestMock(
    request_url='https://api.carbonintensity.org.uk/intensity',
    request_headers={'Content-Type': 'application/json'},
    request_method=RequestMock.Method.GET,
    response_json={
        "data": [{
            "from": "2018-08-08T11:30Z",
            "to": "2018-08-08T12:00Z",
            "intensity": {
                "forecast": 195,
                "actual": 1313,
                "index": "moderate"
            }
        }]
    }
)

INTENSITY_FORECAST_ONLY_MOCK = RequestMock(
    request_url='https://api.carbonintensity.org.uk/intensity',
    request_headers={'Content-Type': 'application/json'},
    request_method=RequestMock.Method.GET,
    response_json={
        "data": [{
            "from": "2018-08-08T11:30Z",
            "to": "2018-08-08T12:00Z",
            "intensity": {
                "forecast": 195,
                "actual": None,
                "index": "moderate"
            }
        }]
    }
)
INTENSITY_MOCK_NULL = RequestMock(
    request_url='https://api.carbonintensity.org.uk/intensity',
    request_headers={'Content-Type': 'application/json'},
    request_method=RequestMock.Method.GET,
    response_json={
        "data": [{
            "from": "2018-08-08T11:30Z",
            "to": "2018-08-08T12:00Z",
            "intensity": {
                "forecast": None,
                "actual": None,
                "index": "moderate"
            }
        }]
    }
)

GENERATION_MOCK = RequestMock(
    request_url='https://api.carbonintensity.org.uk/generation',
    request_headers={'Content-Type': 'application/json'},
    request_method=RequestMock.Method.GET,
    response_json={
        "data": {
            "from": "2018-08-08T10:30Z",
            "to": "2018-08-08T11:00Z",
            "generationmix": [
                {"fuel": "biomass", "perc": 6.7},
                {"fuel": "coal", "perc": 1.1},
                {"fuel": "imports", "perc": 8.7},
                {"fuel": "gas", "perc": 37.1},
                {"fuel": "nuclear", "perc": 22.9},
                {"fuel": "other", "perc": 0},
                {"fuel": "hydro", "perc": 0.6},
                {"fuel": "solar", "perc": 15.3},
                {"fuel": "wind", "perc": 7.6}
            ]
        }
    }
)

NO_CONTENT_MOCK_INTENSITY = RequestMock(
    request_url='https://api.carbonintensity.org.uk/intensity',
    request_headers={'Content-Type': 'application/json'},
    request_method=RequestMock.Method.GET,
    response_status_code=HTTPStatus.INTERNAL_SERVER_ERROR
)

NO_CONTENT_MOCK_GENERATION = RequestMock(
    request_url='https://api.carbonintensity.org.uk/generation',
    request_headers={'Content-Type': 'application/json'},
    request_method=RequestMock.Method.GET,
    response_status_code=HTTPStatus.INTERNAL_SERVER_ERROR
)

CURRENT_CARBON_INTENSITY_RESPONSE = {
    'value': 1313,
    'gas': 37.1,
    'coal': 1.1,
    'nuclear': 22.9,
    'wind': 7.6,
    'solar': 15.3,
    'biomass': 6.7,
    'imports': 8.7,
    'other': 0,
    'hydro': 0.6
}


class TestCarbonIntensity(BaseTestCase):
    URL = '/api/v1/carbon-emission/composition/'
    FORCE_LOGIN_AS = RoleName.ES_USER

    def setUp(self):
        super().setUp()
        CarbonIntensityViewSet.get_intensity.invalidate_all()
        CarbonIntensityViewSet.get_generation.invalidate_all()

    @RequestMock.assert_requests([INTENSITY_MOCK, GENERATION_MOCK])
    def test_carbon_fetch_data_success(self):
        """check response data"""
        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual(CURRENT_CARBON_INTENSITY_RESPONSE, response.data)

    @RequestMock.assert_requests([INTENSITY_FORECAST_ONLY_MOCK, GENERATION_MOCK])
    def test_carbon_only_forecast_fetch_data_success(self):
        """check response data"""
        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual({**CURRENT_CARBON_INTENSITY_RESPONSE, 'value': 195}, response.data)

    @RequestMock.assert_requests([NO_CONTENT_MOCK_INTENSITY, NO_CONTENT_MOCK_INTENSITY, NO_CONTENT_MOCK_INTENSITY])
    def test_no_content_intensity_500(self):
        """Check intensity endpoint returned 500"""
        response = self.client.get(self.get_url())

        self.assertEqual(response.status_code, HTTPStatus.NO_CONTENT)

    @RequestMock.assert_requests([INTENSITY_MOCK_NULL, INTENSITY_MOCK_NULL, INTENSITY_MOCK_NULL])
    def test_no_content_intensity_null(self):
        """Check intensity endpoint returned null"""
        response = self.client.get(self.get_url())

        self.assertEqual(response.status_code, HTTPStatus.NO_CONTENT)

    @RequestMock.assert_requests([INTENSITY_MOCK,
                                  NO_CONTENT_MOCK_GENERATION,
                                  NO_CONTENT_MOCK_GENERATION,
                                  NO_CONTENT_MOCK_GENERATION])
    def test_no_content_generation(self):
        """Check generation endpoint returned 500 or null"""
        response = self.client.get(self.get_url())

        self.assertEqual(response.status_code, HTTPStatus.NO_CONTENT)
