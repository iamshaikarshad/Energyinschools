from django.apps import AppConfig


class EnergyMetersBillingInfoConfig(AppConfig):
    name = 'apps.energy_meters_billing_info'

    def ready(self):
        import apps.energy_meters_billing_info.signals
