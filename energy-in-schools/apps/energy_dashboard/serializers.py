from typing import Any, Dict

from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework import serializers

from apps.energy_dashboard.models import (
    DashboardMessage, DashboardScreen, DashboardPing, DashboardType
)
from utilities.serializer_helpers import get_serializer_fields


class DashboardMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMessage
        fields = get_serializer_fields(
            DashboardMessage.text,
            add_id=False,
        )


class DashboardScreenSerializer(serializers.ModelSerializer):
    messages = DashboardMessageSerializer(many=True, read_only=True)

    class Meta:
        model = DashboardScreen
        fields = get_serializer_fields(
            DashboardScreen.name,
            'messages',
        )


class DashboardPingSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = DashboardPing
        fields = get_serializer_fields(
            DashboardPing.type,
            DashboardPing.last_ping,
            add_id=False,
        )


class RequestDashboardTypeSerializer(EnumSupportSerializerMixin, serializers.Serializer):
    type = EnumField(DashboardType)
