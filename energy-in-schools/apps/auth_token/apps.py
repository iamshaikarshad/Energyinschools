from celery.schedules import crontab
from django.apps import AppConfig


class AuthTokenConfig(AppConfig):
    name = 'apps.auth_token'

    def ready(self):
        from samsung_school import celery_app
        from apps.auth_token.tasks import clear_outstanding_tokens

        celery_app.add_periodic_task(
            crontab(hour=0),
            clear_outstanding_tokens.s(),
        )
