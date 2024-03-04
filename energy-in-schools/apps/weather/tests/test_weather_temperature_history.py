from datetime import datetime, timezone
from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.historical_data.models import LongTermHistoricalData
from apps.resources.types import Unit
from apps.weather.models import WeatherTemperatureHistory
from apps.weather.tests.base_test_case import WeatherBaseTestCase


class TestTemperatureHistoryByLocation(WeatherBaseTestCase):
    URL = '/api/v1/weathers/historical/temperatures/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    def setUp(self):
        super().setUp()
        self._history_resource_id = self.create_weather_temperature_history_resource().id
        self.query_param = dict(
            location_uid=self.location.uid,
            unit='celsius',
            time_resolution='hour',
            to=datetime(2000, 10, 10, 11, 30, tzinfo=timezone.utc).isoformat()
        )

    def test_historical(self):
        self.create_weather_temperature_history()
        response = self.client.get(
            self.get_url(
                query_param=self.query_param
            )
        )
        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.CELSIUS.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 10, tzinfo=timezone.utc)),
                    value=0.0,
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 11, tzinfo=timezone.utc)),
                    value=10.0,
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_historical_wrong_location(self):
        self.query_param['location_uid'] = 'wrong'
        response = self.client.get(
            self.get_url(
                query_param=self.query_param
            )
        )

        self.assertResponse(response, HTTPStatus.NO_CONTENT)

    def test_historical_no_data(self):
        response = self.client.get(
            self.get_url(
                query_param=self.query_param
            )
        )

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.CELSIUS.value,
            values=[]
        ), response.data)

    def test_fetch_current_value(self):
        resource_value = self.weather_history_resource.fetch_current_value()
        self.assertEqual(Unit.CELSIUS, resource_value.unit)
        self.assertEqual(2.63, resource_value.value)

    def create_weather_temperature_history_resource(self):
        resource = WeatherTemperatureHistory.objects.create(
            sub_location=self.location,
        )
        return resource

    def create_weather_temperature_history(self):
        for index, (resource, time) in enumerate((
                (self.weather_history_resource, datetime(2000, 10, 10, 10, tzinfo=timezone.utc)),
                (self.weather_history_resource, datetime(2000, 10, 10, 11, tzinfo=timezone.utc)),
                (self.weather_history_resource, datetime(2000, 10, 10, 12, tzinfo=timezone.utc)),
        )):
            LongTermHistoricalData.objects.create(
                resource=resource,
                time=time,
                value=10 * index,
            )

    @property
    def weather_history_resource(self):
        return WeatherTemperatureHistory.objects.get(id=self._history_resource_id)
