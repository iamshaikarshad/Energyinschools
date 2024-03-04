from datetime import datetime, timezone
from typing import TYPE_CHECKING

from django.contrib.postgres.fields import JSONField
from django.db import models
from enumfields import EnumField

from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.main.models import BaseModel
from apps.notifications.types import NotificationStatus, NotificationsType


if TYPE_CHECKING:
    from apps.notifications.models import NotificationTrigger


class NotificationEventLog(BaseModel):
    objects = InLocationQuerySet.as_manager()

    location = models.ForeignKey(Location, on_delete=models.CASCADE, db_index=True)
    event_time = models.DateTimeField(null=False, db_index=True)
    trigger_data = JSONField()

    @classmethod
    def create_log_record(cls, notification_trigger: 'NotificationTrigger', event_time: datetime):
        from apps.notifications.serializers.notification_trigger import NotificationTriggerSerializer

        log_record = cls.objects.create(
            location=notification_trigger.location,
            event_time=event_time,
            trigger_data=NotificationTriggerSerializer(notification_trigger).data
        )
        return log_record


class UserNotificationEventLog(NotificationEventLog):
    """Extended log class. Uses for User notification triggers (e.g. AbnormalValueTrigger)"""

    status = EnumField(NotificationStatus, max_length=10, default=NotificationStatus.ACTIVE)

    @classmethod
    def resolve_notifications(cls, type_: NotificationsType):
        """ Function is used to resolve notifications from both admin page action
            and automatically resolve after some expiration time as a celery task
        """
        if type_ is NotificationsType.ACTIVE:
            UserNotificationEventLog.objects.filter(status=NotificationStatus.ACTIVE) \
                .update(status=NotificationStatus.RESOLVED)

        elif type_ is NotificationsType.EXPIRED:
            UserNotificationEventLog.objects.filter(
                event_time__lte=datetime.now(tz=timezone.utc) - type_.expiration_period,
                status=NotificationStatus.ACTIVE
            ).update(status=NotificationStatus.RESOLVED)
