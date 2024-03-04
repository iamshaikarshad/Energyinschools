from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from paho.mqtt.client import MQTT_ERR_SUCCESS

from apps.energy_providers.providers.abstract import ProviderValidateError
from apps.energy_providers.providers.mqtt import logger
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.energy_providers.tests.test_mqtt_subscriber import FakeMqttProviderConnection, MqttClientMock
from apps.resources.types import ResourceDataNotAvailable, ResourceValue, Unit


@patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class',
       return_value=FakeMqttProviderConnection)
@patch('apps.energy_providers.utils.mqtt_subscriber.MqttClient', new=MqttClientMock)
class TestMqttProviderConnection(EnergyProviderBaseTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logger.disabled = True

    def test_get_consumption(self, _):
        value = ResourceValue(time=datetime(2000, 10, 10, tzinfo=timezone.utc), value=42, unit=Unit.WATT)

        mqtt_energy_subscriber = MagicMock(return_value=None)
        mqtt_energy_subscriber.last_value = None
        with patch('apps.energy_providers.providers.mqtt.MqttEnergySubscriber', return_value=mqtt_energy_subscriber), \
             self.subTest('provider_account validate error'), \
             self.assertRaises(ProviderValidateError):
            self.energy_provider.connection.get_consumption(self.energy_meter)

        mqtt_energy_subscriber.connect_result = MQTT_ERR_SUCCESS
        with patch('apps.energy_providers.providers.mqtt.MqttEnergySubscriber', return_value=mqtt_energy_subscriber), \
             self.subTest('resource data not found'), \
             self.assertRaises(ResourceDataNotAvailable):
            self.energy_provider.connection.get_consumption(self.energy_meter)

        mqtt_energy_subscriber.last_value = value
        with self.subTest('success'), \
             patch('apps.energy_providers.providers.mqtt.MqttEnergySubscriber', return_value=mqtt_energy_subscriber):
            self.assertEqual(value, self.energy_provider.connection.get_consumption(self.energy_meter))

    def test_validate(self, _):
        mqtt_energy_subscriber = MagicMock(return_value=None)
        with patch('apps.energy_providers.providers.mqtt.MqttEnergySubscriber', return_value=mqtt_energy_subscriber), \
             self.subTest('failed'), \
             self.assertRaises(ProviderValidateError):
            self.energy_provider.connection.validate()

        mqtt_energy_subscriber.connect_result = MQTT_ERR_SUCCESS
        with patch('apps.energy_providers.providers.mqtt.MqttEnergySubscriber', return_value=mqtt_energy_subscriber), \
             self.subTest('success'):
            self.energy_provider.connection.validate()
