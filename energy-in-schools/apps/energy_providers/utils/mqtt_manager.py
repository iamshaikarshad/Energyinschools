import time
from datetime import timedelta
from typing import Dict, List, Set

import funcy

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import Meter
from apps.energy_providers.utils.mqtt_subscriber import MqttEnergySubscriber


class MqttEnergyProviderConnectionManager:
    UPDATE_PROVIDERS_DELAY = timedelta(minutes=5)

    def __init__(self):
        self.connections: Dict[int, MqttEnergySubscriber] = {}  # {provider_id: client}

    def run_forever(self):
        while True:
            self.collect_closed_connections()
            self.update_subscriptions()
            time.sleep(self.UPDATE_PROVIDERS_DELAY.total_seconds())

    def update_subscriptions(self):
        fresh_meters = self._get_fresh_meters()
        fresh_meter_dict = dict(funcy.group_by(lambda meter: meter.provider_account_id, fresh_meters))

        for provider_account_id in list(self.connections.keys()):
            if provider_account_id not in fresh_meter_dict:
                self.close_connection(provider_account_id)

        for provider_account_id, fresh_meters_per_provider in fresh_meter_dict.items():
            if provider_account_id not in self.connections:
                self.open_connection(provider_account_id)

            self.connections[provider_account_id].update_subscriptions(fresh_meters_per_provider)

    def open_connection(self, provider_id: int):
        connection = MqttEnergySubscriber(EnergyProviderAccount.objects.get(id=provider_id).connection)
        connection.connect()
        self.connections[provider_id] = connection

    def close_connection(self, provider_id: int):
        self.connections[provider_id].disconnect()
        del self.connections[provider_id]

    def _get_fresh_meters(self) -> Set[Meter]:
        return set(
            Meter(**energy_meter_data)
            for energy_meter_data in
            EnergyMeter
                .objects
                .filter(provider_account__provider__in=self._mqtt_providers)
                .values('meter_id', 'type', 'provider_account_id')
                .order_by('provider_account_id')
                .all()
        )

    @funcy.cached_property
    def _mqtt_providers(self) -> List[EnergyProviderAccount.Provider]:
        return [
            provider_type
            for provider_type in EnergyProviderAccount.Provider
            if provider_type.is_support_mqtt
        ]

    def collect_closed_connections(self):
        for provider_id, mqtt_energy_subscriber in self.connections.copy().items():
            if not mqtt_energy_subscriber.is_running:
                self.close_connection(provider_id)
