from typing import Any, Dict

from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from apps.locations.serializer_fileds import OwnLocationField, OwnSubLocationField
from apps.notifications.models import NotificationTrigger
from apps.notifications.models.notification_triggers import DailyUsageTrigger, ValueLevelTrigger, AbnormalValueTrigger
from apps.notifications.serializers.notification_target import NotificationTargetSerializer
from apps.notifications.utils import ModelInheritanceSerializerMixin
from apps.resources.models import Resource
from apps.resources.serializer_fields import ResourceInOwnLocationField
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class ValueLevelTriggerSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ValueLevelTrigger

        fields = get_serializer_fields(
            ValueLevelTrigger.condition,
            ValueLevelTrigger.argument,
            ValueLevelTrigger.min_duration,
            add_id=False
        )


class DailyUsageTriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyUsageTrigger

        fields = get_serializer_fields(
            DailyUsageTrigger.threshold_in_percents,
            add_id=False
        )


class NotificationTriggerSerializer(ModelInheritanceSerializerMixin, EnumSupportSerializerMixin,
                                    serializers.ModelSerializer):
    location_id = OwnLocationField(read_only=False, required=False, source='location')
    source_location_id = OwnSubLocationField(read_only=False, source='source_location', allow_null=True, required=False)
    source_resource_id = ResourceInOwnLocationField(
        read_only=False,
        source='source_resource',
        allow_null=True,
        required=False,
    )
    notifications = NotificationTargetSerializer(many=True, read_only=True, source='notification_targets')
    partial = False  # TODO workaround with partial issue

    value_level = ValueLevelTriggerSerializer()
    daily_usage = DailyUsageTriggerSerializer()

    class Meta:
        model = NotificationTrigger
        fields = get_serializer_fields(
            model.type,
            model.max_notification_frequency,
            model.active_time_range_start,
            model.active_time_range_end,
            model.active_days,
            model.location,
            model.source_location,
            model.source_resource,
            model.name,
            model.is_active,
            'value_level',
            'daily_usage',
            'notifications',
        )

        extra_kwargs = get_serializer_kwargs({
            NotificationTrigger.name: {'required': True},
        })

    def validate(self, attrs: Dict[str, Any]):
        if {'source_location_id', 'source_resource', 'type'}.intersection(attrs):
            source_location = attrs.get('source_location', self.instance.source_location if self.instance else None)
            source_resource = attrs.get('source_resource', self.instance.source_resource if self.instance else None)
            trigger_type = attrs.get('type') or self.instance.type

            if source_resource:
                try:
                    NotificationTrigger.get_source_resources_query(
                        trigger_type=trigger_type,
                        source_resource=source_resource,
                        source_location=source_location,
                    ).get()
                except Resource.DoesNotExist:
                    raise serializers.ValidationError('Wrong source_resource_id or source_location!')

        return attrs


class TriggerDataSerializer(serializers.Serializer):
    trigger_id = serializers.PrimaryKeyRelatedField(queryset=AbnormalValueTrigger.objects.all())
    resource_id = serializers.PrimaryKeyRelatedField(queryset=Resource.objects.all())
    abnormal_value = serializers.FloatField()
