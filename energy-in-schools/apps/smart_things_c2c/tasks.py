from samsung_school import celery_app
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_c2c.utils import CloudDeviceManager
from apps.smart_things_web_hooks.models import SmartThingsConnector
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def reconcile_device_list_for_all_c2c_apps():
    for smart_things_app_id in SmartThingsApp \
            .objects \
            .filter(connector__type=SmartThingsConnector.Type.CLOUD_TO_CLOUD) \
            .values_list('id', flat=True) \
            .all():
        reconcile_device_list.delay(smart_things_app_id)


@celery_app.task(ignore_result=True, throws=(SmartThingsApp.DoesNotExist,))
@close_sa_session
def reconcile_device_list(smart_things_app_id: int):
    smart_things_app = SmartThingsApp.objects.get(id=smart_things_app_id)

    CloudDeviceManager(smart_things_app).reconcile_device_list()
