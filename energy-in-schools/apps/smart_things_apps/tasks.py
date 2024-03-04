from samsung_school import celery_app
from apps.smart_things_apps.models import SmartThingsApp
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def smart_things_app_refresh_old_refresh_tokens():
    SmartThingsApp.refresh_old_refresh_tokens()
