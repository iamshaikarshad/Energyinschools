from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from rest_framework.viewsets import ModelViewSet

from apps.microbit_variables.models import MicrobitVariable
from apps.storage.serializers.variables import StorageVariableSerializer


class StorageVariablesViewSet(ModelViewSet):
    lookup_field = 'key'
    serializer_class = StorageVariableSerializer

    def get_queryset(self):
        if isinstance(self.request.user, AnonymousUser):
            return MicrobitVariable.objects.none()

        if self.request.query_params.get('own_location_only', '').lower() == 'true':
            return MicrobitVariable.objects.in_location(self.request.user.location).order_by('-updated_at')
        else:
            return MicrobitVariable.objects.filter(
                Q(location=self.request.user.location) |
                Q(shared_with=MicrobitVariable.ShareType.ALL_SCHOOLS)
            ).order_by('-updated_at')
