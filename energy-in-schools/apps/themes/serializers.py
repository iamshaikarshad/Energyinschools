from rest_framework import serializers

from apps.themes.models import Theme
from utilities.serializer_helpers import get_serializer_fields


class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = get_serializer_fields(
            Theme.name
        )
