from celery.schedules import crontab
from django.apps import AppConfig


class ResourcesConfig(AppConfig):
    name = 'apps.resources'

    def ready(self):
        from samsung_school import celery_app

        from apps.resources.tasks import \
            select_resources_for_collecting_new_values, \
            select_resources_for_saving_values_to_long_term_history, \
            detailed_energy_history_remove_old_rows

        celery_app.add_periodic_task(
            crontab(),
            select_resources_for_collecting_new_values.s()
        )
        celery_app.add_periodic_task(
            crontab(minute='6,36'),  # after received new data with 5 minutes time resolution
            select_resources_for_saving_values_to_long_term_history.s(),
        )
        celery_app.add_periodic_task(
            crontab(hour=1),
            detailed_energy_history_remove_old_rows.s(),
        )
