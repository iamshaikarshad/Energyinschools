from django.urls import path, include
from rest_framework import routers

from apps.storage.views.historical_data import HistoricalStorageDataViewSet
from apps.storage.views.historical_dataset import HistoricalStorageDataSetViewSet
from apps.storage.views.variables import StorageVariablesViewSet

router = routers.DefaultRouter()
router.register('historical', HistoricalStorageDataSetViewSet, 'storage_historical')
router.register('variables', StorageVariablesViewSet, 'storage_variables')

historical_data_router = routers.DefaultRouter()
historical_data_router.register('', HistoricalStorageDataViewSet, 'storage_historical_data')

urlpatterns = [
    path('', include(router.urls)),
    path('historical/<pk>/data/', include(historical_data_router.urls))
]
