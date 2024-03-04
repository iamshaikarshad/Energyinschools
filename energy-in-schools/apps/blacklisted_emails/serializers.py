from typing import Dict, Any

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueValidator

from apps.blacklisted_emails.models import BlacklistedEmail
from apps.blacklisted_emails.tools import AddEmailToBlackListToken
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class BlacklistedEmailSerializer(serializers.ModelSerializer):
    token = serializers.CharField(write_only=True)

    class Meta:
        model = BlacklistedEmail
        fields = get_serializer_fields(
            'token',
            BlacklistedEmail.email,
            add_id=False
        )

        extra_kwargs = get_serializer_kwargs({
            BlacklistedEmail.email: {'read_only': True},
        })

    def validate(self, attrs: Dict[str, Any]):
        try:
            email = AddEmailToBlackListToken.decode(attrs.pop('token')).email
        except Exception as exception:  # a lot of possible errors
            raise ValidationError(f'Invalid token: {exception}')

        validator = UniqueValidator(BlacklistedEmail.objects.all())
        validator.set_context(self.fields['email'])
        validator(email)

        return {
            'email': email
        }
