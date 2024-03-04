from django.urls import include, path
from rest_framework import routers

from apps.smart_things_sensors.views import SmartThingsSensorViewSet, SmartThingsEnergyMeterViewSet


router = routers.DefaultRouter()
router.register('sensors', SmartThingsSensorViewSet, 'smart-devices-sensors')
router.register('energy-meters', SmartThingsEnergyMeterViewSet, 'smart-things-energy-meters')

urlpatterns = [
    path('', include(router.urls))
]
