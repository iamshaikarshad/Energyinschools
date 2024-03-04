from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from apps.hubs.models import Hub
from apps.locations.serializer_fileds import OwnSubLocationField
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class MicrobitFirmwareQueryParamSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    uid = serializers.CharField(min_length=5, max_length=5, required=False)
    microbit_version = serializers.CharField(min_length=2, max_length=2, required=False)

class RaspberrySerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    # todo: why location uid instead of id?
    sub_location_id = OwnSubLocationField(source='sub_location')

    class Meta:
        model = Hub
        fields = get_serializer_fields(
            Hub.name,
            Hub.description,
            Hub.uid,
            Hub.sub_location,
            Hub.type,
            'created_at'
        )

        extra_kwargs = get_serializer_kwargs({
            Hub.uid: {'min_length': 5},
        })

        validators = [
            UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=('name', 'sub_location')
            ),
        ]
