from django.urls import path, include
from rest_framework import routers

from apps.themes.views import ThemeViewSet

router = routers.DefaultRouter()
router.register('', ThemeViewSet, 'themes')

urlpatterns = [
    path('', include(router.urls))
]
