from django.urls import path, include
from rest_framework import routers

from apps.energy_providers.views import EnergyProviderViewSet

router = routers.DefaultRouter()
router.register('', EnergyProviderViewSet, 'energy-provider_account')

urlpatterns = [
    path('', include(router.urls))
]
