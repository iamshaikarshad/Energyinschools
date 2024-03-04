from celery.schedules import crontab
from django.apps import AppConfig


class CashbackConfig(AppConfig):
    name = 'apps.cashback'

    def ready(self):
        from samsung_school import celery_app

        from apps.cashback.tasks import calculate_schools_cash_back

        celery_app.add_periodic_task(
            crontab(hour=0, minute=30),
            calculate_schools_cash_back.s(),
        )
