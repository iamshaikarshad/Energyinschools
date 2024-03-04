import uuid
from typing import List

from apps.energy_providers.providers.abstract import MeterType
from apps.smart_things_apps.base_test_case import SmartThingsAppBaseTestCase
from apps.smart_things_devices.models import SmartThingsCapability, SmartThingsDevice
from apps.smart_things_devices.types import Capability, DeviceStatus
from apps.smart_things_sensors.models import SmartThingsEnergyMeter, SmartThingsSensor


class SmartThingsSensorsBaseTestCase(SmartThingsAppBaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        device = cls.create_smart_things_device(True)
        cls._smart_things_device_id = device.id
        cls._smart_things_sensor_id = cls.create_smart_things_sensor(device).id

    @property
    def smart_things_sensor(self) -> SmartThingsSensor:
        return SmartThingsSensor.objects.get(id=self._smart_things_sensor_id)

    @property
    def smart_things_device(self) -> SmartThingsDevice:
        return SmartThingsDevice.objects.get(id=self._smart_things_device_id)

    @classmethod
    def create_smart_things_device(cls,
                                   is_connected: bool = True,
                                   smart_things_id='the id',
                                   status: DeviceStatus = DeviceStatus.UNKNOWN) -> SmartThingsDevice:
        return SmartThingsDevice.objects.create(
            name='name' + str(uuid.uuid4()),
            label='label',
            sub_location=cls.get_user().location,
            smart_things_id=smart_things_id,
            smart_things_location=cls.smart_things_location_id,
            is_connected=is_connected,
            status=status
        )

    @staticmethod
    def create_smart_things_sensor(device: SmartThingsDevice,
                                   capability: Capability = Capability.MOTION_SENSOR) -> SmartThingsSensor:
        return SmartThingsSensor.objects.create(
            device=device,
            sub_location=device.sub_location,
            capability=capability
        )

    @classmethod
    def create_smart_things_energy_meter(cls, type_=None, device_id=None) -> SmartThingsEnergyMeter:
        return SmartThingsEnergyMeter.objects.create(
            type=type_ or MeterType.ELECTRICITY,
            sub_location=cls.get_user().location,
            name='st_energy_meter',
            capability=Capability.POWER_METER,
            device_id=device_id or cls._smart_things_device_id,
        )

    @staticmethod
    def _set_capabilities(device: SmartThingsDevice, capabilities: List[Capability]):
        device.capabilities.set(
            [SmartThingsCapability.objects.get_or_create(capability=capability.value)[0] for capability in capabilities]
        )
        device.save()
