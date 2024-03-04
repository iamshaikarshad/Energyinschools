from rest_framework import serializers
from rest_framework.request import Request

from apps.resources.models import Resource


class ResourceInOwnLocationField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        request: Request = self.context['request']
        return Resource.objects.in_location(request.user.location)
