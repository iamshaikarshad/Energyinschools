from http import HTTPStatus

from unittest.mock import MagicMock, patch

from apps.accounts.permissions import RoleName
from apps.notifications.base_test_case import NotificationBaseTestCase
from apps.notifications.models import NotificationTarget
from apps.notifications.models.notification_target import EmailNotification


class TestNotificationTargets(NotificationBaseTestCase):  # todo move it
    URL = '/api/v1/notifications/targets/'
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN

    def test_create(self):
        response = self.client.post(self.get_url(), dict(
            type=NotificationTarget.Type.EMAIL.value,
            trigger_id=self.notification_trigger.id,
            email_notification=dict(
                email='aaaa@bbb.ccc'
            )
        ), content_type='application/json')
        self.assertResponse(response, HTTPStatus.CREATED)

    def test_send_email(self):
        target = EmailNotification.objects.create(
            trigger=self.notification_trigger,
            type=NotificationTarget.Type.EMAIL,  # todo: remove it from here
            email='aaa@bbb.ccc'
        )

        self.notification_trigger.notification_targets.all()[0].send_notification('aa', 'bb')
