from apps.resources.types import ButtonState, ContactState, MotionState, SwitchState
from apps.smart_things_devices.types import Capability
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework import serializers

CAPABILITY_TO_FIELD_TYPE_MAP = {
    Capability.SWITCH: EnumField(SwitchState, required=True),
    Capability.MOTION_SENSOR: EnumField(MotionState, required=True),
    Capability.CONTACT_SENSOR: EnumField(ContactState, required=True),
    Capability.BUTTON: EnumField(ButtonState, required=True),
    Capability.COLOR_TEMPERATURE: serializers.IntegerField(min_value=1, max_value=10, required=True),
    Capability.COLOR_CONTROL: serializers.IntegerField(min_value=0, max_value=7, required=True),
    Capability.SWITCH_LEVEL: serializers.IntegerField(min_value=0, max_value=100, required=True),
    Capability.TEMPERATURE: serializers.FloatField(required=True),
}


class ValueSerializer(EnumSupportSerializerMixin, serializers.Serializer):
    time = serializers.DateTimeField(read_only=True)
    value = serializers.CharField(required=True)

    @property
    def fields(self):
        capability = self.context.get('capability')
        if not capability:
            return super().fields  # used for swagger generator only

        try:
            value_field = CAPABILITY_TO_FIELD_TYPE_MAP[capability]
        except KeyError:
            return super().fields

        if not value_field.field_name:
            value_field.bind('value', None)

        return {
            **super().fields,
            'value': value_field
        }

    def validate(self, attrs):
        capability = self.context.get('capability')
        if capability not in CAPABILITY_TO_FIELD_TYPE_MAP:
            raise serializers.ValidationError('The capability is not acceptable!')

        return super().validate(attrs)

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass
