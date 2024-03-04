from django.contrib import admin

from apps.smart_things_sensors.models import SmartThingsSensor, SmartThingsEnergyMeter
from apps.resources.admin import DisableRelationListingMixin


class SmartThingsSensorModelAdmin(SmartThingsSensor.get_model_admin(), DisableRelationListingMixin):
    pass


class SmartThingsEnergyMeterModelAdmin(SmartThingsEnergyMeter.get_model_admin(), DisableRelationListingMixin):
    pass


# Register your models here.
admin.site.register(SmartThingsSensor, SmartThingsSensorModelAdmin)
admin.site.register(SmartThingsEnergyMeter, SmartThingsEnergyMeterModelAdmin)
