from django.core.management import BaseCommand

from apps.energy_providers.utils.mqtt_manager import MqttEnergyProviderConnectionManager


class Command(BaseCommand):
    def handle(self, *args, **options):
        MqttEnergyProviderConnectionManager().run_forever()
