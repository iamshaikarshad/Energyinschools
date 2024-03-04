from typing import Any, Dict

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.db.models.functions import Coalesce
from rest_framework import serializers
from rest_framework_simplejwt.serializers import PasswordField, TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from six import text_type

from apps.accounts.models import User
from apps.registration_requests.models import RegistrationRequest
from apps.resources.models import Resource
from apps.accounts.permissions import RoleName


class ObtainAuthTokenWithPayloadMixin:
    @classmethod
    def get_token(cls, user: User):
        """
        :param user:
            User instance for token payload
        :return:
            Token with location_uid and user role in payload
        """
        token: RefreshToken = RefreshToken.for_user(user)

        token['username'] = user.username
        token['role'] = user.role
        token['location_id'] = user.location_id

        cls.fill_trial_period_info(token, user)

        update_last_login(None, user)

        return token

    @classmethod
    def fill_trial_period_info(cls, token: RefreshToken, user: User):
        if user.is_staff:
            token['trial_ends_on'] = None
            token['registration_status'] = None
            return

        registration_request: RegistrationRequest = RegistrationRequest \
            .objects \
            .filter(registered_school_id=user.location_id) \
            .only('status', 'registered_school__created_at') \
            .select_related('registered_school') \
            .first()

        if not registration_request:
            token['trial_ends_on'] = None
            token['registration_status'] = RegistrationRequest.Status.ACTIVATION_ACCEPTED.value

        else:
            trial_periods_ends_on = registration_request.trial_periods_ends_on

            if trial_periods_ends_on:
                token['trial_ends_on'] = trial_periods_ends_on.isoformat()

            else:
                token['trial_ends_on'] = None

            token['registration_status'] = registration_request.status.value


# noinspection PyAbstractClass
class AuthTokenObtainPairSerializer(ObtainAuthTokenWithPayloadMixin, TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password'] = PasswordField(required=True)

    def validate(self, attrs):
        data = super(AuthTokenObtainPairSerializer, self).validate(attrs)

        if self.user.role == RoleName.MUG_USER:  # Don't allow to MUG user get a regular token
            raise serializers.ValidationError('No active account found with the given credentials')

        return data


# noinspection PyAbstractClass
class DashboardAuthTokenObtainPairSerializer(ObtainAuthTokenWithPayloadMixin, serializers.Serializer):
    """Special Token For Energy Dashboard"""
    location_auth_field = 'location_uid'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields[self.location_auth_field] = serializers.CharField()

    def validate(self, attrs: Dict) -> Dict[str, Any]:
        """
        Validate correct passed location UID
        :param attrs:
            Key location_uid Auth Field for Dashboard
        :return:
            Data Access Token And Refresh Token
        """

        data = {}

        # Waiting Custom Auth Check Located at ./auth_token/auth_backends.py
        user: User = authenticate(attrs.get(self.location_auth_field))

        if user is None or not user.is_active:
            raise serializers.ValidationError(
                'No active account found with the given credentials',
            )

        # getting token from user

        refresh = self.get_token(user)
        self.fill_location_available_energy_types(refresh, user)

        data['refresh'] = text_type(refresh)
        data['access'] = text_type(refresh.access_token)

        return data

    @staticmethod
    def fill_location_available_energy_types(token: RefreshToken, user: User):
        energy_types = Resource.get_location_energy_meters(user.location) \
            .annotate(
            energy_type=Coalesce('energy_meter__type', 'smart_things_sensor__smart_things_energy_meter__type')) \
            .values_list('energy_type', flat=True) \
            .order_by('energy_type') \
            .distinct()

        token['energy_types'] = [energy_type.value for energy_type in energy_types]


# noinspection PyAbstractClass
class MUGAuthTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        refresh: RefreshToken = super(MUGAuthTokenObtainPairSerializer, cls).get_token(user)
        refresh['role'] = user.role
        return refresh

    """Special token for MUG user"""
    def validate(self, attrs):
        data = super(MUGAuthTokenObtainPairSerializer, self).validate(attrs)

        if self.user.role != RoleName.MUG_USER:
            raise serializers.ValidationError('No active account found with the given credentials')

        refresh: RefreshToken = self.get_token(self.user)
        refresh.set_exp(lifetime=settings.MUG_REFRESH_TOKEN_LIFETIME)
        data['refresh'] = text_type(refresh)

        access_token = refresh.access_token
        access_token.set_exp(lifetime=settings.MUG_ACCESS_TOKEN_LIFETIME)
        data['access'] = text_type(access_token)

        return data


# noinspection PyAbstractClass
class AuthTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super(AuthTokenRefreshSerializer, self).validate(attrs)
        access = AccessToken(data['access'])

        if access['role'] == RoleName.MUG_USER:
            access.set_exp(lifetime=settings.MUG_ACCESS_TOKEN_LIFETIME)
            data['access'] = text_type(access)
            if 'refresh' in data:  # case when ROTATE_REFRESH_TOKENS param is enabled
                refresh = RefreshToken(data['refresh'])
                refresh.set_exp(lifetime=settings.MUG_REFRESH_TOKEN_LIFETIME)
                data['refresh'] = text_type(refresh)

        return data


# noinspection PyAbstractClass
class ObtainedTokensSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()


# noinspection PyAbstractClass
class AccessTokenSerializer(serializers.Serializer):
    access = serializers.CharField()
