from datetime import datetime, timezone

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from samsung_school import celery_app
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def clear_outstanding_tokens():
    OutstandingToken.objects.filter(expires_at__lt=datetime.now(tz=timezone.utc)).delete()
