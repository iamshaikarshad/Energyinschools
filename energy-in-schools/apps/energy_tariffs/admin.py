from django.contrib import admin

from apps.energy_tariffs.models import EnergyTariff


admin.site.register(EnergyTariff, EnergyTariff.get_model_admin())
