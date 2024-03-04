from django.urls import path, include
from rest_framework import routers

from apps.schools_metrics.views import SchoolsMetricsViewSet

router = routers.DefaultRouter()
router.register('', SchoolsMetricsViewSet, 'schools-metrics')

urlpatterns = [
    path('', include(router.urls))
]
