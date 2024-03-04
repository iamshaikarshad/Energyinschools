from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers

from apps.microbit_variables.models import MicrobitVariable
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class MicrobitVariableSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):

    class Meta:
        model = MicrobitVariable
        fields = get_serializer_fields(
            MicrobitVariable.key,
            MicrobitVariable.value,
            MicrobitVariable.shared_with,
            MicrobitVariable.updated_at,
            add_id=False
        )

        extra_kwargs = get_serializer_kwargs({
            MicrobitVariable.key: {'required': False}
        })
