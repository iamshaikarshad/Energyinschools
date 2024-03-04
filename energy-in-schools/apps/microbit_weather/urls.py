from django.urls import include, path
from rest_framework import routers

from apps.microbit_weather.views import MicrobitWeatherViewSet


router = routers.DefaultRouter()
router.register('', MicrobitWeatherViewSet, 'microbit_weather_view_set')

urlpatterns = [
    path('', include(router.urls)),
]
