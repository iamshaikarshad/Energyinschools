from enumfields.drf import EnumField
from rest_framework import serializers
from rest_framework.fields import Field
from rest_framework.request import Request

from apps.historical_data.serializers import BaseQuerySerializer
from apps.resources.types import Unit


class UserLocationAsDefault:
    def __init__(self):
        self.field: Field = None

    def set_context(self, context):
        self.field = context

    def __call__(self):
        request: Request = self.field.context['request']
        return request.user.location


class EnergyConsumptionQuerySerializer(BaseQuerySerializer):
    from_ = serializers.DateTimeField(required=False)
    to = serializers.DateTimeField(required=False)
    unit = EnumField(Unit, default=Unit.WATT, lenient=True)
