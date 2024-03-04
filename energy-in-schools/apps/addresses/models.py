from typing import NamedTuple

from django.db import models

from apps.main.models import BaseModel


class GeoCoordinates(NamedTuple):
    latitude: float
    longitude: float


DEFAULT_LOCATION_COORDINATES = GeoCoordinates(latitude=51.51, longitude=-0.13)  # London city


class Address(BaseModel):
    class Meta:
        verbose_name_plural = 'addresses'

    line_1 = models.CharField(max_length=200)
    line_2 = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=200, null=True)
    post_code = models.CharField(max_length=20, null=True)

    latitude = models.FloatField(default=DEFAULT_LOCATION_COORDINATES.latitude)
    longitude = models.FloatField(default=DEFAULT_LOCATION_COORDINATES.longitude)

    @property
    def coordinates(self) -> GeoCoordinates:
        return GeoCoordinates(self.latitude, self.longitude)

    def __str__(self):
        return f'{self.line_1},{f" {self.line_2}," if self.line_2 else ""} {self.city}, {self.post_code}'
