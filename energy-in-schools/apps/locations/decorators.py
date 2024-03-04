import functools
from typing import Callable, Union

from django.contrib.auth.models import AnonymousUser
from rest_framework.generics import GenericAPIView

from apps.locations.querysets import InLocationQuerySet, InSubLocationQuerySet


def own_location_only(
        get_queryset_method: Callable[[GenericAPIView], Union[InSubLocationQuerySet, InLocationQuerySet]]
) -> Callable[[GenericAPIView], Union[InSubLocationQuerySet, InLocationQuerySet]]:
    """
    Decorator that filtrate `get_queryset` method to only items from own school only.

    Usage example:
        >>> from apps.resources.models import Resource
        >>> class ResourceViewSet(GenericAPIView):
        ...     @own_location_only
        ...     def get_queryset(self):
        ...         return Resource.objects.all()

    """

    @functools.wraps(get_queryset_method)
    def wrapper(self: GenericAPIView) -> Union[InSubLocationQuerySet, InLocationQuerySet]:
        if self.request.user.is_staff or isinstance(self.request.user, AnonymousUser):
            return get_queryset_method(self)

        return get_queryset_method(self).in_location(self.request.user.location)

    return wrapper
