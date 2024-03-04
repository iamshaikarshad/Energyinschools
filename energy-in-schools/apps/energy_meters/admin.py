from django.contrib import admin

from apps.energy_meters.models import EnergyMeter
from apps.resources.admin import ResourceChildAdmin


class EnergyMeterAdmin(EnergyMeter.get_model_admin(), ResourceChildAdmin):
    pass


admin.site.register(EnergyMeter, EnergyMeterAdmin)
