from typing import Any, Dict

from django.core.validators import MinLengthValidator
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.accounts.models import User
from apps.accounts.tools import ResetPasswordToken
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = get_serializer_fields(
            User.email,
            User.username,
            User.location,
            'role',
            User.last_login
        )

        extra_kwargs = get_serializer_kwargs({
            User.username: {'read_only': True},
            User.email: {'required': False},
            User.location: {'required': False, 'read_only': True},
            User.last_login: {'read_only': True},
        })


class UserChangePasswordSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(max_length=128, required=True)
    new_password = serializers.CharField(max_length=128, required=True)

    class Meta:
        model = User
        fields = (
            'current_password',
            'new_password'
        )

        extra_kwargs = get_serializer_kwargs({
            'new_password': {'validators': [MinLengthValidator(8)]}
        })

    def validate(self, attrs: Dict[str, Any]):
        current_password = attrs['current_password']
        new_password = attrs['new_password']

        user: User = self.instance
        if not user.check_password(current_password):
            raise ValidationError('Wrong password!')

        return {
            'password': new_password
        }


class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=128, required=True)
    confirm_password = serializers.CharField(max_length=128, required=True)
    token = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = (
            'password',
            'confirm_password',
            'token'
        )

        extra_kwargs = get_serializer_kwargs({
            'password': {'validators': [MinLengthValidator(8)]}
        })

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    def validate(self, attrs: Dict[str, Any]):
        token = attrs['token']
        password = attrs['password']
        confirm_password = attrs['confirm_password']

        if password != confirm_password:
            raise ValidationError('Passwords do not match')

        try:
            decoded_token = ResetPasswordToken.decode(token)
        except Exception as exception:  # a lot of possible errors
            raise ValidationError(f'Invalid token: {exception}')

        user: User = User.objects.filter(id=decoded_token.user_id).first()

        if decoded_token.password_version != user.password_version:
            raise ValidationError('Provided token has expired')

        return {
            'password': password,
            'user': user
        }


class ResetPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=False)

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass
