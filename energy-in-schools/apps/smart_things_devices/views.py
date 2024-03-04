from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.locations.decorators import own_location_only
from apps.smart_things_apps.types import AuthCredentialsError
from apps.smart_things_devices.exceptions import BadCredential
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.serializers import SmartThingsDevicesSerializer


class SmartDevicesView(mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    serializer_class = SmartThingsDevicesSerializer

    @own_location_only
    def get_queryset(self):
        return SmartThingsDevice.objects.order_by('-is_connected', 'created_at').all()

    @action(detail=False)
    def refresh(self, *_, **__):
        try:
            SmartThingsDevice.refresh_devices(self.request.user.location)
        except AuthCredentialsError:
            raise BadCredential

        return Response()
