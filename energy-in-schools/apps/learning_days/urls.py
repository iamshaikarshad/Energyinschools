from django.urls import path, include
from rest_framework import routers

from apps.learning_days.views import LearningDayViewSet


router = routers.DefaultRouter()
router.register('', LearningDayViewSet, 'learning_day')

urlpatterns = [
    path('', include(router.urls))
]
