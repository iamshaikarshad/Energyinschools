import logging
from typing import Set

import funcy

from apps.energy_meters.models import EnergyMeter
from apps.locations.models import Location
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.types import SmartThingsError
from apps.smart_things_c2c.models import C2CDeviceToEnergyMeterMap, CloudDeviceError, DeviceProfile
from apps.smart_things_devices.types import Attribute, Capability
from apps.smart_things_devices.utilities.connectors import SmartThingsApiConnector
from apps.smart_things_web_hooks.models import SmartThingsConnector


logger = logging.getLogger(__name__)


class CloudDeviceManager:
    def __init__(
            self,
            smart_things_app: SmartThingsApp,
            location: Location = None,
            device_profile: DeviceProfile = None
    ):
        self.smart_things_app = smart_things_app
        self._location = location
        self._device_profile = device_profile

    @classmethod
    def from_location(cls, location: Location):
        smart_things_apps = SmartThingsApp.objects.filter(location=location,
                                                      connector__type=SmartThingsConnector.Type.CLOUD_TO_CLOUD)
        return [cls(smart_app, location=location) for smart_app in smart_things_apps]

    @funcy.ignore(SmartThingsError)
    @funcy.log_errors(logger.error)
    def add_energy_meter_to_cloud(self, energy_meter: EnergyMeter):

        device_details = self.api_connector.create_device(
            label=energy_meter.name,
            profile_id=self.device_profile.profile_id,
            external_id=str(energy_meter.id)
        )
        C2CDeviceToEnergyMeterMap.objects.create(
            smart_things_app=self.smart_things_app,
            device_id=device_details.device_id,
            device_profile=self.device_profile,
            energy_meter=energy_meter
        )

    @funcy.ignore(SmartThingsError)
    @funcy.log_errors(logger.error)
    def remove_energy_meter_from_cloud(self, device_id: str):
        self.api_connector.destroy_device(device_id)

    @funcy.ignore(SmartThingsError)
    @funcy.log_errors(logger.error)
    def set_cloud_device_label(self, device_id: str, label: str):
        self.api_connector.update_device_label(device_id, label)

    def reconcile_device_list(self):
        self.clear_expired_map_items()
        self.clear_expired_cloud_devices()
        self.create_energy_meter_devices_on_cloud()

    def set_cloud_device_state(self, device_id: str, consumption_in_watts: float):
        consumption_in_kilo_watts = round(consumption_in_watts / 1000, 3)
        self.api_connector.send_event(device_id, Capability.ENERGY_METER, Attribute.ENERGY, consumption_in_kilo_watts)

    def clear_expired_map_items(self):
        C2CDeviceToEnergyMeterMap.objects \
            .filter(smart_things_app=self.smart_things_app, device_profile=self.device_profile) \
            .exclude(device_id__in=self.cloud_devices_ids) \
            .delete()

    def clear_expired_cloud_devices(self):
        mapped_device_ids = set(C2CDeviceToEnergyMeterMap.objects
                                .filter(smart_things_app=self.smart_things_app, device_profile=self.device_profile)
                                .values_list('device_id', flat=True)
                                .all())
        for device_id_for_removing in self.cloud_devices_ids - mapped_device_ids:
            self.remove_energy_meter_from_cloud(device_id_for_removing)

    def create_energy_meter_devices_on_cloud(self):
        connected_device_ids = list(C2CDeviceToEnergyMeterMap.objects.filter(smart_things_app=self.smart_things_app)
                                    .values_list('energy_meter_id', flat=True))
        for not_connected_meter in EnergyMeter.objects.in_location(self.location) \
                .exclude(id__in=connected_device_ids):
                self.add_energy_meter_to_cloud(not_connected_meter)

    @funcy.cached_property
    def location(self) -> Location:
        return self._location or self.smart_things_app.location

    @funcy.cached_property
    def api_connector(self) -> SmartThingsApiConnector:
        return SmartThingsApiConnector(self.smart_things_app)

    @funcy.cached_property
    def device_profile(self) -> DeviceProfile:
        return self._device_profile or \
               self.smart_things_app.connector.device_profiles.get(type=DeviceProfile.Type.ENERGY_METER)

    @property
    @funcy.cache(10)
    def cloud_devices_ids(self) -> Set[str]:
        return {
            device_detail.device_id for device_detail in self.api_connector.list_devices_details()
            if (device_detail.app and device_detail.app.installed_app_id == self.smart_things_app.app_id and
                device_detail.app.profile.id == self.device_profile.profile_id)
        }
