from django.urls import path, include
from rest_framework import routers

from apps.smart_things_devices.views import SmartDevicesView

router = routers.DefaultRouter()
router.register('', SmartDevicesView, 'smart-devices-view')

urlpatterns = [
    path('', include(router.urls))
]
