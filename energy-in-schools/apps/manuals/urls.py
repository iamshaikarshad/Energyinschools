from django.urls import include, path
from rest_framework import routers

from apps.manuals.views import CategoryViewSet, ManualViewSet

router = routers.DefaultRouter()
router.register('categories', CategoryViewSet, 'category-view-set')
router.register('', ManualViewSet, 'manual-view-set')

urlpatterns = [
    path('', include(router.urls)),
]
