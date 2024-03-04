from http import HTTPStatus

from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.view_permissions import SEMAdminPermission
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.decorators import mug_client_error_handler
from apps.mug_service.serializers import SupplierSerializer


@swagger_auto_schema(method='get', responses={HTTPStatus.OK.value: SupplierSerializer})
@api_view(['GET'])
@permission_classes((IsAuthenticated, SEMAdminPermission | IsAdminUser))
@mug_client_error_handler(
    return_on_api_exception=Response(status=HTTPStatus.BAD_GATEWAY),
    return_on_disabled=Response([]),
)
def suppliers(_: Request):
    suppliers_data = MUGApiClient.request_suppliers()
    serializer = SupplierSerializer(data=suppliers_data, many=True)
    serializer.is_valid(raise_exception=True)
    return Response(serializer.validated_data)
