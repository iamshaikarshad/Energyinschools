from datetime import date, datetime, time, timedelta, timezone
from http import HTTPStatus

import funcy
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.hubs.authentication import RaspberryPiAuthentication
from apps.microbit_weather.serializers import WeatherLocationSelectorQuerySerializer
from apps.weather.serializers import WeatherSerializer
from apps.weather.utils import get_owm, handle_open_weather_errors, three_hours_forecast_at_zip_code
from utilities.mixins import DeserializeQueryParamsMixin


DEFAULT_COUNTRY_CODE = 'GB'
FORECAST_TIME = time(hour=12)


class MicrobitWeatherViewSet(DeserializeQueryParamsMixin, ViewSet):
    authentication_classes = RaspberryPiAuthentication,
    permission_classes = IsAuthenticated,
    query_serializer_class = WeatherLocationSelectorQuerySerializer

    @swagger_auto_schema(
        query_serializer=WeatherLocationSelectorQuerySerializer(),
        responses={HTTPStatus.OK.value: WeatherSerializer()}
    )
    @action(detail=False, url_path='current')
    def current(self, _: Request, **__):
        weather = None

        with handle_open_weather_errors():
            if self.postal_code:
                weather = self.owm.weather_at_zip_code(self.postal_code, DEFAULT_COUNTRY_CODE).get_weather()

            elif self.city:
                weather = self.owm.weather_at_place(self.city).get_weather()

        return Response(WeatherSerializer(
            instance=weather,
            context=dict(temperature_unit=self.temperature_unit)
        ).data)

    @swagger_auto_schema(
        query_serializer=WeatherLocationSelectorQuerySerializer(),
        responses={HTTPStatus.OK.value: WeatherSerializer()}
    )
    @action(detail=False, url_path='forecast/tomorrow')
    def tomorrow_forecast(self, _: Request, **__):
        weather_at = datetime.combine(date.today(), FORECAST_TIME, tzinfo=timezone.utc) + timedelta(days=1)
        weather = None

        with handle_open_weather_errors():
            if self.postal_code:
                weather = three_hours_forecast_at_zip_code(self.owm, self.postal_code, DEFAULT_COUNTRY_CODE) \
                    .get_weather_at(weather_at)

            elif self.city:
                weather = self.owm.three_hours_forecast(self.city).get_weather_at(weather_at)

        return Response(WeatherSerializer(
            instance=weather,
            context=dict(temperature_unit=self.temperature_unit)
        ).data)

    @funcy.cached_property
    def owm(self):
        return get_owm()

    @property
    def temperature_unit(self):
        return self.query_params_dict['temperature_unit']

    @property
    def postal_code(self):
        return self.query_params_dict.get('postal_code')

    @property
    def city(self):
        city = self.query_params_dict.get('city')

        if city and ',' not in city:
            city += ',' + DEFAULT_COUNTRY_CODE

        return city
