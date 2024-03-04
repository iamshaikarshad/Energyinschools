from django.urls import path, include
from rest_framework import routers

from apps.notifications.views import (
    NotificationTriggerViewSet, NotificationTargetViewSet,
    NotificationEventLogViewSet
)

triggers_router = routers.DefaultRouter()
triggers_router.register('', NotificationTriggerViewSet, 'notification_trigger')

targets_router = routers.DefaultRouter()
targets_router.register('', NotificationTargetViewSet, 'notification_target')

urlpatterns = [
    path('triggers/', include(triggers_router.urls)),
    path('targets/', include(targets_router.urls)),
    path('event-logs/', NotificationEventLogViewSet.as_view(actions={
        'get': 'list',
        'delete': 'remove_all'
    })),
]
