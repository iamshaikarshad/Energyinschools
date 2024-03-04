from typing import Any, Dict

import funcy
from enumfields import Enum
from enumfields.drf import EnumField
from pyowm.weatherapi25.location import Location as WeatherLocation
from pyowm.weatherapi25.weather import Weather
from rest_framework import serializers

from apps.historical_data.serializers import BaseSerializer, HistoricalDataQuerySerializerSet
from apps.locations.serializer_fileds import OwnLocationSlugRelatedField
from apps.weather.models import WeatherTemperatureHistory
from utilities.logger import logger
from utilities.serializer_helpers import get_serializer_fields


class NullFloatField(serializers.FloatField):
    def __init__(self, **kwargs):
        assert 'allow_null' not in kwargs, '`allow_null` is not a valid option.'
        kwargs['allow_null'] = True
        super().__init__(**kwargs)

    def to_representation(self, value):
        if value is None:
            return None

        else:
            return super().to_representation(value)


class TemperatureUnit(Enum):
    KELVIN = 'kelvin'
    CELSIUS = 'celsius'
    FAHRENHEIT = 'fahrenheit'


class WeatherQueryParamsSerializer(BaseSerializer):
    location_uid = OwnLocationSlugRelatedField(slug_field='uid')
    temperature_unit = EnumField(TemperatureUnit, default=TemperatureUnit.CELSIUS)


class FilterType(Enum):
    CITY = 'city'
    POSTCODE = 'postcode'


class OpenWeatherQueryParamsSerializer(BaseSerializer):
    filter_type = EnumField(FilterType, default=FilterType.CITY)
    filter = serializers.CharField(min_length=1, max_length=50, default='London')
    country = serializers.CharField(min_length=1, max_length=50, default='gb')
    temperature_unit = EnumField(TemperatureUnit, default=TemperatureUnit.CELSIUS)


class FieldRepresentSerializer(BaseSerializer):
    def get_instance_as_dict(self, instance) -> Dict[str, Any]:
        raise NotImplementedError

    def to_representation(self, instance: Weather):
        return {
            field_name: self.fields[field_name].to_representation(value)
            for field_name, value in self.get_instance_as_dict(instance).items()
        }

    def to_internal_value(self, data):
        raise AttributeError('Unsupported')


class TemperatureSerializer(FieldRepresentSerializer):
    minimal = serializers.FloatField()
    average = serializers.FloatField()
    maximal = serializers.FloatField()

    def get_instance_as_dict(self, instance: Dict[str, Any]):
        return {
            'average': instance.get('temp'),
            'maximal': instance.get('temp_max'),
            'minimal': instance.get('temp_min'),
        }


class WindSerializer(FieldRepresentSerializer):
    speed = NullFloatField(required=False)
    degree = NullFloatField(required=False)

    def get_instance_as_dict(self, instance: Dict[str, Any]):
        return dict(
            speed=instance.get('speed'),
            degree=instance.get('deg')
        )


class PressureSerializer(FieldRepresentSerializer):
    pressure = NullFloatField(required=False)
    sea_level = NullFloatField(required=False)

    def get_instance_as_dict(self, instance: Dict[str, Any]):
        return dict(
            pressure=instance.get('press'),
            sea_level=instance.get('sea_level'),
        )


class WeatherSerializer(FieldRepresentSerializer):
    status = serializers.CharField()
    detailed_status = serializers.CharField()
    clouds_percentage = serializers.IntegerField()
    code = serializers.IntegerField()
    weather_at = serializers.DateTimeField()

    wind = WindSerializer()
    pressure = PressureSerializer()
    temperature = TemperatureSerializer()

    def get_instance_as_dict(self, instance: Weather):
        temperature_unit = self.context.get('temperature_unit', TemperatureUnit.CELSIUS).value
        return dict(
            status=instance.get_status(),
            detailed_status=instance.get_detailed_status(),
            clouds_percentage=instance.get_clouds(),
            code=instance.get_weather_code(),
            weather_at=instance.get_reference_time(timeformat='date'),
            wind=instance.get_wind(),
            pressure=instance.get_pressure(),
            temperature=instance.get_temperature(unit=temperature_unit)
        )

    @funcy.log_errors(logger.error, label='Wrong response from OpenWeather!')
    def to_representation(self, instance: Weather):
        return super().to_representation(instance)


class WeatherLocationSerializer(FieldRepresentSerializer):
    name = serializers.CharField()
    country = serializers.CharField()

    def get_instance_as_dict(self, instance: WeatherLocation):
        return dict(
            name=instance.get_name(),
            country=instance.get_country(),
        )

    @funcy.log_errors(logger.error, label='Wrong response from OpenWeather!')
    def to_representation(self, instance: Weather):
        return super().to_representation(instance)


class WeatherWithLocationSerializer(BaseSerializer):
    weather = WeatherSerializer()
    location = WeatherLocationSerializer()


class WeatherForecastSerializer(BaseSerializer):
    location = WeatherLocationSerializer()
    weathers = WeatherSerializer(many=True)


class DailyForecastSerializer(BaseSerializer):
    weather = serializers.CharField(min_length=1, max_length=50)
    wind_direction = serializers.CharField(min_length=1, max_length=3)
    temperature = serializers.FloatField()


class OpenWeatherForecastSerializer(BaseSerializer):
    current_weather = DailyForecastSerializer()
    tomorrow_forecast = DailyForecastSerializer()


class WeatherTemperatureHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherTemperatureHistory
        fields = get_serializer_fields(
            add_id=False
        )


serializer_set = HistoricalDataQuerySerializerSet('WeatherTemperatureHistory')
