from django.urls import path, include
from rest_framework import routers

from apps.news.views import NewsViewSet

router = routers.DefaultRouter()
router.register('', NewsViewSet, 'news')

urlpatterns = [
    path('', include(router.urls))
]
