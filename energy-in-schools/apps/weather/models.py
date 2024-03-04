from datetime import datetime, timezone
from typing import Any, Union

from django.db import models

from apps.resources.models import PullSupportedResource, Resource
from apps.resources.types import DataCollectionMethod, ResourceChildType, ResourceValue, TimeResolution, Unit


class WeatherTemperatureHistory(PullSupportedResource):
    class Meta:
        verbose_name_plural = "Weather temperature history"

    sa: Union['WeatherTemperatureHistory', Any]  # SQLAlchemy provided by aldjemy

    resource_ptr = models.OneToOneField(
        to=Resource,
        parent_link=True,
        related_name=ResourceChildType.WEATHER_TEMPERATURE.value,
        on_delete=models.CASCADE
    )

    def save(self, **kwargs):
        self.child_type = ResourceChildType.WEATHER_TEMPERATURE

        self.supported_data_collection_methods = [DataCollectionMethod.PULL]
        self.preferred_data_collection_method = DataCollectionMethod.PULL

        self.unit = Unit.CELSIUS
        self.detailed_time_resolution = None
        self.long_term_time_resolution = TimeResolution.HOUR

        super().save(**kwargs)

    def fetch_current_value(self):
        from apps.weather.utils import get_owm

        observation = get_owm().weather_at_coords(self.sub_location.address.latitude,
                                                  self.sub_location.address.longitude)
        weather = observation.get_weather()
        return ResourceValue(
            value=weather.get_temperature(unit='celsius')['temp'],
            time=datetime.now(tz=timezone.utc),
            unit=Unit.CELSIUS
        )
