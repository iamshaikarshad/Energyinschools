from apps.smart_things_devices.settings import REFRESH_DEVICES_STATUSES_HOURS
from django.apps import AppConfig
from celery.schedules import crontab


class LearningDevicesConfig(AppConfig):
    name = 'apps.smart_things_devices'

    def ready(self):
        from samsung_school import celery_app

        from apps.smart_things_devices.tasks import (
            smart_things_devices_refresh_statuses, smart_things_devices_refresh_battery_health
        )

        celery_app.add_periodic_task(
            crontab(minute=0, hour=f'*/{REFRESH_DEVICES_STATUSES_HOURS}'),
            smart_things_devices_refresh_statuses.s(),
        )
        celery_app.add_periodic_task(
            crontab(minute=0, hour=6),
            smart_things_devices_refresh_battery_health.s(),
        )
