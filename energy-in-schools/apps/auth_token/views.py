from http import HTTPStatus

from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.auth_token.serializers import AuthTokenObtainPairSerializer, DashboardAuthTokenObtainPairSerializer, \
    ObtainedTokensSerializer, MUGAuthTokenObtainPairSerializer, AccessTokenSerializer, AuthTokenRefreshSerializer


@method_decorator(name='post', decorator=swagger_auto_schema(
    responses={HTTPStatus.OK.value: ObtainedTokensSerializer()}
))
class AuthTokenObtainPairView(TokenObtainPairView):
    serializer_class = AuthTokenObtainPairSerializer


@method_decorator(name='post', decorator=swagger_auto_schema(
    responses={HTTPStatus.OK.value: ObtainedTokensSerializer()}
))
class DashboardTokenObtainPairView(TokenObtainPairView):
    serializer_class = DashboardAuthTokenObtainPairSerializer


@method_decorator(name='post', decorator=swagger_auto_schema(
    responses={HTTPStatus.OK.value: ObtainedTokensSerializer()}
))
class MUGAuthTokenObtainPairView(TokenObtainPairView):
    serializer_class = MUGAuthTokenObtainPairSerializer


@method_decorator(name='post', decorator=swagger_auto_schema(
    responses={HTTPStatus.OK.value: AccessTokenSerializer()}
))
class AuthTokenRefreshView(TokenRefreshView):
    serializer_class = AuthTokenRefreshSerializer
