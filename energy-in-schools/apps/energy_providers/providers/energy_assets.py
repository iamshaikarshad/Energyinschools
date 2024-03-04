import json
import logging
from datetime import timezone
from typing import TYPE_CHECKING, Union

import funcy
from dateutil.parser import parse
from dateutil.utils import default_tzinfo

from apps.energy_providers.providers.mqtt import MqttProviderConnection
from apps.resources.types import ResourceValue, Unit


if TYPE_CHECKING:
    from apps.energy_providers.providers.abstract import Meter
    from apps.energy_meters.models import EnergyMeter

logger = logging.getLogger(__name__)


class EnergyAssetsProviderConnection(MqttProviderConnection):
    host = '212.250.119.234'
    port = 8883
    certificate = 'ea_mqtt_ca_crt.crf'
    topic_format = 'samsung/sch/reading/{meter_id}'

    @funcy.log_errors(logger.error, label='Error was occured while parsing MQTT messages from EnergyAssets')
    def parse_message(self, message: str, energy_meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        from apps.energy_providers.providers.abstract import ProviderError

        json_message = json.loads(message)

        try:
            if json_message['power_unit'] != 'kW':
                raise ProviderError(f'Expected power unit is "w" but "{json_message["power_unit"]}" given!')

            return ResourceValue(
                time=default_tzinfo(parse(json_message['timestamp']), tzinfo=timezone.utc),
                value=max(json_message['power'] * 1000, 0),  # handle bug with negative values
                unit=Unit.WATT,
            )
        except KeyError as exception:
            raise ProviderError('Incorrect json message from Energy Assets MQTT API') from exception

    def validate_meter(self, meter: 'Union[EnergyMeter, Meter]'):
        """Validation disabled in case of time resolution 1 minute"""
        pass
