from rest_framework import serializers


class NewsSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=511)
    description = serializers.CharField(max_length=4000)
    url_to_image = serializers.URLField(required=False, allow_null=True)
    published_at = serializers.DateTimeField()
    author = serializers.CharField(max_length=255, allow_null=True)


class QueryParams(serializers.Serializer):
    limit = serializers.IntegerField(min_value=1, max_value=30, default=30)
