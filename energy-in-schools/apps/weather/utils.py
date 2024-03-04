import funcy
import pyowm
from django.conf import settings
from pyowm.commons import http_client
from pyowm.exceptions.api_response_error import NotFoundError
from pyowm.weatherapi25 import forecaster
from pyowm.weatherapi25.configuration25 import THREE_HOURS_FORECAST_URL
from rest_framework.exceptions import ValidationError

import apps.weather.pyowm_config
from utilities.exceptions import BadGatewayError
from utilities.logger import logger
BASE_WEATHER_API_ENDPOINT = f'http://api.openweathermap.org/data/2.5/'


def get_owm():
    return pyowm.OWM(
        settings.OPEN_WEATHER_MAP_API_KEY,
        config_module=apps.weather.pyowm_config.__name__,
    )


def three_hours_forecast_at_zip_code(self, zipcode, country):
    # todo: make a PR to pyowm!
    assert isinstance(zipcode, str), "Value must be a string"
    assert isinstance(country, str), "Value must be a string"
    encoded_zip = zipcode
    encoded_country = country
    zip_param = encoded_zip + ',' + encoded_country
    params = {'zip': zip_param, 'lang': self._language}

    uri = http_client.HttpClient.to_url(THREE_HOURS_FORECAST_URL,
                                        self._API_key,
                                        self._subscription_type,
                                        self._use_ssl)
    _, json_data = self._wapi.cacheable_get_json(uri, params=params)
    forecast = self._parsers['forecast'].parse_JSON(json_data)
    if forecast is not None:
        forecast.set_interval("3h")

        return forecaster.Forecaster(forecast)
    else:
        return None


@funcy.contextmanager
def handle_open_weather_errors():
    try:
        with funcy.log_errors(logger.error, label='Weather API did not respond'):
            yield

    except ValidationError:
        raise

    except NotFoundError as exception:
        raise ValidationError from exception

    except Exception as exception:
        raise BadGatewayError from exception
