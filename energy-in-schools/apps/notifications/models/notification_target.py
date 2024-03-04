from django.core.mail import EmailMultiAlternatives
from django.db import models
from django.template.loader import get_template
from enumfields import Enum, EnumField

from apps.blacklisted_emails.tools import AddEmailToBlackListToken
from apps.main.models import BaseModel
from apps.notifications.models.notification_triggers import ParentModelMixin, NotificationTrigger
from django.conf import settings


class DestinationType(Enum):
    EMAIL = 'email'
    SMS = 'sms'
    SMART_THINGS_APP = 'smart_things_app'


class NotificationTarget(ParentModelMixin, BaseModel):
    Type = DestinationType

    CHILD_MODELS_FIELDS_MAP = {
        Type.EMAIL: 'email_notification',
        Type.SMS: 'sms_notification',
    }

    type = EnumField(Type, max_length=20)
    trigger = models.ForeignKey(
        to=NotificationTrigger,
        on_delete=models.CASCADE,
        null=False,
        related_name='notification_targets'
    )

    def send_notification(self, title: str, text: str):
        self.concrete_instance.send_notification(title, text)


class EmailNotification(NotificationTarget):
    base_target = models.OneToOneField(
        to=NotificationTarget,
        parent_link=True,
        related_name='email_notification',
        on_delete=models.CASCADE
    )

    email = models.EmailField(null=False, blank=False)

    def send_notification(self, title: str, text: str):
        html_content = get_template('notifications/alert.html').render({
            'unsubscribe_link': AddEmailToBlackListToken(email=self.email).get_unsubscribe_email_link(),
            'text': text
        })

        message = EmailMultiAlternatives(subject=title,
                                         from_email=settings.NOTIFICATION_SENDING_EMAIL,
                                         to=[self.email])
        message.attach_alternative(html_content, "text/html")
        message.send()
