from django.urls import include, path
from rest_framework import routers

from apps.energy_dashboard.views import EnergyDashboardScreenViewSet, ping, TipsViewSet

router = routers.DefaultRouter()
router.register('screens', EnergyDashboardScreenViewSet, 'dashboard-screens')

tips_router = routers.DefaultRouter()
tips_router.register('', TipsViewSet, 'tips')

urlpatterns = [
    path('', include(router.urls)),
    path('ping/', ping, name='ping-energy-dashboard'),
    path('tips/', include(tips_router.urls))
]
