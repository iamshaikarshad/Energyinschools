from django.urls import path, include
from rest_framework import routers

from apps.smart_things_apps.views import RefreshSmartThingsTokensViewSet

router = routers.DefaultRouter()
router.register('', RefreshSmartThingsTokensViewSet, 'refresh-smart-things-token')

urlpatterns = [
    path('', include(router.urls))
]
