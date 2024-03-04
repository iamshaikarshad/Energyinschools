from http import HTTPStatus

from django.http import HttpResponse
from drf_yasg.utils import swagger_auto_schema
from microbit_bridge.inject import inject_ids
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework import viewsets

from apps.hubs.models import Hub
from apps.hubs.serializers import RaspberrySerializer, MicrobitFirmwareQueryParamSerializer
from apps.locations.decorators import own_location_only
from apps.main.view_mixins import SoftDeleteCreateModelViewSetMixin
from rest_framework.permissions import AllowAny

from samsung_school.settings.base import PROJECT_ROOT
from utilities.mixins import DeserializeQueryParamsMixin


class RaspberryViewSet(SoftDeleteCreateModelViewSetMixin, DeserializeQueryParamsMixin, viewsets.ModelViewSet):
    serializer_class = RaspberrySerializer
    query_serializer_class = MicrobitFirmwareQueryParamSerializer
    permission_classes = [AllowAny]

    @own_location_only
    def get_queryset(self):
        return Hub.objects.all()

    def get_unique_together_fields(self):
        return (
            'uid',
        )

    @swagger_auto_schema(
        method='get',
        query_serializer=MicrobitFirmwareQueryParamSerializer,
        responses={HTTPStatus.OK.value: 'File'},
    )
    @action(methods=['get'], detail=False, url_path='microbit-firmware')
    def microbit_firmware(self, *_, **__):
        if 'uid' not in self.query_params_dict:
            if 'microbit_version' in self.query_params_dict and (
                        self.query_params_dict['microbit_version'] == 'v1'
                    ):
                firmware = open(f'{PROJECT_ROOT}/webhub-hex-files/microbit-webhub.hex', 'rb')
            else:
                firmware = open(f'{PROJECT_ROOT}/webhub-hex-files/microbit-webhub-v2.hex', 'rb')

            response = HttpResponse(content_type='application/octet-stream')
            response['Content-Disposition'] = 'attachment; filename="microbit-webhub.hex"'
            response.write(firmware.read())
            return response

        hub: Hub = get_object_or_404(self.get_queryset(), **self.query_params_dict)
        school_id, hub_id = hub.sub_location.school.uid, hub.uid

        firmware = inject_ids(school_id, hub_id)

        response = HttpResponse(content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="hub[{school_id}_{hub_id}].hex"'
        response.write(firmware)
        return response
