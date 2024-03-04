from apps.main.base_test_case import BaseTestCase
from apps.notifications.models.notification_triggers import ValueLevelTrigger, NotificationTrigger


class NotificationBaseTestCase(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls._notification_trigger_id = cls.create_notification_trigger().id

    @classmethod
    def create_notification_trigger(cls):
        return ValueLevelTrigger.objects.create(
            location=cls.get_user().location,
            source_location=cls.get_user().location,
            condition=NotificationTrigger.Condition.GREATER,
            type=NotificationTrigger.Type.ELECTRICITY_CONSUMPTION_LEVEL,
            max_notification_frequency=NotificationTrigger.MaxNotifyFrequency.ONE_PER_HOUR,
            argument=0.5,
        )

    @property
    def notification_trigger(self):
        return ValueLevelTrigger.objects.get(id=self._notification_trigger_id)
