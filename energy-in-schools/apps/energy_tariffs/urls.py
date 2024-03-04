from django.urls import include, path
from rest_framework import routers

from apps.energy_tariffs.views import EnergyTariffViewSet


router = routers.DefaultRouter()
router.register('', EnergyTariffViewSet, 'energy-tariff')

urlpatterns = [
    path('', include(router.urls))
]
