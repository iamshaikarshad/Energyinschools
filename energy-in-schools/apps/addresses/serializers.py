from rest_framework import serializers

from apps.addresses.models import Address
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = get_serializer_fields(
            model.line_1,
            model.line_2,
            model.city,
            model.post_code,
            model.latitude,
            model.longitude,
        )
        extra_kwargs = get_serializer_kwargs({
            model.line_2: {'allow_blank': True},
            model.latitude: {'required': False},
            model.longitude: {'required': False},
        })
