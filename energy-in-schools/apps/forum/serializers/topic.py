from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from taggit_serializer.serializers import TagListSerializerField, TaggitSerializer

from apps.forum.models.topic import Topic
from apps.forum.serializers.comment import CommentSerializer
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


VALID_TOPIC_TAGS = ['schools_portal', 'problem', 'new_functionality', 'how_to', 'dashboard', 'bug', 'proposal', 'other']


class TopicSerializer(EnumSupportSerializerMixin, TaggitSerializer, serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    location = serializers.SlugRelatedField(slug_field='uid', read_only=True)
    tags = TagListSerializerField()

    class Meta:
        model = Topic

        fields = get_serializer_fields(
            Topic.content,
            Topic.type,
            Topic.created_at,
            Topic.updated_at,
            'location',
            'vote_total',
            'author',
            'tags',
            'comments',
            add_id=True,
        )

        extra_kwargs = get_serializer_kwargs({
            'vote_total': {'read_only': True},
        })

    def validate_tags(self, value):
        if not set(value) <= set(VALID_TOPIC_TAGS):
            message = f'Only {VALID_TOPIC_TAGS} tags are allowed'
            raise serializers.ValidationError(message)
        return value
