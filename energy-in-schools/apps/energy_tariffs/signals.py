from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo, EnergyMeterBillingInfoConsumption
from apps.energy_tariffs.models import EnergyTariff


@receiver(post_save, sender=EnergyMeterBillingInfo, dispatch_uid='post_save_meter_info')
def post_save_meter_info(instance: EnergyMeterBillingInfo, **__):
    EnergyTariff.objects.filter(energy_meter_billing_info_consumption__energy_meter_billing_info=instance).delete()

    for consumption_rate in instance.consumption_by_rates.all():
        EnergyTariff.create_by_embi_consumption(consumption_rate)


@receiver(post_save, sender=EnergyMeterBillingInfoConsumption, dispatch_uid='post_save_meter_consumption')
def post_save_meter_consumption(instance: EnergyMeterBillingInfoConsumption, **__):
    related_tariff = EnergyTariff.objects.filter(energy_meter_billing_info_consumption=instance)
    if related_tariff.exists():
        related_tariff.update(watt_hour_cost=instance.unit_rate / 1000 / 100)
    else:
        EnergyTariff.create_by_embi_consumption(instance)
