import logging
from datetime import timedelta
from typing import Optional, List

import funcy
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from apps.energy_meters.models import EnergyMeter
from apps.historical_data.models import DetailedHistoricalData
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_c2c.models import C2CDeviceToEnergyMeterMap
from apps.smart_things_c2c.tasks import reconcile_device_list
from apps.smart_things_c2c.utils import CloudDeviceManager
from apps.smart_things_web_hooks.models import SmartThingsConnector


logger = logging.getLogger(__name__)


# todo cache db requests


@receiver(post_save, sender=SmartThingsApp, dispatch_uid='reconcile_device_list_for_new_app')
@funcy.silent
@funcy.log_errors(logger.error)
def reconcile_device_list_for_smart_things_app(sender, instance: SmartThingsApp, created: bool, **_):
    if created and instance.connector.type == SmartThingsConnector.Type.CLOUD_TO_CLOUD:
        # the task should start only after the atomic block:
        reconcile_device_list.apply_async(countdown=5, args=(instance.id,))


@receiver(post_save, sender=EnergyMeter, dispatch_uid='reconcile_device_list_for_new_energy_meter')
@funcy.silent
@funcy.log_errors(logger.error)
@funcy.ignore((C2CDeviceToEnergyMeterMap.DoesNotExist, SmartThingsApp.DoesNotExist))
def change_energy_meter_on_cloud(sender, instance: EnergyMeter, **_):
    c2c_device_mappers: List[C2CDeviceToEnergyMeterMap] = \
        C2CDeviceToEnergyMeterMap.objects.filter(energy_meter=instance).all()

    if c2c_device_mappers:
        for mapper in c2c_device_mappers:
            mapper.manager.reconcile_device_list()

            mapper.set_cloud_device_label(instance.name)
    else:
        for device_manager in CloudDeviceManager.from_location(instance.provider_account.location):
            device_manager.add_energy_meter_to_cloud(instance)


@receiver(pre_delete, sender=EnergyMeter, dispatch_uid='reconcile_device_list_for_removed_energy_meter')
@funcy.silent
@funcy.log_errors(logger.error)
@funcy.ignore(C2CDeviceToEnergyMeterMap.DoesNotExist)
def remove_energy_meter_from_cloud(sender, instance: EnergyMeter, **_):
    for mapper in instance.smart_things_c2c_mappers.all():
        CloudDeviceManager(mapper.smart_things_app) \
            .remove_energy_meter_from_cloud(mapper.device_id)


@receiver(post_save, sender=DetailedHistoricalData, dispatch_uid='reconcile_device_list_for_removed_energy_meter')
@funcy.silent
@funcy.log_errors(logger.error)
def update_cloud_device_state(sender, instance: DetailedHistoricalData, **_):
    # noinspection PyTypeChecker
    c2c_device_mappers = get_c2c_device_mappers(instance.resource_id)

    if c2c_device_mappers:
        for mapper in c2c_device_mappers:
            mapper.set_cloud_device_consumption(instance.value)


@funcy.cache(timedelta(minutes=10))
@funcy.ignore((C2CDeviceToEnergyMeterMap.DoesNotExist, EnergyMeter.DoesNotExist))
def get_c2c_device_mappers(
        energy_meter_id: int,
) -> List[C2CDeviceToEnergyMeterMap]:
    energy_meter = EnergyMeter.objects.get(id=energy_meter_id)
    return energy_meter.smart_things_c2c_mappers.all()
