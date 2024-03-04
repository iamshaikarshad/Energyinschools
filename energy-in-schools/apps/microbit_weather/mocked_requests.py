from http import HTTPStatus
from utilities.requests_mock import RequestMock

from django.conf import settings

from apps.weather.utils import BASE_WEATHER_API_ENDPOINT


class OPEN_WEATHER_ENDPOINTS:
    weather_current = f'{BASE_WEATHER_API_ENDPOINT}{"weather"}?APPID={settings.OPEN_WEATHER_MAP_API_KEY}'
    weather_forecast = f'{BASE_WEATHER_API_ENDPOINT}{"forecast"}?APPID={settings.OPEN_WEATHER_MAP_API_KEY}'


class REQUEST_PARAMS:
    city = 'London%2CGB'
    postal_code = 'SW6%2CGB'
    wrong_city_postal_code = 'Wrong%2CGB'
    language = 'en'


GET_CURRENT_WEATHER_FOR_CITY_F = RequestMock(
    request_url=f'{OPEN_WEATHER_ENDPOINTS.weather_current}&q='
                f'{REQUEST_PARAMS.wrong_city_postal_code}&lang='
                f'{REQUEST_PARAMS.language}',
    request_method=RequestMock.Method.GET,
    response_status_code=HTTPStatus.NOT_FOUND,
)

GET_CURRENT_WEATHER_FOR_POSTAL_CODE_F = RequestMock(
    request_url=f'{OPEN_WEATHER_ENDPOINTS.weather_current}&zip='
                f'{REQUEST_PARAMS.wrong_city_postal_code}&lang='
                f'{REQUEST_PARAMS.language}',
    request_method=RequestMock.Method.GET,
    response_status_code=HTTPStatus.NOT_FOUND,
)

GET_FORECAST_WEATHER_FOR_CITY_F = RequestMock(
    request_url=f'{OPEN_WEATHER_ENDPOINTS.weather_forecast}&q='
                f'{REQUEST_PARAMS.wrong_city_postal_code}&lang='
                f'{REQUEST_PARAMS.language}',
    request_method=RequestMock.Method.GET,
    response_status_code=HTTPStatus.NOT_FOUND,
)

GET_FORECAST_WEATHER_FOR_POSTAL_CODE_F = RequestMock(
    request_url=f'{OPEN_WEATHER_ENDPOINTS.weather_forecast}&zip='
                f'{REQUEST_PARAMS.wrong_city_postal_code}&lang='
                f'{REQUEST_PARAMS.language}',
    request_method=RequestMock.Method.GET,
    response_status_code=HTTPStatus.NOT_FOUND,
)
