from http import HTTPStatus

from django.conf import settings
from django.core import mail

from apps.accounts.permissions import RoleName
from apps.notifications.daily_report import SchoolsStatusDailyReport
from apps.notifications.models.daily_report_subscription import DailyReportSubscription
from apps.notifications.types import SUBSCRIPTION_RESPONSE_MESSAGE
from apps.main.base_test_case import BaseTestCase


class TestSchoolsStatusDailyReport(BaseTestCase):
    URL = '/api/v1/notifications/daily-report/'
    FORCE_LOGIN_AS = RoleName.ADMIN
    EMAIL = 'ok@user.mail'

    def setUp(self):
        super().setUp()
        [DailyReportSubscription.objects.create(email=email)
         for email in ('tim_bailey@sam.sung', 'santosh_kondu@sam.sung')]

    def test_email_sending(self):
        SchoolsStatusDailyReport.send_report()

        self.assertTrue(len(mail.outbox), 1)

        email = mail.outbox[0]
        email_subject = settings.DAILY_REPORT_EMAIL_SUBJECT \
                                .format(settings.CONFIGURATION_NAME.name)
        from_email = settings.NOTIFICATION_SENDING_EMAIL

        self.assertTrue(all([
            (email.subject, email_subject),
            (email.from_email, from_email),
            (email.to, DailyReportSubscription.get_emails()),
        ]))

    def test_daily_report_subscription(self):
        with self.subTest('try to subscribe email'):
            response = self.client.post(self.get_url(), {'email': self.EMAIL})
            self.assertResponse(response, HTTPStatus.CREATED)

        with self.subTest('try to unsubscribe email'):
            for email, expected_status in (
                (self.EMAIL, HTTPStatus.OK),
                ('not_ok@user.mail', HTTPStatus.BAD_REQUEST),
            ):
                response = self.client.post(self.get_url() + 'unsubscribe-email/', {'email': email})
                self.assertResponse(response, expected_status)

        with self.subTest('try subscribe after unsubscribed'):
            response = self.client.post(self.get_url(), {'email': self.EMAIL})
            self.assertResponse(response)
            self.assertTrue(response.data, SUBSCRIPTION_RESPONSE_MESSAGE.format(self.EMAIL, 'subscribed'))
