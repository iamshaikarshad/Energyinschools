from django.urls import path, include
from rest_framework import routers

from apps.energy_meters.views import EnergyMeterViewSet, EnergyMeterHistoricalDataViewSet, ManageHildebrandMetersViewSet


router = routers.DefaultRouter()
router.register('', EnergyMeterViewSet, 'energy-meter')
router.register('', EnergyMeterHistoricalDataViewSet, 'energy-meter')

hildebrand_router = routers.DefaultRouter()
hildebrand_router.register('', ManageHildebrandMetersViewSet, 'hildebrand')

urlpatterns = [
    path('hildebrand/', include(hildebrand_router.urls)),
    path('', include(router.urls))
]
