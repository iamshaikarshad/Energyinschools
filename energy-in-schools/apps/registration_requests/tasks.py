from datetime import datetime, timezone

from django.conf import settings
from django.db.transaction import atomic
from django.template.loader import get_template

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.registration_requests.models import RegistrationRequest, TRIAL_DURATION
from apps.registration_requests.registration_request_authentication import SubmitQuestionnaireAuth
from apps.registration_requests.utils import send_email_notification_by_template
from samsung_school import celery_app
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def disable_schools_after_trial():
    """Not used from July 2019 to simplify management process"""
    for registration_request in RegistrationRequest.objects.filter(
            status__in=(
                    RegistrationRequest.Status.TRIAL_ACCEPTED,
            ),
            registered_school__created_at__lt=datetime.now(tz=timezone.utc) - TRIAL_DURATION,

    ):
        disable_school_after_trial.delay(registration_request.id)


@celery_app.task(ignore_result=True)
@close_sa_session
@atomic
def disable_school_after_trial(registration_request_id: int):
    """Not used from July 2019 to simplify management process"""
    affected_rows = User.objects.filter(
        location__registration_request__id=registration_request_id,
        location__registration_request__status__in=(
            RegistrationRequest.Status.TRIAL_ACCEPTED,
            # todo: add another cases
        ),
    ).update(is_active=False)

    if affected_rows:
        sle_admin = User.objects.get(
            location__registration_request__id=registration_request_id,
            groups__name=RoleName.SLE_ADMIN
        )
        registered_school = RegistrationRequest.objects.get(pk=registration_request_id)

        # noinspection PyCallByClass
        send_email_notification_by_template(
            subject=f'{registered_school.school_name} trial period ended',
            to=sle_admin.email,
            template=get_template('registration-requests/school-trial-expired-email.html'),
            parameters=dict(
                submit_questionnaire_link=settings.LINKS.SUBMIT_QUESTIONNAIRE.format(
                    token=SubmitQuestionnaireAuth.obtain_token(
                        SubmitQuestionnaireAuth.Payload(
                            registration_request_id=registration_request_id
                        )
                    )
                )
            )
        )
