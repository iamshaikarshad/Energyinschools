from django.urls import include, path
from rest_framework import routers

from apps.microbit_historical_data.views import MicrobitHistoricalDataSetView


router = routers.DefaultRouter()
router.register('', MicrobitHistoricalDataSetView, 'microbit_historical_data_set_view')

urlpatterns = [
    path('', include(router.urls)),
]
