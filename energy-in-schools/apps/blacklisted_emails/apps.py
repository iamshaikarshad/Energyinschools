from django.apps import AppConfig


class BlacklistedEmailsConfig(AppConfig):
    name = 'apps.blacklisted_emails'

    def ready(self):
        pass
        # TODO: use different emailing service
        # from django_amazon_ses import pre_send
        # pre_send.connect(self.remove_blacklisted_emails)

    @staticmethod
    def remove_blacklisted_emails(message=None, **kwargs):
        from apps.blacklisted_emails.models import BlacklistedEmail

        blacklisted_emails = set(BlacklistedEmail.objects.filter(email__in=message.to).all())
        message.to = [email for email in message.to if not blacklisted_emails]
