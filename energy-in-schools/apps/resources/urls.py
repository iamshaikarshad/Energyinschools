from django.urls import include, path
from rest_framework import routers

from apps.resources.views import AddMissedValuesApiView, ResourceViewSet


router = routers.DefaultRouter()
router.register('', ResourceViewSet, 'resource-view-set')

urlpatterns = [
    path('', include(router.urls)),
    path('<pk>/data/batch/', AddMissedValuesApiView.as_view(actions={'post': 'create'})),
]
