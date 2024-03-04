from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField

from apps.facts.models import Fact
from apps.themes.models import Theme
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class FactSerializer(serializers.ModelSerializer):
    theme = PrimaryKeyRelatedField(queryset=Theme.objects.all())

    class Meta:
        model = Fact
        fields = get_serializer_fields(
            Fact.text,
            'location',
            'theme'
        )

        extra_kwargs = get_serializer_kwargs({
            'location': {'read_only': True},
        })
