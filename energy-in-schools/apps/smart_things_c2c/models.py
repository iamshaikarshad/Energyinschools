from typing import TYPE_CHECKING

import funcy
from django.db import models
from django.db.models import CASCADE
from enumfields import Enum, EnumField

from apps.energy_meters.models import EnergyMeter
from apps.main.models import BaseModel
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_web_hooks.models import SmartThingsConnector


if TYPE_CHECKING:
    from apps.smart_things_c2c.utils import CloudDeviceManager


class CloudDeviceError(Exception):
    pass


class DeviceType(Enum):
    ENERGY_METER = 'energy_meter'


class DeviceProfile(BaseModel):
    Type = DeviceType

    name = models.CharField(max_length=50)
    type = EnumField(DeviceType, max_length=20)
    profile_id = models.CharField(max_length=50, blank=False, null=False)
    connector = models.ForeignKey(SmartThingsConnector, on_delete=CASCADE, related_name='device_profiles')


class C2CDeviceToEnergyMeterMap(BaseModel):
    smart_things_app = models.ForeignKey(SmartThingsApp, on_delete=models.CASCADE, null=False, db_index=True)
    device_id = models.CharField(max_length=50, blank=False, null=False, db_index=True)
    device_label = models.CharField(max_length=50)
    device_profile = models.ForeignKey(DeviceProfile, on_delete=models.CASCADE, null=False)
    energy_meter = models.ForeignKey(EnergyMeter, on_delete=models.CASCADE, db_index=True, related_name='smart_things_c2c_mappers')

    def set_cloud_device_consumption(self, consumption_in_watts: float):
        self.manager.set_cloud_device_state(self.device_id, consumption_in_watts)

    def set_cloud_device_label(self, label: str):
        if self.device_label != label:
            self.manager.set_cloud_device_label(self.device_id, self.energy_meter.name)
            self.device_label = label
            self.save()

    @funcy.cached_property
    def manager(self) -> 'CloudDeviceManager':
        from apps.smart_things_c2c.utils import CloudDeviceManager

        return CloudDeviceManager(
            smart_things_app=self.smart_things_app,
            device_profile=self.device_profile,
        )
