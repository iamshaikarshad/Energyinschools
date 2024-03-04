from django.urls import include, path
from rest_framework import routers

from .views import CarbonIntensityViewSet


router = routers.DefaultRouter()
router.register('', CarbonIntensityViewSet, 'carbon_emission')

urlpatterns = [
    path('', include(router.urls))
]
