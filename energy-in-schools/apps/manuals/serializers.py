from rest_framework import serializers

from apps.manuals.models import Category, Manual, ManualMediaFile
from samsung_school.settings.base import AZURE_MEDIA_URL
from utilities.serializer_helpers import get_serializer_fields
from utilities.private_files_utils import get_azure_path


class ManualMediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualMediaFile
        fields = get_serializer_fields(
            model.media_file,
            'manual_id',
            model.type,
        )


class AttachmentsSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = ManualMediaFile
        fields = (
            'url',
            'file_name',
        )

    @staticmethod
    def get_file_name(obj):
        return obj.media_file.split('/')[-1]

    @staticmethod
    def get_url(obj):
        return get_azure_path(obj.media_file)


class ManualSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source="category.title", read_only=True)
    attachments = AttachmentsSerializer(many=True, read_only=True)
    body = serializers.SerializerMethodField()
    avatar_image = serializers.SerializerMethodField()
    avatar_video = serializers.SerializerMethodField()

    def get_body(self, obj):
        return obj.body.replace('{AZURE_MEDIA_URL}', AZURE_MEDIA_URL)

    def get_avatar_image(self, obj):
        return get_azure_path(obj.avatar_image)

    def get_avatar_video(self, obj):
        return get_azure_path(obj.avatar_video)

    class Meta:
        model = Manual
        fields = get_serializer_fields(
            model.title,
            model.slug,
            model.avatar_image,
            model.avatar_video,
            model.body,
            'category_title',
            'attachments',
        )


class CategorySerializer(serializers.ModelSerializer):
    manuals = ManualSerializer(many=True)

    class Meta:
        model = Category
        fields = get_serializer_fields(
            model.title,
            'manuals'
        )
