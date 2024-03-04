from django.urls import include, path
from rest_framework import routers

from apps.forum.views.comments import CommentsViewSet
from apps.forum.views.topics import TopicsViewSet


router = routers.DefaultRouter()
router.register('topics', TopicsViewSet, 'locations')
router.register('comments', CommentsViewSet, 'comments')

urlpatterns = [
    path('', include(router.urls))
]
