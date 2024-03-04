from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from apps.locations.models import Location
from apps.locations.serializers import LocationSerializer
from apps.notifications.models.notification_logs import NotificationEventLog, UserNotificationEventLog
from apps.notifications.models.notification_triggers import AbnormalValueTrigger
from apps.notifications.serializers.notification_trigger import NotificationTriggerSerializer
from apps.notifications.types import TRIGGER_DATA_RESPONSE_MESSAGE
from apps.resources.models import Resource
from utilities.serializer_helpers import get_serializer_fields


class NotificationEventLogSerializer(serializers.ModelSerializer):
    trigger_data = NotificationTriggerSerializer

    class Meta:
        model = NotificationEventLog

        fields = get_serializer_fields(
            NotificationEventLog.event_time,
            'trigger_data',
            add_id=False
        )


class AbnormalValueEventLogSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), source='location.name')
    parent_location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location.parent_location.name', allow_null=True
    )
    trigger_data = serializers.SerializerMethodField()

    class Meta:
        model = UserNotificationEventLog

        fields = get_serializer_fields(
            UserNotificationEventLog.event_time,
            'location',
            'parent_location',
            'trigger_data',
            UserNotificationEventLog.status
        )

    @staticmethod
    def get_trigger_data(event_log: UserNotificationEventLog):
        trigger_data = event_log.trigger_data
        
        try:
            resource_id, trigger_id, abnormal_value = \
                trigger_data['resource_id'], trigger_data['trigger_id'], trigger_data['abnormal_value']
            resource = Resource.objects.get(pk=int(resource_id))
            trigger = AbnormalValueTrigger.objects.get(pk=int(trigger_id))

        except (TypeError, KeyError):
            return 'ERROR: incorrect message structure'

        except (Resource.DoesNotExist, AbnormalValueTrigger.DoesNotExist):
            return 'ERROR: resource or trigger not found'

        return TRIGGER_DATA_RESPONSE_MESSAGE.format(abnormal_value, resource.name, trigger.type)
