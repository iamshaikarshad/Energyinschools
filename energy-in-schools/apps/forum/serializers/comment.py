from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers

from apps.forum.models.comment import Comment
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class CommentSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Comment

        fields = get_serializer_fields(
            Comment.content,
            Comment.created_at,
            Comment.is_admin,
            'author',
            'topic',
            add_id=True,
        )

        extra_kwargs = get_serializer_kwargs({
            Comment.is_admin: {'read_only': True},
        })
