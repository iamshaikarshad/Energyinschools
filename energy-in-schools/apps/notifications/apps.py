from celery.schedules import crontab
from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    name = 'apps.notifications'

    def ready(self):
        from samsung_school import celery_app
        from apps.notifications.tasks import (
            process_all_triggers_task, resolve_expired_abnormal_value_notifications,
            send_schools_status_daily_email
        )

        celery_app.add_periodic_task(
            crontab(minute='*/15'),
            process_all_triggers_task.s(),
        )
        celery_app.add_periodic_task(
            crontab(hour=11, minute=30),
            resolve_expired_abnormal_value_notifications.s(),
        )
        celery_app.add_periodic_task(
            crontab(hour=8, minute=59, day_of_week='mon-fri'),
            send_schools_status_daily_email.s(),
        )
