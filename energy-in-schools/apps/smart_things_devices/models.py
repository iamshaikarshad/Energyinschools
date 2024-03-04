import logging
from datetime import datetime, timezone, timedelta
from itertools import chain
from typing import Any, List, Optional, Generator, TYPE_CHECKING

from apps.smart_things_devices.settings import REFRESH_DEVICES_STATUSES_HOURS
from django.apps import apps
from django.db import models
from django.db.models import CASCADE, CharField
from django.db.transaction import atomic
from django.utils.functional import cached_property
from django.conf import settings
from django.core.validators import MaxValueValidator
from enumfields import EnumField
from safedelete import SOFT_DELETE_CASCADE
from safedelete.managers import SafeDeleteAllManager, SafeDeleteDeletedManager, SafeDeleteManager

from apps.locations.models import Location
from apps.locations.querysets import InSubLocationSafeDeleteQuerySet
from apps.main.models import BaseModel, SafeDeleteBaseModel
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.types import SmartThingsAppNotConnected, BadRequest
from apps.smart_things_devices.exceptions import DeviceNotConnected, CapabilitiesMismatchException
from apps.smart_things_devices.types import Capability, DeviceDetail, DeviceStatus
from apps.smart_things_devices.utilities.connectors import SmartThingsApiConnector
from apps.smart_things_sensors.settings import SMART_THINGS_SENSOR_MAP
from apps.smart_things_web_hooks.models import SmartThingsConnector

if TYPE_CHECKING:
    from apps.smart_things_sensors.models import SmartThingsSensor
    from apps.resources.types import ResourceState

logger = logging.getLogger(__name__)


class SmartThingsCapability(BaseModel):
    class Meta:
        verbose_name = 'Smart Things Capability'
        verbose_name_plural = 'Smart Things Capabilities'

    capability = CharField(max_length=100, blank=False, unique=True, db_index=True)

    @property
    def native_capability(self) -> Capability:
        """Return Capability enum value"""
        try:
            return Capability(self.capability)

        except ValueError:
            return Capability.UNKNOWN


class SmartThingsDevice(SafeDeleteBaseModel):
    class Meta:
        verbose_name = 'Smart Device'
        verbose_name_plural = 'Smart Devices'

        unique_together = ('smart_things_id', 'sub_location')

    objects = SafeDeleteManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()
    all_objects = SafeDeleteAllManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()
    deleted_objects = SafeDeleteDeletedManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()
    _safedelete_policy = SOFT_DELETE_CASCADE

    name = models.CharField(max_length=50, blank=True, default='', null=False)
    label = models.CharField(max_length=50, blank=True, default='', null=True)
    room_name = models.CharField(max_length=50, blank=True, default=None, null=True)

    sub_location = models.ForeignKey(Location, on_delete=CASCADE, related_name='smart_things_devices')
    is_connected = models.BooleanField(default=True, null=False)

    # smart_thing_app = models
    smart_things_id = models.CharField(max_length=50, blank=False, null=False, db_index=True, editable=False)
    smart_things_location = models.CharField(max_length=50, blank=False, null=False)

    capabilities = models.ManyToManyField(SmartThingsCapability, related_name='devices', blank=True)

    Status = DeviceStatus

    status = EnumField(Status, default=DeviceStatus.UNKNOWN)
    status_updated_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    battery_health = models.PositiveIntegerField(validators=[MaxValueValidator(100)], null=True, blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__original_label = self.label

    def save(self, **kwargs):
        if self.__original_label != self.label:
            if self.is_connected:
                self.api_connector.update_device_label(self.smart_things_id, self.label)

            else:
                raise DeviceNotConnected('Can not change label for unconnected device!')

        super().save(**kwargs)

    def delete(self, **kwargs):
        DetailedHistoricalData = apps.get_model('historical_data.DetailedHistoricalData')
        LongTermHistoricalData = apps.get_model('historical_data.LongTermHistoricalData')
        SmartThingsSensor = apps.get_model('smart_things_sensors.SmartThingsSensor')

        sensors = SmartThingsSensor.objects.filter(device=self)

        for sensor in sensors:
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            DetailedHistoricalData.objects.filter(resource=sensor.resource_ptr, time__lte=(today - timedelta(days=3))).delete()
            LongTermHistoricalData.objects.filter(resource=sensor.resource_ptr, time__lte=(today - timedelta(days=180))).delete()

        super(SmartThingsDevice, self).delete(**kwargs)

    def undelete(self, **kwargs):
        SmartThingsSensor = apps.get_model('smart_things_sensors.SmartThingsSensor')

        SmartThingsSensor.deleted_objects.filter(device=self).undelete()

        super(SmartThingsDevice, self).undelete(**kwargs)

    def update_from_details(self, device_details: DeviceDetail):
        if self != device_details:
            self.name = device_details.name
            self.label = device_details.label
            self.room_name = device_details.get_room_name()
            self.__original_label = device_details.label
            self.smart_things_id = device_details.device_id
            self.smart_things_location = device_details.location_id

            if not self.id:
                self.save()

            new_capabilities = device_details.get_raw_capabilities()
            existed_capabilities = set(
                SmartThingsCapability
                    .objects
                    .filter(capability__in=new_capabilities)
                    .values_list('capability', flat=True)
            )
            SmartThingsCapability.objects.bulk_create([
                SmartThingsCapability(capability=new_capability) for new_capability in new_capabilities if
                new_capability not in existed_capabilities
            ])
            self.capabilities.set(SmartThingsCapability.objects.filter(capability__in=new_capabilities))
            self.save()

    @classmethod
    @atomic
    def refresh_devices(cls, location: Location) -> None:
        try:
            smart_apps = SmartThingsApp.objects.filter(location=location,
                                                       connector__type=SmartThingsConnector.Type.SMART_APP)
            if smart_apps.count() == 0:
                raise SmartThingsAppNotConnected
            connectors_generator = (SmartThingsApiConnector(app).list_devices_details(
                ignore_unknown_device_type=True
            ) for app in smart_apps)
            devices_details = {
                device_details.device_id: device_details
                for device_details in chain.from_iterable(connectors_generator)
            }
        except SmartThingsAppNotConnected:
            return

        if settings.DELETE_DEVICES_ON_REFRESH:
            cls.objects.in_location(location).exclude(smart_things_id__in=devices_details).delete()

        for old_device in cls.all_objects.in_location(location).filter(
                smart_things_id__in=devices_details).select_for_update():
            device_details = devices_details.pop(old_device.smart_things_id)
            old_device.update_from_details(device_details)
            old_device.update_status()

            if old_device.deleted:
                old_device.save()  # restore the device

        for new_device_details in devices_details.values():
            new_device = cls(sub_location=location)
            new_device.update_from_details(new_device_details)
            new_device.update_status()

    @classmethod
    def get_devices_ids_for_refresh_status(cls) -> Generator[int, None, None]:
        now: datetime = datetime.now(tz=timezone.utc)

        for device_id in cls.objects.filter(
                status_updated_at__lte=now - timedelta(hours=REFRESH_DEVICES_STATUSES_HOURS)
        ).values_list('id', flat=True):
            yield device_id

    def update_status(self) -> None:
        status_updated_at = None
        try:
            status, status_updated_at = self.api_connector.get_device_status(self.smart_things_id)
            new_status = getattr(DeviceStatus, status)
        except (AttributeError, SmartThingsAppNotConnected):
            new_status = DeviceStatus.UNKNOWN

        self.status = new_status
        self.status_updated_at = status_updated_at
        self.save()

    def update_battery_health(self) -> None:
        try:
            self.battery_health = self.fetch_state(Capability.BATTERY)
            self.save()

        except BadRequest as error:
            logger.error(f'Error appeared while device {self.name} (ID={self.id})'
                         f'was trying to update battery health!\n'
                         f'Error: {str(error)}')

    def fetch_state(self, capability: Capability) -> Any:
        return self.api_connector.get_device_states(self.smart_things_id, capability)

    def _validate_capability(self, capability: Capability):
        if capability not in self.native_capabilities:
            raise CapabilitiesMismatchException(CapabilitiesMismatchException.get_error_message(capability))

    @classmethod
    def get_devices_for_updating_battery_health(cls) -> 'Iterable[SmartThingsDevice]':
        capability = Capability.BATTERY

        for device in cls.objects.all():
            if capability in device.native_capabilities:
                yield device

    def get_sensor(self, capability: Capability) -> 'Optional[SmartThingsSensor]':
        if capability in SMART_THINGS_SENSOR_MAP:
            return self.sensors.filter(capability=capability).first()

    def get_latest_state(self, capability: Capability) -> 'Optional[ResourceState]':
        self._validate_capability(capability)
        sensor = self.get_sensor(capability)

        if not sensor:
            return

        return sensor.get_latest_state()

    def execute_command(self, capability: Capability, value: Any) -> None:
        self._validate_capability(capability)
        self.api_connector.execute_command(self.smart_things_id, capability, value)

    @cached_property
    def api_connector(self) -> SmartThingsApiConnector:
        return SmartThingsApiConnector.from_location(self.sub_location, self.smart_things_location)

    @property
    def raw_capabilities(self) -> List[str]:
        """Return list of names of capabilities"""
        return self.capabilities.values_list('capability', flat=True)

    @property
    def native_capabilities(self) -> List[Capability]:
        return [
            capability.native_capability
            for capability in self.capabilities.all()
            if capability.native_capability is not Capability.UNKNOWN
        ]

    def __eq__(self, other):
        if isinstance(other, DeviceDetail):
            capabilities_eq = True
            if self.id:
                capabilities_eq = set(self.raw_capabilities) == set(other.get_raw_capabilities())
            return \
                self.name == other.name and \
                self.label == other.label and \
                self.room_name == other.get_room_name() and \
                self.smart_things_id == other.device_id and \
                self.smart_things_location == other.location_id and \
                capabilities_eq
        else:
            return super().__eq__(other)
