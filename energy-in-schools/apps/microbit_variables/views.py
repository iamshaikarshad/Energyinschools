from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.exceptions import NotFound, PermissionDenied

from apps.hubs.authentication import RaspberryPiAuthentication
from apps.microbit_variables.models import MicrobitVariable
from apps.microbit_variables.serializers import MicrobitVariableSerializer


class MicrobitVariablesView(viewsets.ModelViewSet):
    authentication_classes = RaspberryPiAuthentication,
    serializer_class = MicrobitVariableSerializer

    def get_queryset(self):
        if isinstance(self.request.user, AnonymousUser):
            return MicrobitVariable.objects.none()

        return MicrobitVariable.objects.filter(
            Q(location=self.request.user.location) |
            Q(shared_with=MicrobitVariable.ShareType.ALL_SCHOOLS)
        )

    def get_serializer(self, *args, **kwargs):
        if self.request.method != 'GET':
            if kwargs.get('data'):
                data = kwargs.get('data', '').copy()
                data.update({'location': self.request.auth.location.uid,
                             'hub': self.request.auth.raspberry_hub.uid,
                             'key': self.key})
                return super().get_serializer(*args, data=data)
        return super().get_serializer(*args, **kwargs)

    def get_object(self):
        variable = MicrobitVariable.objects.filter(location__uid=self.from_school_uid,
                                                   key=self.key).last()
        if variable:
            if variable.shared_with == MicrobitVariable.ShareType.ALL_SCHOOLS:
                return variable
            elif self.from_school_uid == self.request.auth.location.uid:
                if (variable.shared_with == MicrobitVariable.ShareType.MY_SCHOOL or
                        variable.raspberry.uid == self.request.auth.raspberry_hub.uid):
                    return variable
        raise NotFound

    def create_or_update(self, request, *args, **kwargs):
        variable = MicrobitVariable.objects.filter(key=self.key,
                                                   location__uid=self.request.auth.location.uid).last()
        if variable:
            return self.update(request, *args, **kwargs)
        else:
            return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(
            location=self.request.auth.location,
            raspberry=self.request.auth.raspberry_hub,
        )

    def perform_update(self, serializer):
        self._check_action_permission(serializer.instance)
        serializer.save(
            location=self.request.auth.location,
            raspberry=self.request.auth.raspberry_hub,
        )

    def perform_destroy(self, instance):
        self._check_action_permission(instance)
        instance.delete()

    def _check_action_permission(self, variable):
        if variable.location.uid != self.request.auth.location.uid:
            raise PermissionDenied
        elif variable.shared_with != MicrobitVariable.ShareType.MY_SCHOOL:
            if variable.raspberry.uid != self.request.auth.raspberry_hub.uid:
                raise PermissionDenied

    @property
    def from_school_uid(self):
        return self.kwargs.get('school_id', self.request.auth.location.uid)

    @property
    def key(self):
        return self.kwargs.get('key')
