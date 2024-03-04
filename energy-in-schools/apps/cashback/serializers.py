from datetime import datetime, timezone

from django.conf import settings
from rest_framework import serializers
from rest_framework.fields import FloatField

from apps.cashback.models import OffPeakyPoint
from apps.historical_data.serializers import BaseSerializer

DEFAULT_SCHOOL_CASHBACK_GOAL = 1250


class EnergyCashbackSerializer(BaseSerializer):
    current = FloatField(required=True)
    goal = FloatField(default=DEFAULT_SCHOOL_CASHBACK_GOAL)


class CashBackQuerySerializer(BaseSerializer):
    from_ = serializers.DateField(required=False, default=None, format="%Y-%m-%d", )
    to = serializers.DateField(required=False, default=None, format="%Y-%m-%d")

    @staticmethod
    def validate_from_(value):
        value = value if value else settings.OFF_PEAKY_POINTS_START_DATE

        if value and value > datetime.now(tz=timezone.utc).date():
            raise serializers.ValidationError('FROM can\'t be in future')

        return value

    @staticmethod
    def validate_to(value):
        if value and value > datetime.now(tz=timezone.utc).date():
            raise serializers.ValidationError('TO can\'t be in future')

        return value

    def validate(self, attrs):
        if attrs['from_'] and attrs['to'] and attrs['from_'] > attrs['to']:
            raise serializers.ValidationError('FROM parameter should be less than TO parameter')

        return attrs


class OffPeakyPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = OffPeakyPoint
        fields = ('day', 'value')
