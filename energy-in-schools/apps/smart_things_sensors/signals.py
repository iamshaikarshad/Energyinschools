from typing import Union

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from safedelete.signals import pre_softdelete

from apps.resources.types import DataCollectionMethod
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_sensors.models import SmartThingsSensor, SmartThingsEnergyMeter
from apps.smart_things_sensors.settings import SMART_THINGS_SENSOR_MAP
from apps.smart_things_sensors.tasks import subscribe_sensor_for_events, unsubscribe_for_events
from apps.smart_things_devices.types import Capability


@receiver(post_save, sender=SmartThingsDevice, dispatch_uid='update_device_sensors')
def update_device_sensors(instance: SmartThingsDevice, **__):
    if instance.is_connected and not instance.deleted:
        all_capabilities_set = set(instance.native_capabilities)
    else:
        all_capabilities_set = set()

    connected_capabilities_set = set(instance.sensors.values_list('capability', flat=True))
    if Capability.POWER_METER in all_capabilities_set and Capability.ENERGY_METER not in all_capabilities_set:
        instance.sensors.filter(capability=Capability.POWER_METER).delete()
    instance.sensors.filter(capability__in=connected_capabilities_set - all_capabilities_set).delete()

    for capability in all_capabilities_set - connected_capabilities_set:
        if capability in SMART_THINGS_SENSOR_MAP:

            if capability == Capability.POWER_METER and Capability.ENERGY_METER not in all_capabilities_set:
                continue

            sensor_class = SmartThingsEnergyMeter \
                if capability == Capability.POWER_METER and Capability.ENERGY_METER in all_capabilities_set \
                else SmartThingsSensor

            # update_or_create to recover soft deleted items
            sensor: Union[SmartThingsSensor, SmartThingsEnergyMeter] = sensor_class.objects.update_or_create(
                device=instance,
                capability=capability,
                defaults=dict(
                    name=f'{instance.name} ({capability.value})',
                    sub_location=instance.sub_location,
                )
            )[0]

            SmartThingsSensor.objects.get(id=sensor.id)

            if sensor.preferred_data_collection_method is DataCollectionMethod.PUSH:
                # the task should start only after the atomic block:
                subscribe_sensor_for_events.apply_async(countdown=5, args=(sensor.id,))


@receiver((pre_delete, pre_softdelete), sender=SmartThingsSensor, dispatch_uid='unsubscribe_for_sensor_events')
def unsubscribe_for_sensor_events(instance: SmartThingsSensor, **__):
    if instance.events_subscription_id:
        unsubscribe_for_events.delay(instance.device.api_connector.smart_things_app.id, instance.events_subscription_id)
