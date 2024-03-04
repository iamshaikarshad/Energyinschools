import logging
from http import HTTPStatus
from typing import List, Dict, Any

from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.decorators import postcode_view_decorator
from apps.mug_service.serializers import PostcodeSerializer, MUGPostcodeRequestAddressSerializer,\
    MUGPostcodeRequestMetersSerializer, MUGPostcodeRequestAddressWithMetersSerializer
from apps.mug_service.internal_types import MUGPostcodeMeters, MUGAddress


logger = logging.getLogger(__name__)


class MugPostcodeViewSet(GenericViewSet):
    permission_classes = (AllowAny, )

    @classmethod
    def get_response_by_postcode(cls, request: Request):
        postcode_serializer: PostcodeSerializer = PostcodeSerializer(data=request.data)
        postcode_serializer.is_valid(raise_exception=True)  # not make call if bad body
        return MUGApiClient.request_by_postcode(postcode_serializer.data['post_code'])

    @postcode_view_decorator(serializer=MUGPostcodeRequestMetersSerializer,
                             url_path='address/meter-ids')
    def get_meter_ids(self, request, *args, **kwargs):
        mug_response = self.get_response_by_postcode(request)
        meters: Dict[str, List[str]] = MUGPostcodeMeters.from_mug_api_response(mug_response)._asdict()
        serializer: MUGPostcodeRequestMetersSerializer = MUGPostcodeRequestMetersSerializer(data=meters)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=HTTPStatus.OK)

    @postcode_view_decorator(serializer=MUGPostcodeRequestAddressSerializer,
                             url_path='address')
    def get_address(self, request, *args, **kwargs):
        mug_response = self.get_response_by_postcode(request)
        address: List[Dict[str, str]] = [
            MUGAddress.from_mug_api_response(address)._asdict() for address in mug_response
        ]
        serializer: MUGPostcodeRequestAddressSerializer = MUGPostcodeRequestAddressSerializer(data=address, many=True)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=HTTPStatus.OK)

    @postcode_view_decorator(serializer=MUGPostcodeRequestAddressWithMetersSerializer,
                             url_path='address/meters')
    def get_address_with_meters(self, request, *args, **kwargs):
        mug_response = self.get_response_by_postcode(request)
        address: List[Dict[str, Any]] = [
            MUGAddress.from_mug_api_response(address, include_meters=True)._asdict() for address in mug_response
        ]
        serializer: MUGPostcodeRequestAddressWithMetersSerializer = MUGPostcodeRequestAddressWithMetersSerializer(
            data=address, many=True)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=HTTPStatus.OK)
