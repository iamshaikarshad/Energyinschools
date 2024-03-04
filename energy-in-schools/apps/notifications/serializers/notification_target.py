from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers

from apps.locations.serializer_fileds import InOwnLocationPrimaryKeyRelatedField
from apps.notifications.models import NotificationTarget, NotificationTrigger
from apps.notifications.models.notification_target import EmailNotification
from apps.notifications.utils import ModelInheritanceSerializerMixin
from utilities.serializer_helpers import get_serializer_fields


class EmailNotificationSerializer(serializers.ModelSerializer):  # todo: move to separate file
    class Meta:
        model = EmailNotification

        fields = get_serializer_fields(
            EmailNotification.email,
            add_id=False
        )


class NotificationTargetSerializer(ModelInheritanceSerializerMixin, EnumSupportSerializerMixin,
                                   serializers.ModelSerializer):
    trigger_id = InOwnLocationPrimaryKeyRelatedField(
        queryset=NotificationTrigger.objects.all(),
        read_only=False,
        required=False,
        source='trigger'
    )

    email_notification = EmailNotificationSerializer()

    class Meta:
        model = NotificationTarget

        fields = get_serializer_fields(
            NotificationTarget.type,
            'trigger_id',
            'email_notification',
            # 'sms_notification'
        )