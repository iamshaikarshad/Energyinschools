from rest_framework import serializers
from rest_framework.fields import empty
from rest_framework.request import Request

from apps.locations.models import Location


# noinspection PyAbstractClass
class OwnLocationMixin(serializers.RelatedField):
    def get_queryset(self):
        request: Request = self.context['request']
        return Location.objects.filter(id=request.user.location_id).all()

    def get_default(self):
        if self.default is empty:
            request: Request = self.context['request']
            return Location.objects.get(id=request.user.location_id)

        return super().get_default()


# noinspection PyAbstractClass
class OwnSubLocationMixin(OwnLocationMixin):
    def get_queryset(self):
        request: Request = self.context['request']
        return request.user.location.with_sub_locations  # todo: change to `sub_locations`


class OwnLocationField(OwnLocationMixin, serializers.PrimaryKeyRelatedField):
    pass


class OwnLocationSlugRelatedField(OwnLocationMixin, serializers.SlugRelatedField):
    pass


class OwnSubLocationField(OwnSubLocationMixin, serializers.PrimaryKeyRelatedField):
    pass


# noinspection PyAbstractClass
class InOwnLocationMixin(serializers.RelatedField):
    def get_queryset(self):
        request: Request = self.context['request']
        queryset = super().get_queryset()
        if request.user.is_staff:
            return queryset
        return super().get_queryset().in_location(request.user.location)


class InOwnLocationPrimaryKeyRelatedField(InOwnLocationMixin, serializers.PrimaryKeyRelatedField):
    pass


class InOwnLocationSlugRelatedField(InOwnLocationMixin, serializers.SlugRelatedField):
    pass
