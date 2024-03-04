from django.urls import path, include
from rest_framework import routers

from apps.facts.views import FactViewSet

router = routers.DefaultRouter()
router.register('', FactViewSet, 'facts')

urlpatterns = [
    path('', include(router.urls))
]
