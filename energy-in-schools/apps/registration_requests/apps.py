# from celery.schedules import crontab
from django.apps import AppConfig


class RegistrationRequestsConfig(AppConfig):
    name = 'apps.registration_requests'

    def ready(self):
        #     from samsung_school import celery_app
        #
        #     from apps.registration_requests.tasks import disable_schools_after_trial
        #
        #     celery_app.add_periodic_task(
        #         crontab(hour=3),
        #         disable_schools_after_trial.s(),
        #     )
        #
        # noinspection PyUnresolvedReferences
        import apps.registration_requests.signals
