from datetime import datetime, timezone
from http import HTTPStatus

from apps.smart_things_devices.exceptions import CapabilitiesMismatchException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.hubs.authentication import RaspberryPiAuthentication
from apps.locations.decorators import own_location_only
from apps.microbit_devices.serializers import ValueSerializer
from apps.smart_things_apps.types import BadRequest, ValidationError
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.types import Capability


class MicrobitDevicesView(GenericViewSet):
    lookup_field = 'label'
    lookup_url_kwarg = 'device_label'
    permission_classes = IsAuthenticated,
    authentication_classes = RaspberryPiAuthentication,
    serializer_class = ValueSerializer

    @own_location_only
    def get_queryset(self):
        return SmartThingsDevice.objects.filter(is_connected=True).all()

    def get_serializer_context(self):
        return {'capability': self.kwargs.get('capability')}

    def post_command(self, request: Request, capability: Capability, *_, **__):
        device: SmartThingsDevice = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(True)
        try:
            device.execute_command(capability, serializer.validated_data['value'])
            return Response(HTTPStatus.OK.phrase, status=HTTPStatus.OK.value)
        except (ValidationError, BadRequest) as error:
            return Response(str(error), status=HTTPStatus.BAD_REQUEST)
        except CapabilitiesMismatchException as capabilities_mismatch_error:
            return Response(str(capabilities_mismatch_error), status=HTTPStatus.BAD_REQUEST)

    def retrieve_state(self, request: Request, capability: Capability, *_, **__):
        device: SmartThingsDevice = self.get_object()

        try:
            state = device.get_latest_state(capability)
        except (ValidationError, BadRequest) as error:
            return Response(str(error), status=HTTPStatus.BAD_REQUEST)
        except CapabilitiesMismatchException as capabilities_mismatch_error:
            return Response(str(capabilities_mismatch_error), status=HTTPStatus.BAD_REQUEST)

        if state:
            data = dict(
                time=state.time,
                value=state.state,
            )
        else:
            data = dict(
                time=datetime.now(tz=timezone.utc),
                value=device.fetch_state(capability)
            )

        return Response(data=self.get_serializer(data).data)
