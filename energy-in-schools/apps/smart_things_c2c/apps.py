from celery.schedules import crontab
from django.apps import AppConfig


class SmartThingsC2CEnergyMeterConfig(AppConfig):
    name = 'apps.smart_things_c2c'

    def ready(self):
        from samsung_school import celery_app

        from apps.smart_things_c2c.tasks import reconcile_device_list_for_all_c2c_apps

        celery_app.add_periodic_task(
            crontab(hour=1, minute=30),
            reconcile_device_list_for_all_c2c_apps.s(),  # fail over
        )

        # activate listeners:
        # noinspection PyUnresolvedReferences
        import apps.smart_things_c2c.signals
