import re
from typing import Any, Dict

from django.core.validators import RegexValidator
from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.smart_things_devices.models import SmartThingsCapability, SmartThingsDevice
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class SmartThingsCapabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartThingsCapability
        fields = get_serializer_fields(
            SmartThingsCapability.capability
        )


class SmartThingsDevicesSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(read_only=True)
    # lowercase + number + minus only inside label
    label = serializers.CharField(
        validators=[RegexValidator(
            regex=re.compile(r'^[a-z\d][a-z\d-]*[a-z\d]$'),
            message='Only lower latin symbols, numbers and "-" inside the text can be used!',
        )],
        min_length=3,
        max_length=50
    )
    capabilities = SmartThingsCapabilitySerializer(read_only=True, many=True)

    class Meta:
        model = SmartThingsDevice
        fields = get_serializer_fields(
            SmartThingsDevice.name,
            SmartThingsDevice.label,
            SmartThingsDevice.room_name,
            SmartThingsDevice.smart_things_id,
            SmartThingsDevice.smart_things_location,
            SmartThingsDevice.is_connected,
            SmartThingsDevice.status,
            SmartThingsDevice.status_updated_at,
            SmartThingsDevice.battery_health,
            'location',
            'created_at',
            'capabilities'
        )

        extra_kwargs = get_serializer_kwargs({
            SmartThingsDevice.smart_things_id: {'read_only': True},
            SmartThingsDevice.smart_things_location: {'read_only': True},
            SmartThingsDevice.name: {'read_only': True},
            SmartThingsDevice.room_name: {'read_only': True},
            SmartThingsDevice.status: {'read_only': True},
            SmartThingsDevice.status_updated_at: {'read_only': True},
        })

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if 'label' in attrs:
            is_connected = attrs.get('is_connected')
            if not (is_connected if is_connected is not None else self.instance.is_connected):
                raise ValidationError('Can not change label of unconnected device!')

        return attrs
