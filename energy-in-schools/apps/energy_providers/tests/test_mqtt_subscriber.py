import os
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Iterable, TYPE_CHECKING, Union
from unittest.mock import MagicMock, patch

from django.conf import settings

from apps.energy_providers.providers.abstract import Meter, MeterType, ProviderConfigContainer
from apps.energy_providers.providers.mqtt import MqttProviderConnection
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.energy_providers.utils.mqtt_subscriber import MqttEnergySubscriber, MqttEnergySubscriberError
from apps.historical_data.models import DetailedHistoricalData
from apps.resources.types import ResourceValue, Unit


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter


class MqttClientMock(MagicMock):
    def __init__(self):
        super().__init__()

        self.username_pw_set = MagicMock()
        self.tls_set = MagicMock()
        self.on_connect: Callable[[Any, Any, Any, int], None] = None
        self.connect_async = MagicMock()
        self.disconnect = MagicMock()
        self.loop_start = MagicMock()
        self.loop_stop = MagicMock()
        self.message_callback_add = MagicMock()
        self.message_callback_remove = MagicMock()
        self.subscribe = MagicMock()
        self._thread = MagicMock()
        self._thread.is_alive.return_value = True


class FakeMqttProviderConnection(MqttProviderConnection):
    host = '123.111.222.333'
    port = 123
    topic_format = 'energy/{meter_id}/live'
    certificate = 'the.cert'
    keep_alive = timedelta(seconds=123)
    validate_provider_timeout = timedelta(seconds=.1)
    get_consumption_timeout = timedelta(seconds=.1)

    def __init__(self, config_container: 'ProviderConfigContainer'):
        super().__init__(config_container)
        self.parse_message = MagicMock(return_value=ResourceValue(
            time=datetime(2000, 10, 10, tzinfo=timezone.utc),
            value=42,
            unit=Unit.WATT
        ))

    def parse_message(self, message: str, energy_meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        pass


@patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class', return_value=FakeMqttProviderConnection)
@patch('apps.energy_providers.utils.mqtt_subscriber.MqttClient', new=MqttClientMock)
class TestMqttSubscriber(EnergyProviderBaseTestCase):
    @patch('apps.energy_providers.utils.mqtt_subscriber.MqttEnergySubscriber.subscribe_for_energy_meter')
    def test___init__(self, subscribe_for_energy_meter_mock: MagicMock, _):
        mqtt_subscriber = self._create_mqtt_subscriber()

        mqtt_subscriber.client.username_pw_set.assert_called_once_with(
            username=self.energy_provider.connection.credentials.login,
            password=self.energy_provider.connection.credentials.password,
        )

        mqtt_subscriber.client.tls_set.assert_called_once_with(
            os.path.join(settings.MQTT_CERTIFICATES_FOLDER, FakeMqttProviderConnection.certificate)
        )

        subscribe_for_energy_meter_mock.assert_called_once_with(
            self.energy_meter
        )

    def test_connect(self, _):
        mqtt_subscriber = self._create_mqtt_subscriber()
        mqtt_subscriber.connect()
        mqtt_subscriber.client.connect_async.assert_called_once_with(
            host=FakeMqttProviderConnection.host,
            port=FakeMqttProviderConnection.port,
            keepalive=FakeMqttProviderConnection.keep_alive.total_seconds(),
        )
        mqtt_subscriber.client.loop_start.assert_called_once_with()

    def test_disconnect(self, _):
        mqtt_subscriber = self._create_mqtt_subscriber()
        mqtt_subscriber.disconnect()
        mqtt_subscriber.client.disconnect.assert_called_once_with()
        mqtt_subscriber.client.loop_stop.assert_called_once_with()

    def test_subscribe_for_energy_meter(self, _):
        mqtt_subscriber = self._create_mqtt_subscriber()
        mqtt_subscriber.client.message_callback_add.reset_mock()

        with self.subTest('ignore duplicate'):
            with self.assertRaises(MqttEnergySubscriberError):
                mqtt_subscriber.subscribe_for_energy_meter(self.energy_meter)

            mqtt_subscriber.client.message_callback_add.assert_not_called()

        with self.subTest('unsubscribe'):
            mqtt_subscriber.unsubscribe_for_energy_meter(self.energy_meter)
            mqtt_subscriber.client.message_callback_remove.assert_called_once()

        with self.subTest('unsubscribe twice'):
            with self.assertRaises(MqttEnergySubscriberError):
                mqtt_subscriber.unsubscribe_for_energy_meter(self.energy_meter)
                
            mqtt_subscriber.client.message_callback_remove.assert_called_once()

        with self.subTest('subscribe'):
            mqtt_subscriber.subscribe_for_energy_meter(self.energy_meter)
            mqtt_subscriber.client.message_callback_add.assert_called_once()

    def test_update_subscriptions(self, _):
        mqtt_subscriber = self._create_mqtt_subscriber()
        mqtt_subscriber.client.message_callback_add.reset_mock()
        mqtt_subscriber.client.message_callback_remove.reset_mock()

        with self.subTest('unchanged'):
            mqtt_subscriber.update_subscriptions([Meter.get_only_unique_fields(self.energy_meter)])
            mqtt_subscriber.client.message_callback_add.assert_not_called()
            mqtt_subscriber.client.message_callback_remove.assert_not_called()

        with self.subTest('add one'):
            mqtt_subscriber.update_subscriptions([Meter.get_only_unique_fields(self.energy_meter),
                                                  Meter(meter_id='123', type=MeterType.GAS, provider_account_id=321)])
            mqtt_subscriber.client.message_callback_add.assert_called_once()
            mqtt_subscriber.client.message_callback_remove.assert_not_called()

        mqtt_subscriber.client.message_callback_add.reset_mock()
        mqtt_subscriber.client.message_callback_remove.reset_mock()

        with self.subTest('replace one'):
            mqtt_subscriber.update_subscriptions([Meter(meter_id='123', type=MeterType.GAS, provider_account_id=321),
                                                  Meter(meter_id='321', type=MeterType.GAS, provider_account_id=321)])
            mqtt_subscriber.client.message_callback_add.assert_called_once()
            mqtt_subscriber.client.message_callback_remove.assert_called_once()

    def test_on_connect(self, _):
        mqtt_subscriber = self._create_mqtt_subscriber()

        self.assertIsNone(mqtt_subscriber.connect_result)

        mqtt_subscriber.client.on_connect(None, None, None, 123)
        self.assertEqual(123, mqtt_subscriber.connect_result)
        mqtt_subscriber.client.subscribe.assert_called_once_with(
            FakeMqttProviderConnection.topic_format.format(meter_id='+'))

    def test_on_event(self, _):
        mqtt_subscriber = self._create_mqtt_subscriber((Meter.get_only_unique_fields(self.energy_meter),))

        message = MagicMock()
        message.payload = 'any'

        data_count = DetailedHistoricalData.objects.count()

        event_callback = mqtt_subscriber.client.message_callback_add.call_args[0][1]
        event_callback(None, None, message)

        self.assertEqual(self.energy_provider.connection.parse_message.return_value, mqtt_subscriber.last_value)
        self.assertEqual(data_count + 1, DetailedHistoricalData.objects.count())

    def _create_mqtt_subscriber(self,
                                energy_meters: 'Iterable[Union[EnergyMeter, Meter]]' = None) -> MqttEnergySubscriber:
        return MqttEnergySubscriber(
            provider_connection=self.energy_provider.connection,
            energy_meters=[self.energy_meter] if energy_meters is None else energy_meters
        )
