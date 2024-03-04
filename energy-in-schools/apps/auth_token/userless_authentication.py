import functools
from datetime import timedelta
from functools import partial
from typing import Callable, NamedTuple, Type

import funcy
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken, Token
from sqlalchemy.util import classproperty


USERLESS_TOKEN_TYPE_KEY = 'userless_token_type'
USERLESS_TOKEN_LIFE_TIME = timedelta(days=365)


class UserlessJWTAuthentication(JWTAuthentication):
    def __init__(self, *, token_type: str, payload_class: Type[NamedTuple]):
        super().__init__()

        self.token_type = token_type
        self.payload_class = payload_class

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token: Token = self.get_validated_token(raw_token)
        if validated_token.get(USERLESS_TOKEN_TYPE_KEY) != self.token_type:
            return None

        try:
            # noinspection PyProtectedMember
            auth = self.payload_class(
                **funcy.project(validated_token.payload, self.payload_class._fields)
            )
        except TypeError:
            return None

        return AnonymousUser(), auth


class CustomUserlessJWTAuthentication:
    Payload: Type[NamedTuple] = None
    token_type: str = None

    queryset_filter_model_field: str = None  # used to filtrate queryset regarding to value in the payload
    queryset_filter_payload_field: str = None

    # noinspection PyMethodParameters
    @classproperty
    def authentication_class(cls) -> Callable[[], UserlessJWTAuthentication]:
        return partial(
            UserlessJWTAuthentication,
            token_type=cls.token_type,
            payload_class=cls.Payload,
        )

    @classmethod
    def obtain_token(cls, payload: Payload) -> AccessToken:
        token = AccessToken()
        token.set_exp(lifetime=USERLESS_TOKEN_LIFE_TIME)

        # noinspection PyProtectedMember
        token.payload.update(payload._asdict())
        token[USERLESS_TOKEN_TYPE_KEY] = cls.token_type

        return token

    @classmethod
    def filtrate_queryset(cls, get_queryset_method: Callable[[GenericAPIView], QuerySet]) \
            -> Callable[[GenericAPIView], QuerySet]:
        """
        Decorator that filtrate `get_queryset` method to only items that have the same value that in the token
        (see queryset_filter_model_field and queryset_filter_payload_field)
        """

        assert cls.queryset_filter_payload_field and cls.queryset_filter_model_field, \
            '"queryset_filter_payload_field" and "queryset_filter_model_field" should be populated!'

        # noinspection PyProtectedMember
        assert cls.queryset_filter_payload_field in cls.Payload._fields, \
            f'Payload should contain "{cls.queryset_filter_model_field}" field!'

        @functools.wraps(get_queryset_method)
        def wrapper(self: GenericAPIView) -> QuerySet:
            if isinstance(self.request.user, AnonymousUser) and self.request.auth:
                return get_queryset_method(self).filter(**{
                    cls.queryset_filter_model_field: getattr(self.request.auth, cls.queryset_filter_payload_field)
                })

            return get_queryset_method(self)

        return wrapper


class IsUserlessAuthentication(BasePermission):
    """
    Allows access only for user less authentication.
    """

    def has_permission(self, request: Request, view):
        return bool(request.auth) and isinstance(request.user, AnonymousUser)
