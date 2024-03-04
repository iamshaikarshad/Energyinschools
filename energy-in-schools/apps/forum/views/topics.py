from http import HTTPStatus

from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from secretballot.models import Vote

from apps.forum.author_permissions import IsAuthorOrReadOnly
from apps.forum.models.topic import Topic
from apps.forum.serializers.topic import TopicSerializer
from apps.locations.filtersets import OwnLocationOnlyFilterSet


class TopicsFilterSet(OwnLocationOnlyFilterSet):
    class Meta:
        model = Topic
        fields = ()


class TopicsViewSet(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    filterset_class = TopicsFilterSet

    def get_queryset(self):
        # ./manage.py migrate doesn't work when `queryset` field is populated. (don't know why)
        return Topic.objects.all()

    def check_object_permissions(self, request, obj: Topic):
        permission = IsAuthorOrReadOnly()
        if not permission.has_object_permission(request, self, obj):
            self.permission_denied(request, message="Only author can modify topic")
        else:
            super().check_permissions(request)

    def perform_create(self, serializer: TopicSerializer):
        serializer.save(location=self.request.user.location)

    @swagger_auto_schema(method='post',
                         responses={
                             HTTPStatus.OK.value: TopicSerializer,
                             HTTPStatus.BAD_REQUEST.value: HTTPStatus.BAD_REQUEST.phrase
                         })
    @action(methods=['post'], detail=True, url_path='upvote')
    def upvote(self, request, *args, **kwargs):
        topic: Topic = self.get_object()

        token = f'{request.secretballot_token}_{Topic._meta.db_table}'
        already_voted = Vote.objects.filter(token=token, vote=1, object_id=topic.id).count() != 0
        if already_voted:
            return Response(status=HTTPStatus.BAD_REQUEST, data="You have already voted")

        topic.add_vote(token, 1)
        topic_serializer = TopicSerializer(self.get_object())
        return Response(topic_serializer.data)
