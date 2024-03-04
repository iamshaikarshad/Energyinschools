from django.forms import ChoiceField
from enumfields.drf import EnumSupportSerializerMixin
from enumfields.drf.fields import EnumField as EnumSerializerField
from enumfields.fields import EnumFieldMixin
from rest_framework import serializers
from rest_framework.fields import CharField, ChoiceField

from apps.historical_data.serializers import HistoricalDataQuerySerializerSet
from apps.locations.serializer_fileds import OwnSubLocationField, InOwnLocationPrimaryKeyRelatedField
from apps.smart_things_devices.serializers import SmartThingsDevicesSerializer
from apps.smart_things_sensors.models import SmartThingsSensor, SmartThingsEnergyMeter
from utilities.serializer_helpers import get_serializer_fields
from apps.energy_providers.models import EnergyProviderAccount


class SmartThingsSensorSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    device = SmartThingsDevicesSerializer(read_only=True)
    sub_location_id = OwnSubLocationField(source='sub_location')

    class Meta:
        model = SmartThingsSensor
        fields = get_serializer_fields(
            'device',
            SmartThingsSensor.device,
            SmartThingsSensor.sub_location,
            SmartThingsSensor.name,
            SmartThingsSensor.description,
            SmartThingsSensor.capability,
        )

    # todo: it is temporal fix for not editable enum! waiting for PR: https://github.com/hzdg/django-enumfields/pull/90
    def build_standard_field(self, field_name, model_field):
        field_class, field_kwargs = (
            super().build_standard_field(field_name, model_field)
        )
        if field_class in (ChoiceField, CharField) and isinstance(model_field, EnumFieldMixin):
            field_class = EnumSerializerField
            field_kwargs['enum'] = model_field.enum
            field_kwargs.update(self.enumfield_options)
        return field_class, field_kwargs


class SmartThingsEnergyMeterSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    provider_account = InOwnLocationPrimaryKeyRelatedField(queryset=EnergyProviderAccount.objects.all(), required=False)
    sub_location_id = OwnSubLocationField(source='sub_location')

    class Meta:
        model = SmartThingsEnergyMeter
        fields = get_serializer_fields(
            SmartThingsEnergyMeter.type,
            'sub_location_id',
            'provider_account',
            SmartThingsEnergyMeter.name,
            SmartThingsEnergyMeter.description,
        )


serializer_set = HistoricalDataQuerySerializerSet(
    'SmartThingsSensor',
)
