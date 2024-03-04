from requests import Request
from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet

from apps.forum.author_permissions import IsAuthorOrReadOnly
from apps.forum.models.comment import Comment
from apps.forum.serializers.comment import CommentSerializer


class CommentsViewSet(mixins.CreateModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      GenericViewSet):
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()

    def check_object_permissions(self, request: Request, obj: Comment):
        permission = IsAuthorOrReadOnly()
        if not permission.has_object_permission(request, self, obj):
            self.permission_denied(request, message="Only author can modify comment")
        else:
            super().check_permissions(request)

    def perform_create(self, serializer: CommentSerializer):
        serializer.save(is_admin=self.request.user.is_staff)
