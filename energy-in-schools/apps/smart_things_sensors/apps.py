from celery.schedules import crontab
from django.apps import AppConfig


class SmartThingsSensorsConfig(AppConfig):
    name = 'apps.smart_things_sensors'

    def ready(self):
        from samsung_school import celery_app

        from apps.smart_things_sensors.tasks import update_all_subscriptions, fill_st_meter_with_last_value

        celery_app.add_periodic_task(
            crontab(hour=2, minute=30),
            update_all_subscriptions.s(),
        )

        celery_app.add_periodic_task(
            crontab(),
            fill_st_meter_with_last_value.s(),
        )

        # active listeners:
        # noinspection PyUnresolvedReferences
        import apps.smart_things_sensors.signals
