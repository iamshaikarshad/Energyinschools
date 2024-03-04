from django.contrib import admin

from apps.smart_things_c2c.models import C2CDeviceToEnergyMeterMap, DeviceProfile


admin.site.register(C2CDeviceToEnergyMeterMap, C2CDeviceToEnergyMeterMap.get_model_admin())
admin.site.register(DeviceProfile, DeviceProfile.get_model_admin())
