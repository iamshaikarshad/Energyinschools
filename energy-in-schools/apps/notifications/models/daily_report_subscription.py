from django.db import models

from apps.main.models import BaseModel


class DailyReportSubscription(BaseModel):
    email = models.EmailField()
    is_subscribed = models.BooleanField(default=True)

    @classmethod
    def unsubscribe_email(cls, email):
        email = DailyReportSubscription.objects.get(email=email)
        email.is_subscribed = False
        email.save()

    @classmethod
    def get_emails(cls):
        return tuple(DailyReportSubscription.objects.filter(is_subscribed=True).values_list('email', flat=True))
