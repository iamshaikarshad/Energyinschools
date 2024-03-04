from django.urls import path, include
from rest_framework import routers

from apps.locations.views import LocationViewSet, OpenDataLocationViewSet

router = routers.DefaultRouter()
router.register('', LocationViewSet, 'locations')

open_data_router = routers.DefaultRouter()
open_data_router.register('', OpenDataLocationViewSet, 'open-data')

urlpatterns = [
    path('open-data/', include(open_data_router.urls)),
    path('', include(router.urls)),
]
