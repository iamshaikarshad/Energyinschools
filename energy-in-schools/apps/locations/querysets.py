from abc import ABCMeta, abstractmethod
from typing import TYPE_CHECKING, TypeVar

from django.db import models
from django.db.models import Q
from safedelete.queryset import SafeDeleteQueryset


if TYPE_CHECKING:
    from apps.locations.models import Location


QuerySetType = TypeVar('QuerySetType', bound='InLocationQuerySetInterface')


class AbstractInLocationQuerySet(models.QuerySet, metaclass=ABCMeta):
    @abstractmethod
    def in_location(self: QuerySetType, location: 'Location') -> QuerySetType:
        pass


class SubLocationInLocationQuerySet(AbstractInLocationQuerySet):
    def in_location(self, location: 'Location'):
        if location:
            return self.filter(
                Q(id=location.id) |
                Q(parent_location_id=location.id),
            )

        return self.none()


class InSubLocationQuerySet(AbstractInLocationQuerySet):
    def in_location(self, location: 'Location'):
        return self.filter(
            Q(sub_location=location) |
            Q(sub_location__parent_location=location),
        )


class InLocationQuerySet(AbstractInLocationQuerySet):
    def in_location(self, location: 'Location'):
        return self.filter(location=location)


class InLocationSafeDeleteQuerySet(SafeDeleteQueryset, InLocationQuerySet):
    pass


class InSubLocationSafeDeleteQuerySet(SafeDeleteQueryset, InSubLocationQuerySet):
    pass
