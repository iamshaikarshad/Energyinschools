from django.contrib import admin

from apps.energy_providers.models import EnergyProviderAccount


admin.site.register(EnergyProviderAccount, EnergyProviderAccount.get_model_admin())
