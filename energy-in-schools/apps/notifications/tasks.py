from apps.notifications.models.notification_triggers import NotificationTrigger
from apps.notifications.models.notification_logs import UserNotificationEventLog
from apps.notifications.daily_report import SchoolsStatusDailyReport
from samsung_school import celery_app
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def process_all_triggers_task():
    for notification_trigger in NotificationTrigger.objects.all():
        process_trigger.delay(notification_trigger.id)


@celery_app.task(ignore_result=True)
@close_sa_session
def process_trigger(trigger_id: int):
    NotificationTrigger.objects.get(id=trigger_id).process_trigger()


@celery_app.task(ignore_result=True)
@close_sa_session
def resolve_expired_abnormal_value_notifications():
    UserNotificationEventLog.resolve_notifications(NotificationsType.EXPIRED)


@celery_app.task(ignore_result=True)
@close_sa_session
def send_schools_status_daily_email():
    SchoolsStatusDailyReport.send_report()
