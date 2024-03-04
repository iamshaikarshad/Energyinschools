from django.urls import path, register_converter, include
from rest_framework import routers

from apps.microbit_energy.converters import MeterTypeConverter
from apps.microbit_energy.views import MicrobitEnergyViewSet

register_converter(MeterTypeConverter, 'MeterType')


router = routers.DefaultRouter()
router.register('', MicrobitEnergyViewSet, 'microbit-energy')


urlpatterns = [
    path('', include(router.urls))
]
