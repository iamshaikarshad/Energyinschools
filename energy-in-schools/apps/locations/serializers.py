from typing import Any, Dict

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.addresses.models import Address
from apps.addresses.serializers import AddressSerializer
from apps.locations.models import Location
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class LocationSerializer(serializers.ModelSerializer):
    address = AddressSerializer()

    class Meta:
        model = Location
        fields = get_serializer_fields(
            model.name,
            model.description,
            model.uid,
            'address',
            model.created_at,
            model.parent_location,
            'is_sub_location',
            'current_theme'
        )
        extra_kwargs = get_serializer_kwargs({
            model.uid: {'read_only': True},
            model.parent_location: {'read_only': True},
            'is_sub_location': {'read_only': True}
        })

    def create(self, validated_data: Dict[str, Any]) -> Meta.model:
        instance = self.Meta.model.objects.create(
            address=Address.objects.create(**validated_data.pop('address')),
            **validated_data
        )

        return instance

    def update(self, instance: Location, validated_data: Dict[str, Any]):
        if not instance.is_sub_location:
            raise ValidationError('You can not change school!')

        if 'address' in validated_data:
            address_serializer = AddressSerializer(
                instance=instance.address,
                data=validated_data.pop('address'),
                partial=self.partial,
            )
            address_serializer.is_valid(raise_exception=True)
            address_serializer.save()
            instance.address = address_serializer.instance

        return super().update(instance, validated_data)


class LocationMoodSerializer(serializers.Serializer):
    electricity = serializers.IntegerField(min_value=1, max_value=5, required=False)
    gas = serializers.IntegerField(min_value=1, max_value=5, required=False)
    solar = serializers.IntegerField(min_value=0, max_value=5, required=False)


class LocationIdQueryParamSerializer(serializers.Serializer):
    location_id = serializers.IntegerField(min_value=0, required=False)


class LocationIdRequiredQueryParamSerializer(serializers.Serializer):
    location_id = serializers.IntegerField(min_value=0)

    def validate_location_id(self, location_id):
        location = Location.objects.filter(pk=location_id)

        if not location.exists():
            raise serializers.ValidationError('Not found')

        return location_id


class LocationUIDSerializer(serializers.Serializer):
    location_uid = serializers.CharField(required=False, allow_null=True)
