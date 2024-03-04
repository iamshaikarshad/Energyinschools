import pytz
from django.conf import settings

from typing import Collection, Union

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from apps.addresses.models import Address
from apps.locations.querysets import SubLocationInLocationQuerySet
from apps.main.model_mixins import NameAndDescriptionMixin
from apps.main.models import BaseModel
from apps.themes.models import Theme
from apps.registration_requests.types import Status
from utilities.alphanumeric import generate_alphanumeric


TIMEZONES = tuple(zip(pytz.all_timezones, pytz.all_timezones))


class Location(BaseModel, NameAndDescriptionMixin):
    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "Locations"

    objects = SubLocationInLocationQuerySet.as_manager()

    parent_location = models.ForeignKey(
        to="self",
        on_delete=models.CASCADE,
        related_name='sub_locations',
        default=None,
        blank=True,
        null=True
    )

    address = models.OneToOneField(Address, on_delete=models.SET_NULL, null=True, blank=True)

    uid = models.CharField(
        blank=False,
        null=False,
        unique=True,
        default=generate_alphanumeric,
        max_length=36,
        db_index=True
    )

    share_energy_consumption = models.BooleanField(default=True, null=False)
    current_theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True)
    is_test = models.BooleanField(default=False, null=False)
    is_energy_data_open = models.BooleanField(default=False, null=False)
    pupils_count = models.IntegerField(default=100, null=False,
                                       validators=[MinValueValidator(1)])  # TODO consider default value

    timezone = models.CharField(choices=TIMEZONES, max_length=50, default=settings.DEFAULT_SCHOOLS_TIMEZONE,
                                blank=False, null=False)

    STR_ATTRIBUTES = (
        'name',
        'uid',
        'parent_location__uid'
    )

    @property
    def is_sub_location(self) -> bool:
        return bool(self.parent_location)

    @property
    def with_sub_locations(self) -> Union[models.QuerySet, Collection['Location']]:
        return Location.objects.in_location(self)

    @property
    def school(self) -> 'Location':
        return self.parent_location or self

    @property
    def mug_customer(self):
        return self.school.registration_request.mug_customer

    @classmethod
    def get_schools(cls):
        return cls.objects.filter(parent_location=None).all()

    @classmethod
    def get_locations_by_request_status(cls, location, status=Status.ACTIVATION_ACCEPTED):
        if settings.TEST_MODE:
            return cls.objects.filter(parent_location_id=None)
        else:
            return cls.objects.filter(
                (Q(is_test=False) & Q(parent_location_id=None) & Q(
                    registration_request__status=status)) |
                Q(id=location.id)
            )
