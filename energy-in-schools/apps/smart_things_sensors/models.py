from datetime import datetime, timezone
from typing import Any, Union

from django.db import models
from enumfields import EnumField

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import MeterType
from apps.resources.models import PullSupportedResource, Resource
from apps.resources.types import DataCollectionMethod, ResourceChildType, ResourceValue, TimeResolution
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.types import Capability, DeviceEvent, DeviceStatus
from apps.smart_things_sensors.settings import SMART_THINGS_SENSOR_MAP, SensorConfig
from utilities.custom_serializer_fields import AutoLengthEnumField
from utilities.int_value_enum_mixin import IntValueEnumMixin


class SmartThingsSensor(PullSupportedResource):
    class Meta:
        ordering = ('name',)
        unique_together = ('device', 'capability')

    sa: Union['SmartThingsSensor', Any]  # SQLAlchemy provided by aldjemy

    resource_ptr = models.OneToOneField(
        to=Resource,
        parent_link=True,
        related_name=ResourceChildType.SMART_THINGS_SENSOR.value,
        on_delete=models.CASCADE
    )

    device = models.ForeignKey(SmartThingsDevice, on_delete=models.CASCADE, related_name='sensors', editable=False)
    capability = AutoLengthEnumField(Capability, db_index=True, editable=False)
    events_subscription_id = models.CharField(max_length=50, null=True, blank=True, db_index=True)

    STR_ATTRIBUTES = (
        'device_id',
        'name',
        'capability',
    )

    def save(self, **kwargs):
        assert self.capability in SMART_THINGS_SENSOR_MAP, f'"{self.capability}" is unsupported!'

        if not self.child_type:
            self.child_type = ResourceChildType.SMART_THINGS_SENSOR

        sensor_config = self.sensor_config
        self._set_values_from_sensor_config(sensor_config)

        if sensor_config.preferred_data_collection_method == DataCollectionMethod.PUSH:
            # event based sensors can not store data in long term history
            self.detailed_data_live_time = None

        else:
            self.long_term_time_resolution = TimeResolution.HALF_HOUR

        super().save(**kwargs)

    def _set_values_from_sensor_config(self, sensor_config):
        self.supported_data_collection_methods = sensor_config.supported_data_collection_methods
        self.preferred_data_collection_method = sensor_config.preferred_data_collection_method
        self.unit = self.capability.unit
        self.detailed_time_resolution = sensor_config.detailed_time_resolution

    def process_event(self, event: DeviceEvent):
        self.add_value(self._parse_event(event))

    @staticmethod
    def _parse_event(event: DeviceEvent) -> ResourceValue:
        value = event.value
        if isinstance(value, IntValueEnumMixin):
            value = value.int_value

        return ResourceValue(
            time=datetime.now(tz=timezone.utc),
            value=value,
            unit=event.capability.unit
        )

    def fetch_current_value(self):
        value = self.device.fetch_state(self.capability)
        if isinstance(value, IntValueEnumMixin):
            value = value.int_value

        return ResourceValue(
            time=datetime.now(tz=timezone.utc),
            value=value,
            unit=self.unit
        )

    @property
    def sensor_config(self) -> 'SensorConfig':
        return SMART_THINGS_SENSOR_MAP[self.capability]

    def subscribe_for_events(self):
        if self.preferred_data_collection_method == DataCollectionMethod.PUSH:
            self.events_subscription_id = self.device.api_connector.subscribe_for_device_events(
                device_id=self.device.smart_things_id,
                capability=self.capability
            )
            self.save()

    def unsubscribe_for_events(self):
        if self.events_subscription_id:
            self.device.api_connector.unsubscribe_for_device_events(self.events_subscription_id)
            self.events_subscription_id = None
            self.save()

    def collect_new_values(self):
        if self.device.status != DeviceStatus.OFFLINE:
            super().collect_new_values()


class SmartThingsEnergyMeter(SmartThingsSensor):
    sensor = models.OneToOneField(
        to=SmartThingsSensor,
        parent_link=True,
        on_delete=models.CASCADE,
        related_name=ResourceChildType.SMART_THINGS_ENERGY_METER.value
    )

    Type = MeterType

    sa: Union['SmartThingsEnergyMeter', Any]  # SQLAlchemy provided by aldjemy

    provider_account = models.ForeignKey(
        EnergyProviderAccount,
        models.CASCADE,
        null=True,
        blank=True,
        related_name=f"{ResourceChildType.SMART_THINGS_ENERGY_METER.value}s"
    )

    type = EnumField(MeterType, max_length=20, blank=True, default=MeterType.SMART_PLUG.value)

    STR_ATTRIBUTES = (
        'type',
        'provider_account_id',
        'name'
    )

    @property
    def connectivity_status(self):
        return self.sensor.device.status

    def save(self, **kwargs):
        assert self.capability == Capability.POWER_METER, f'"Capability should be {Capability.POWER_METER}, {self.capability} given!"'

        self.child_type = ResourceChildType.SMART_THINGS_ENERGY_METER

        sensor_config = self.sensor_config
        self._set_values_from_sensor_config(sensor_config)
        self.long_term_time_resolution = TimeResolution.HALF_HOUR

        super(SmartThingsSensor, self).save(**kwargs)
