from django.urls import path, include
from rest_framework import routers

from apps.accounts.views import UserViewSet

router = routers.DefaultRouter()
router.register('', UserViewSet, 'users')

urlpatterns = [
    path('', include(router.urls))
]
