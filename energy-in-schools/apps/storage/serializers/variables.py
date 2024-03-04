from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers

from apps.hubs.models import Hub
from apps.locations.serializer_fileds import InOwnLocationSlugRelatedField, OwnLocationField
from apps.microbit_variables.models import MicrobitVariable
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class StorageVariableSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    hub_uid = InOwnLocationSlugRelatedField(queryset=Hub.objects.all(), slug_field='uid', read_only=False,
                                            source='raspberry')  # todo why uid?
    location_id = OwnLocationField(read_only=False, source='location')

    class Meta:
        model = MicrobitVariable

        fields = get_serializer_fields(
            MicrobitVariable.key,
            MicrobitVariable.value,
            MicrobitVariable.shared_with,
            MicrobitVariable.updated_at,
            MicrobitVariable.location,
            'hub_uid',
        )
        extra_kwargs = get_serializer_kwargs({
            MicrobitVariable.key: {'required': True},
        })
