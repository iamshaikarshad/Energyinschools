from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.historical_data.serializers import HistoricalDataQuerySerializerSet, ResourceHistoryValueSerializer
from apps.resources.models import Resource
from apps.resources.types import ResourceChildType
from utilities.serializer_helpers import get_serializer_fields


NestedFieldsMixin = type('NestedFieldsMixin', (serializers.Serializer,), {
    resource_child_type.value: resource_child_type.serializer(read_only=True, required=False)
    for resource_child_type in ResourceChildType
})


class ResourceSerializer(EnumSupportSerializerMixin, NestedFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Resource

        fields = get_serializer_fields(
            Resource.name,
            Resource.description,
            Resource.sub_location,
            Resource.child_type,
            Resource.unit,
            *(resource_child_type.value for resource_child_type in ResourceChildType)
        )


class AddMissedResourceHistorySerializer(ResourceHistoryValueSerializer):
    def validate(self, attrs):
        expected_unit = self.context['view'].get_object().unit
        given_unit = attrs['unit']
        if given_unit != expected_unit:
            raise ValidationError(
                f'Wrong unit: "{expected_unit.value}" was expected but "{given_unit.value}" was given!'
            )

        return attrs


serializer_set = HistoricalDataQuerySerializerSet('Resource')
