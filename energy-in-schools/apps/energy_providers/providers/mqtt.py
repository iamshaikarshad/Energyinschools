import logging
import time
from abc import abstractmethod
from datetime import timedelta
from typing import TYPE_CHECKING, Union

import funcy
from paho.mqtt.client import MQTT_ERR_SUCCESS

from apps.energy_providers.providers.abstract import AbstractProviderConnection, Meter, ProviderValidateError
from apps.energy_providers.utils.mqtt_subscriber import MqttEnergySubscriber
from apps.resources.types import ResourceDataNotAvailable, ResourceValue


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter

logger = logging.getLogger(__name__)


class MqttProviderConnection(AbstractProviderConnection):
    host: str = None
    port: int = None
    topic_format: str = None
    certificate: str = None
    keep_alive = timedelta(seconds=60)
    validate_provider_timeout = timedelta(seconds=1)
    get_consumption_timeout = timedelta(seconds=15)

    @funcy.log_errors(logger.warning, label="Provider MQTT API is not available now")
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        """
        Don't use this method when possible!
        """

        client = MqttEnergySubscriber(self, (meter,))
        client.connect()

        start_time = time.time()
        while client.connect_result in (None, MQTT_ERR_SUCCESS) and client.last_value is None and \
                time.time() - start_time < self.get_consumption_timeout.total_seconds():
            time.sleep(.1)

        client.disconnect()

        if client.connect_result != MQTT_ERR_SUCCESS:
            raise ProviderValidateError

        if not client.last_value:
            raise ResourceDataNotAvailable('Data not available')

        return client.last_value

    def validate(self):
        client = MqttEnergySubscriber(self, ())
        client.connect()

        start_time = time.time()
        while client.connect_result is None and \
                time.time() - start_time < self.validate_provider_timeout.total_seconds():
            time.sleep(.1)

        client.disconnect()

        if client.connect_result != MQTT_ERR_SUCCESS:
            raise ProviderValidateError

    @abstractmethod
    def parse_message(self, message: str, energy_meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        pass
