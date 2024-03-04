from datetime import datetime, timezone

import funcy

from apps.energy_providers.providers.abstract import MeterType
from apps.resources.types import DataCollectionMethod, ResourceValue
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_devices.types import DeviceStatus
from apps.smart_things_devices.utilities.connectors import SmartThingsApiConnector
from apps.smart_things_sensors.models import SmartThingsSensor, SmartThingsEnergyMeter
from samsung_school import celery_app
from utilities.sqlalchemy_helpers import close_sa_session


@celery_app.task(ignore_result=True)
@close_sa_session
def subscribe_sensor_for_events(smart_things_sensor_id: int):
    SmartThingsSensor.objects.get(id=smart_things_sensor_id).subscribe_for_events()


@celery_app.task(ignore_result=True)
@close_sa_session
def unsubscribe_for_events(smart_app_id: int, subscription_id: str):
    smart_things_app = SmartThingsApp.objects.get(id=smart_app_id)
    SmartThingsApiConnector(smart_things_app).unsubscribe_for_device_events(subscription_id)


@celery_app.task(ignore_result=True)
@close_sa_session
def update_all_subscriptions():
    for smart_things_app_id in SmartThingsApp.objects.values_list('id', flat=True):
        update_all_subscriptions_for_app(smart_things_app_id=smart_things_app_id)


@celery_app.task(ignore_result=True)
@close_sa_session
def update_all_subscriptions_for_app(smart_things_app_id):
    smart_things_app = SmartThingsApp.objects.get(id=smart_things_app_id)
    sensors_in_location = SmartThingsSensor.objects.in_location(smart_things_app.location)

    api_connector = SmartThingsApiConnector(smart_things_app)
    all_subscriptions_ids = set(api_connector.get_all_subscriptions_ids())
    used_subscriptions_ids = set(
        sensors_in_location
            .exclude(events_subscription_id=None)
            .values_list('events_subscription_id', flat=True)
    )

    for unused_subscription_id in all_subscriptions_ids - used_subscriptions_ids:
        with funcy.suppress():
            unsubscribe_for_events(smart_things_app.id, unused_subscription_id)

    for sensor_id_to_subscribe in (
            sensors_in_location
                    .exclude(events_subscription_id__in=all_subscriptions_ids)
                    .filter(preferred_data_collection_method=DataCollectionMethod.PUSH)
                    .values_list('id', flat=True)
    ):
        subscribe_sensor_for_events.delay(sensor_id_to_subscribe)


@celery_app.task(ignore_result=True)
@close_sa_session
def fill_st_meter_with_last_value():
    """Task that fills data for SmartThings energy meters with its last value.
    Since SmartThings energy meters get their data by subscription,
    this will help to not have gaps in energy graphs for meters with rare subscription events.
    """
    for st_meter in SmartThingsEnergyMeter.objects.filter(last_value__isnull=False):
        last_value = st_meter.last_value
        if st_meter.type == MeterType.SMART_PLUG and st_meter.connectivity_status == DeviceStatus.OFFLINE:
            last_value = 0.0
        st_meter.add_value(ResourceValue(time=datetime.now(timezone.utc) - st_meter.detailed_time_resolution.duration,
                                         value=last_value))
