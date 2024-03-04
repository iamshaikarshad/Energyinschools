from datetime import date, datetime, timedelta
from http import HTTPStatus

from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.addresses.models import Address
from apps.weather.serializers import TemperatureUnit, WeatherForecastSerializer, WeatherQueryParamsSerializer, \
    WeatherWithLocationSerializer, OpenWeatherQueryParamsSerializer, FilterType, OpenWeatherForecastSerializer
from apps.weather.utils import get_owm, handle_open_weather_errors
from utilities.mixins import DeserializeQueryParamsMixin


class WeatherViewSet(DeserializeQueryParamsMixin, ViewSet):
    permission_classes = IsAuthenticated,
    query_serializer_class = WeatherQueryParamsSerializer

    @swagger_auto_schema(method='get',
                         query_serializer=WeatherQueryParamsSerializer,
                         responses={HTTPStatus.OK.value: WeatherWithLocationSerializer()})
    @action(methods=['get'], detail=False, url_path='current', permission_classes=(IsAuthenticated,))
    def current_weather(self, _):
        with handle_open_weather_errors():
            observation = get_owm().weather_at_coords(self.address.latitude, self.address.longitude)
            location = observation.get_location()
            weather = observation.get_weather()

        return Response(WeatherWithLocationSerializer(instance=dict(
            weather=weather,
            location=location,
        ), context=dict(temperature_unit=self.temperature_unit)).data)


    def weather_forecast_data(self):

        with handle_open_weather_errors():
            forecaster = get_owm().three_hours_forecast_at_coords(self.address.latitude, self.address.longitude)

            forecast = forecaster.get_forecast().get_weathers()
            location = forecaster.get_forecast().get_location()
        
        return forecast, location


    @swagger_auto_schema(method='get',
                         query_serializer=WeatherQueryParamsSerializer(),
                         responses={HTTPStatus.OK.value: WeatherForecastSerializer()})
    @action(methods=['get'], detail=False, url_path='forecast', permission_classes=(IsAuthenticated,))
    def forecast_weather(self, _):
        minimal_time = (datetime.now() + timedelta(minutes=30)).timestamp()

        forecast, location = self.weather_forecast_data()

        return Response(WeatherForecastSerializer(instance=dict(
            weathers=[weather for weather in forecast if weather.get_reference_time() > minimal_time],
            location=location,
        ), context=dict(temperature_unit=self.temperature_unit)).data)


    @swagger_auto_schema(method='get',
                         query_serializer=WeatherQueryParamsSerializer(),
                         responses={HTTPStatus.OK.value: WeatherForecastSerializer()})
    @action(methods=['get'], detail=False, url_path='forecast-tomorrow', permission_classes=(IsAuthenticated,))
    def forecast_tomorrow(self, _):
        today = datetime.today().date()
        tomorrow = today + timedelta(days=1)
        forecasts, location = self.weather_forecast_data()
        tomorrow_weather = [forecast for forecast in forecasts if forecast.get_reference_time(timeformat='date').date() == tomorrow]

        return Response(WeatherForecastSerializer(instance=dict(
            weathers=tomorrow_weather,
            location=location,
        ), context=dict(temperature_unit=self.temperature_unit)).data)

    @property
    def temperature_unit(self) -> TemperatureUnit:
        return self.query_params_dict['temperature_unit']

    @property
    def address(self) -> Address:
        return self.query_params_dict['location_uid'].address


DIRECTIONS = {
    "N": [337.5, 22.5],
    "NE": [22.5, 67.5],
    "E": [67.5, 112.5],
    "SE": [112.5, 157.5],
    "S": [157.5, 202.5],
    "SW": [202.5, 247.5],
    "W": [247.5, 292.5],
    "NW": [292.5, 337.5],
}


def get_wind_direction(forecast):
    degree = forecast.get_wind()['deg']

    return next(
        key for key, value in DIRECTIONS.items()
        if (value[0] <= degree < value[1])
        or ((value[0] > value[1]) and (
            (value[0] <= degree <= 360)
            or (0 <= degree <= value[1])
        ))
    )


class OpenWeatherViewSet(DeserializeQueryParamsMixin, ViewSet):
    permission_classes = [AllowAny]
    query_serializer_class = OpenWeatherQueryParamsSerializer

    @swagger_auto_schema(method='get',
                         query_serializer=OpenWeatherQueryParamsSerializer(),
                         responses={HTTPStatus.OK.value: OpenWeatherForecastSerializer()})
    @action(methods=['get'], url_path='open', detail=False)
    def forecast(self, _):
        if self.query_params_dict['filter_type'] == FilterType.CITY:
            city = self.query_params_dict['filter']

            with handle_open_weather_errors():
                owm = get_owm()

                location = owm.weather_at_place(city).get_location()
                forecaster = owm.three_hours_forecast_at_coords(location.get_lat(), location.get_lon())

                weathers = forecaster.get_forecast().get_weathers()
                today_forecast = weathers[0]
                tomorrow_forecast = weathers[8]
        else:
            postcode = self.query_params_dict['filter']
            country = self.query_params_dict['country']

            with handle_open_weather_errors():
                owm = get_owm()

                location = owm.weather_at_zip_code(postcode, country).get_location()
                forecaster = owm.three_hours_forecast_at_coords(location.get_lat(), location.get_lon())

                weathers = forecaster.get_forecast().get_weathers()
                today_forecast = weathers[0]
                tomorrow_forecast = weathers[8]

        temperature_unit = self.query_params_dict['temperature_unit']
        response = {
            'current_weather': {
                'weather': today_forecast.get_detailed_status(),
                'wind_direction': get_wind_direction(today_forecast),
                'temperature': today_forecast.get_temperature(unit=temperature_unit.value)['temp']
            },
            'tomorrow_forecast': {
                'weather': tomorrow_forecast.get_detailed_status(),
                'wind_direction': get_wind_direction(tomorrow_forecast),
                'temperature': tomorrow_forecast.get_temperature(unit=temperature_unit.value)['temp']
            }
        }

        return Response(response)
