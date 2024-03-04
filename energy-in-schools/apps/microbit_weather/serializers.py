from typing import Any, Dict

from enumfields.drf import EnumField
from rest_framework import serializers

from apps.historical_data.serializers import BaseSerializer
from apps.weather.serializers import TemperatureUnit


class WeatherLocationSelectorQuerySerializer(BaseSerializer):
    postal_code = serializers.CharField(max_length=100, allow_blank=False, required=False)
    city = serializers.CharField(max_length=100, required=False)
    temperature_unit = EnumField(TemperatureUnit, default=TemperatureUnit.CELSIUS)

    def validate(self, attrs: Dict[str, Any]):
        if bool(attrs.get('postal_code')) == bool(attrs.get('city')):
            raise serializers.ValidationError('Post code or city should be populated!')

        return attrs
