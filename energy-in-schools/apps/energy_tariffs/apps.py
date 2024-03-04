from django.apps import AppConfig


class EnergyTariffConfig(AppConfig):
    name = 'apps.energy_tariffs'

    def ready(self):
        import apps.energy_tariffs.signals
