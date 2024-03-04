from http import HTTPStatus

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import get_template
from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.accounts.models import User
from apps.accounts.permissions import GROUP_NAME_TO_PERMISSION, RoleName
from apps.accounts.serializers import ResetPasswordRequestSerializer, ResetPasswordSerializer, \
    UserChangePasswordSerializer, UserSerializer
from apps.accounts.tools import ResetPasswordToken
from apps.blacklisted_emails.tools import AddEmailToBlackListToken


class UserViewSet(mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.ListModelMixin,
                  GenericViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        user: User = self.request.user

        if isinstance(self.request.user, AnonymousUser):
            return User.objects.none()

        elif self.request.method == 'GET':
            return User.objects.in_location(user.location)

        else:
            managed_groups = [
                group_name for group_name in RoleName.get_managed_by_sle_admin()
                if user.has_perm(GROUP_NAME_TO_PERMISSION[group_name])
            ]
            return User.objects \
                .filter(Q(id=user.id) | Q(groups__name__in=managed_groups) & Q(location=user.location)) \
                .all()

    def check_permissions(self, request: Request):
        if self.action == 'change_password':
            permission = IsAuthenticated()
            if not permission.has_permission(request, self):
                self.permission_denied(request, message=getattr(permission, 'message', None))

            if not request.user.has_perm('accounts.change_user'):
                self.permission_denied(request)

        else:
            super().check_permissions(request)

    @swagger_auto_schema(method='post',
                         request_body=UserChangePasswordSerializer,
                         responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase})
    @action(methods=['post'], detail=True, url_path='change-password')
    def change_password(self, request, *args, **kwargs):
        user: User = self.get_object()
        serializer = UserChangePasswordSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data['password'])
        user.save()

        return Response()

    @swagger_auto_schema(method='post',
                         request_body=ResetPasswordRequestSerializer,
                         responses={
                             HTTPStatus.OK.value: HTTPStatus.OK.phrase,
                             HTTPStatus.BAD_REQUEST.value: HTTPStatus.BAD_REQUEST.phrase,
                         })
    @action(methods=['post'], detail=False, url_path='reset-password', permission_classes=(AllowAny,))
    def obtain_reset_password_link(self, request, *args, **kwargs):
        serializer = ResetPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        username = serializer.validated_data.get('username', None)

        if username:
            # assume only one user has this email
            user = User.objects.filter(username=username).first()
        else:
            # same with username
            user = User.objects.filter(email=email).first()

        if not user:
            raise ValidationError({'message': "There is no user associated with this e-mail address or username"})

        token = ResetPasswordToken(
            password_version=int(str(user.password_version)),
            user_id=int(str(user.id))
        )

        html_content = get_template('accounts/reset-password-link-email.html').render({
            'unsubscribe_link': AddEmailToBlackListToken(email=email).get_unsubscribe_email_link(),
            'reset_password_link': token.get_reset_password_email_link()
        })

        message = EmailMultiAlternatives(subject='Password reset',
                                         from_email=settings.NOTIFICATION_SENDING_EMAIL,
                                         to=[email])
        message.attach_alternative(html_content, "text/html")
        message.send()

        return Response()

    @swagger_auto_schema(method='post',
                         request_body=ResetPasswordSerializer,
                         responses={
                             HTTPStatus.OK.value: HTTPStatus.OK.phrase,
                         })
    @action(methods=['post'], detail=False, url_path='reset-password/confirm', permission_classes=(AllowAny,))
    def reset_password(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password = serializer.validated_data['password']
        user = serializer.validated_data['user']
        user.set_password(password)
        user.password_version += 1
        user.save()
        return Response()
