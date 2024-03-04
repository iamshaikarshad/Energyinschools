from django.urls import path, include
from rest_framework import routers

from apps.hubs.views import RaspberryViewSet


router = routers.DefaultRouter()
router.register('', RaspberryViewSet, 'hubs')

urlpatterns = [
    path('', include(router.urls))
]
