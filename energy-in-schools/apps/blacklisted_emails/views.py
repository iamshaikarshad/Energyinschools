from rest_framework import mixins
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import GenericViewSet

from apps.blacklisted_emails.serializers import BlacklistedEmailSerializer


class BlacklistedEmailsViewSet(mixins.CreateModelMixin,
                               GenericViewSet):
    permission_classes = (AllowAny,)
    serializer_class = BlacklistedEmailSerializer
