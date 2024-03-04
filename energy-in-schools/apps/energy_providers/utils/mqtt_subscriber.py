import logging
import os
from functools import partial
from typing import Iterable, Optional, Set, TYPE_CHECKING, Union

import funcy
from django.conf import settings
from paho.mqtt.client import Client as MqttClient, MQTTMessage

from apps.energy_providers.providers.abstract import Meter
from apps.resources.types import ResourceValue


logger = logging.getLogger(__name__)


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter
    from apps.energy_providers.providers.mqtt import MqttProviderConnection


class MqttEnergySubscriberError(Exception):
    pass


class MqttEnergySubscriber:
    def __init__(
            self,
            provider_connection: 'MqttProviderConnection',
            energy_meters: 'Iterable[Union[EnergyMeter, Meter]]' = ()
    ):
        self.provider_connection: 'MqttProviderConnection' = provider_connection
        self._subscribed_meters: Set[Meter] = set()
        self._connect_result = None
        self.last_value: ResourceValue = None

        self.client = MqttClient()
        self.client.username_pw_set(
            username=self.provider_connection.credentials.login,
            password=self.provider_connection.credentials.password,
        )
        if self.provider_connection.certificate:
            self.client.tls_set(os.path.join(settings.MQTT_CERTIFICATES_FOLDER, self.provider_connection.certificate))

        self.client.on_connect = self._on_connect

        for energy_meter in energy_meters:
            self.subscribe_for_energy_meter(energy_meter)

    def __del__(self):
        if self.is_running:
            self.disconnect()

    def connect(self):
        self.client.connect_async(
            host=self.provider_connection.host,
            port=self.provider_connection.port,
            keepalive=int(self.provider_connection.keep_alive.total_seconds()),
        )
        self.client.loop_start()

    @funcy.log_enters(logger.info)
    def subscribe_for_energy_meter(self, energy_meter: 'Union[EnergyMeter, Meter]'):
        meter = Meter.get_only_unique_fields(energy_meter)

        if meter in self._subscribed_meters:
            raise MqttEnergySubscriberError(f'Subscriptions for "{meter}" already exists!')

        self.client.message_callback_add(
            self.provider_connection.topic_format.format(meter_id=energy_meter.meter_id),
            partial(self._on_event, energy_meter=energy_meter)
        )
        self._subscribed_meters.add(meter)

    @funcy.log_enters(logger.info)
    def unsubscribe_for_energy_meter(self, energy_meter: 'Union[EnergyMeter, Meter]'):
        meter = Meter.get_only_unique_fields(energy_meter)

        if meter not in self._subscribed_meters:
            raise MqttEnergySubscriberError(f'There no subscriptions for "{meter}"!')

        self._subscribed_meters.remove(meter)
        self.client.message_callback_remove(
            self.provider_connection.topic_format.format(meter_id=energy_meter.meter_id)
        )

    def disconnect(self):
        self.client.disconnect()
        self.client.loop_stop()

    def update_subscriptions(self, meters: Iterable[Meter]):
        fresh_meters_set = set(meters)

        for removed_meter in self._subscribed_meters - fresh_meters_set:
            self.unsubscribe_for_energy_meter(removed_meter)

        for new_meter in fresh_meters_set - self._subscribed_meters:
            self.subscribe_for_energy_meter(new_meter)

    @property
    def connect_result(self) -> Optional[int]:
        return self._connect_result

    @property
    def is_running(self) -> bool:
        # noinspection PyProtectedMember
        return self.client._thread and self.client._thread.is_alive()

    def _on_connect(self, client, userdata, flags, rc):
        logger.debug(f'MQTT connected to "{self.provider_connection.__class__.__name__}" '
                     f'with login "{self.provider_connection.credentials.login}"')

        self._connect_result = rc
        self.client.subscribe(self.provider_connection.topic_format.format(meter_id='+'))

    @funcy.silent
    @funcy.log_errors(logger.error)
    def _on_event(self, client, user_data, message: MQTTMessage, energy_meter: 'Union[EnergyMeter, Meter]'):
        from apps.energy_meters.models import EnergyMeter

        logger.debug(f'MQTT event for meter meter_id: "{energy_meter.meter_id}": "{message.payload}"')
        self.last_value = self.provider_connection.parse_message(message.payload, energy_meter)

        if isinstance(energy_meter, Meter):
            try:
                energy_meter = energy_meter.get_energy_meter()
            except EnergyMeter.DoesNotExist:
                pass  # the meter can be not saved yet

        if isinstance(energy_meter, EnergyMeter):
            # EnergyMeter have "id" and the data can be saved to the database
            # Meter don't have "id" but "self.last_value" can be used
            energy_meter.add_value(self.last_value)
