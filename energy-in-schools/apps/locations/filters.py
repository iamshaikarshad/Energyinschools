from functools import wraps

from django.contrib.auth.models import AnonymousUser
from django.db.models import Q, QuerySet
from django_filters.constants import EMPTY_VALUES
from django_filters.rest_framework import BooleanFilter, CharFilter, FilterSet, NumberFilter

from apps.locations.models import Location
from apps.locations.querysets import AbstractInLocationQuerySet


def ignore_empty_values(filter_func):
    @wraps(filter_func)
    def wrapper(self, qs: QuerySet, value: bool):
        if value in EMPTY_VALUES:
            return qs

        return filter_func(self, qs, value)

    return wrapper


def ignore_anonymous_user(filter_func):
    @wraps(filter_func)
    def wrapper(self, qs: QuerySet, value: bool):
        # noinspection PyUnresolvedReferences
        filterset: FilterSet = self.parent

        if value and not isinstance(filterset.request.user, AnonymousUser):
            return filter_func(self, qs, value)

        return qs

    return wrapper


class OwnLocationOnlyFilter(BooleanFilter):
    @ignore_empty_values
    @ignore_anonymous_user
    def filter(self, qs: AbstractInLocationQuerySet, value: bool):
        # noinspection PyUnresolvedReferences
        filterset: FilterSet = self.parent

        return qs.in_location(filterset.request.user.location)


class EnergyDataSharedSubLocation(CharFilter):
    """
    Filtrate resources by location_uid. Accept only own resource or in location with share_energy_consumption=True.
    Use own school by default.
    """

    def filter(self, qs: AbstractInLocationQuerySet, value: str):
        # noinspection PyUnresolvedReferences
        filterset: FilterSet = self.parent

        if value in EMPTY_VALUES:
            location = filterset.request.user.location

        else:
            location = (
                    Location.objects.filter(share_energy_consumption=True) |
                    filterset.request.user.location.with_sub_locations
            ).get(uid=value)

        return qs.in_location(location)


class SubLocationIdFilter(NumberFilter):
    @ignore_empty_values
    def filter(self, qs: AbstractInLocationQuerySet, value):
        return qs.in_location(Location(pk=value))


class SubLocationUidFilter(CharFilter):
    @ignore_empty_values
    def filter(self, qs: QuerySet, value):
        return qs.filter(
            Q(sub_location__uid=value) |
            Q(sub_location__parent_location__uid=value)
        )


class LocationIDFilter(CharFilter):
    @ignore_empty_values
    def filter(self, qs: QuerySet, value):
        return qs.filter(
            Q(location__id=value) |
            Q(location__parent_location__id=value)
        )
