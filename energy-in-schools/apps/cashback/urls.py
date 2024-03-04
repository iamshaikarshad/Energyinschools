from django.urls import include, path
from rest_framework import routers

from apps.cashback.views import LocationCashbackViewSet

router = routers.DefaultRouter()
router.register('', LocationCashbackViewSet, 'energy-cashback')

urlpatterns = [
    path('', include(router.urls))
]
