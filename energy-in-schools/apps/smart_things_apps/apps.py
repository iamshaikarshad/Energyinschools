from celery.schedules import crontab
from django.apps import AppConfig


class SmartThingsAppConfig(AppConfig):
    name = 'apps.smart_things_apps'

    def ready(self):
        from samsung_school import celery_app

        from apps.smart_things_apps.tasks import smart_things_app_refresh_old_refresh_tokens

        celery_app.add_periodic_task(
            crontab(hour=2),
            smart_things_app_refresh_old_refresh_tokens.s(),
        )
