from django.contrib import admin

from apps.smart_things_devices.models import SmartThingsDevice, SmartThingsCapability
from apps.resources.admin import DisableRelationListingMixin


class SmartThingsDeviceModelAdmin(SmartThingsDevice.get_model_admin(), DisableRelationListingMixin):
    pass


# Register your models here.
admin.site.register(SmartThingsDevice, SmartThingsDeviceModelAdmin)
admin.site.register(SmartThingsCapability, SmartThingsCapability.get_model_admin())
