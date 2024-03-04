from django.urls import include, path
from rest_framework import routers

from apps.energy_meters_billing_info.views import EnergyMeterBillingInfoViewSet


router = routers.DefaultRouter()
router.register('', EnergyMeterBillingInfoViewSet, 'energy-meter-billing-info')

urlpatterns = [
    path('', include(router.urls)),
]
