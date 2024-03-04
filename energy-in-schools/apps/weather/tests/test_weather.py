from datetime import datetime, timezone
from http import HTTPStatus
from unittest.mock import Mock, patch

from apps.accounts.permissions import RoleName
from apps.addresses.models import Address
from apps.locations.models import Location
from apps.weather.tests.base_test_case import WeatherBaseTestCase


datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = datetime(2019, 1, 31, 14, 20, tzinfo=timezone.utc)


class TestWeather(WeatherBaseTestCase):
    URL = '/api/v1/weathers/'
    FORCE_LOGIN_AS = RoleName.ES_USER

    def test_current_weather(self):
        with self.subTest('For parent location'):
            response = self.client.get(self.get_url('current'), data={'location_uid': self.location.uid})

            self.assertResponse(response)

            self.assertDictEqual({
                'clouds_percentage': 24,
                'code': 521,
                'weather_at': '2019-01-31T12:20:00Z',
                'detailed_status': 'shower rain',
                'pressure': {'pressure': 992.0, 'sea_level': None},
                'status': 'Rain',
                'temperature': {'average': 2.63, 'maximal': 5.0, 'minimal': 1.0},
                'wind': {'degree': 90.0, 'speed': 4.6}
            }, response.data['weather'])

            self.assertDictEqual({
                'country': 'GB',
                'name': 'City of Westminster'
            }, response.data['location'])

        with self.subTest('For sublocation'):
            sub_location = Location.objects.create(
                parent_location=self.location,
                address=Address.objects.create(line_1='address')
            )
            response = self.client.get(self.get_url('current'), data={'location_uid': sub_location.uid})
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    @patch('apps.weather.views.weather.datetime', new=datetime_mock)
    def test_forecast_weather(self):
        response = self.client.get(self.get_url('forecast'), data={'location_uid': self.location.uid})
        self.assertResponse(response)
        self.assertEqual(40, len(response.data['weathers']))
        self.assertDictEqual({
            'status': 'Clouds',
            'detailed_status': 'overcast clouds',
            'clouds_percentage': 88,
            'code': 804,
            'weather_at': '2019-01-31T15:00:00Z',
            'wind': {'speed': 5.91, 'degree': 120.003},
            'pressure': {'pressure': 993.78, 'sea_level': 1001.35},
            'temperature': {'average': 2.79, 'maximal': 3.1, 'minimal': 2.79}
        }, response.data.get('weathers')[0])
        self.assertDictEqual({
            'name': 'City of Westminster',
            'country': 'GB'
        }, response.data.get('location'))

    def test_current_weather_invalid_location(self):
        response = self.client.get(self.get_url('current'), data={'location_uid': 'invalid'})
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_weather_forecast_invalid_location(self):
        response = self.client.get(self.get_url('forecast'), data={'location_uid': 'invalid'})
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_current_weather_no_location_uid(self):
        response = self.client.get(self.get_url('current'))
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.json()['location_uid'], ['This field is required.'])

    def test_current_weather_invalid_units(self):
        response = self.client.get(self.get_url('current'),
                                   data={'location_uid': self.location.uid, 'temperature_unit': 'invalid'})
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.json()['temperature_unit'], ['"invalid" is not a valid choice.'])
