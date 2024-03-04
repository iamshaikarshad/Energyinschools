from apps.smart_things_apps.types import AuthCredentialsError
from apps.smart_things_devices.models import SmartThingsDevice
from samsung_school import celery_app

from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def update_device_battery_health(device_id: int):
    SmartThingsDevice.objects.get(id=device_id).update_battery_health()


@celery_app.task(ignore_result=True)
@close_sa_session
def refresh_device_status(device_id: int):
    SmartThingsDevice.objects.get(pk=device_id).update_status()


@celery_app.task(ignore_result=True)
@close_sa_session
def smart_things_devices_refresh_statuses():
    for device_id in SmartThingsDevice.get_devices_ids_for_refresh_status():
        refresh_device_status.delay(device_id)


@celery_app.task(ignore_result=True)
@close_sa_session
def smart_things_devices_refresh_battery_health():
    for device in SmartThingsDevice.get_devices_for_updating_battery_health():
        update_device_battery_health.delay(device.id)
