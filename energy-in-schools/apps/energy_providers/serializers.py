import json

from enumfields.drf import EnumSupportSerializerMixin
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import ProviderConfigContainer, ProviderValidateError
from apps.energy_providers.providers.dummy import DummyProviderConnection
from apps.locations.serializer_fileds import OwnLocationField
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class EnergyProviderSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):
    location_id = OwnLocationField(source='location', required=False)

    # todo use DictField for credentials
    class Meta:
        model = EnergyProviderAccount
        fields = get_serializer_fields(
            EnergyProviderAccount.provider,
            EnergyProviderAccount.location,
            EnergyProviderAccount.credentials,
            EnergyProviderAccount.name,
            EnergyProviderAccount.description,
        )

        extra_kwargs = get_serializer_kwargs({
            EnergyProviderAccount.credentials: {'write_only': True, 'read_only': False},
        })

    def to_internal_value(self, data):
        new_data = data.copy()
        new_data['credentials'] = json.dumps(data['credentials'])
        return super().to_internal_value(new_data)

    def validate(self, attrs):
        if 'credentials' in attrs or 'provider_account' in attrs:
            credentials = attrs.get('credentials') or self.instance.credentials
            provider = attrs.get('provider') or self.instance.provider
            provider_connection_class = EnergyProviderAccount.get_connection_class(provider)
            if provider_connection_class is DummyProviderConnection:
                raise ValidationError("Dummy provider is deprecated! Please remove it.")
            try:
                provider_connection = provider_connection_class(ProviderConfigContainer(credentials=credentials))
                provider_connection.validate()
            except (ProviderValidateError, json.decoder.JSONDecodeError) as error:
                raise ValidationError('Wrong provider_account credentials!') from error

        return attrs
