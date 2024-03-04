from django.urls import include, path
from rest_framework import routers

from apps.weather.views.weather import WeatherViewSet, OpenWeatherViewSet
from apps.weather.views.weather_history import WeatherHistoryViewSet


weather_router = routers.DefaultRouter()
weather_router.register('', WeatherViewSet, 'weather')
weather_router.register('', OpenWeatherViewSet, '')

weather_history_router = routers.DefaultRouter()
weather_history_router.register('', WeatherHistoryViewSet, 'weather_history')

urlpatterns = [
    path('', include(weather_router.urls)),
    path('historical/', include(weather_history_router.urls))
]
