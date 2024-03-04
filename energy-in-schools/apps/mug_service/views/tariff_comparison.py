import logging
from http import HTTPStatus
from typing import TYPE_CHECKING

from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.view_permissions import SEMAdminPermission
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.decorators import mug_client_error_handler__view
from apps.mug_service.exceptions import MUGEmptyData
from apps.mug_service.constants import METER_TYPE__MUG_METER_TYPE__MAP
from apps.mug_service.models import Customer, Site, Meter
from apps.mug_service.serializers import EnergyMeterBillingInfoIdSerializer, MUGResultSerializer
from apps.registration_requests.models import RegistrationRequest

if TYPE_CHECKING:
    from rest_framework.request import Request
    from apps.mug_service.constants import MUGMeterType


logger = logging.getLogger(__name__)


@swagger_auto_schema(method='get',
                     query_serializer=EnergyMeterBillingInfoIdSerializer,
                     responses={
                         HTTPStatus.OK.value: MUGResultSerializer(many=True),
                         HTTPStatus.NO_CONTENT.value: HTTPStatus.NO_CONTENT.phrase,
                     })
@api_view(['GET'])
@permission_classes((IsAuthenticated, SEMAdminPermission))
@mug_client_error_handler__view
def comparison(request: 'Request'):
    try:
        request_serializer = EnergyMeterBillingInfoIdSerializer(data=request.query_params, context={'request': request})
        request_serializer.is_valid(raise_exception=True)
        mug_customer: Customer = request.user.location.mug_customer
        mug_site: Site = request.user.location.mug_site
        mug_meter: Meter = request_serializer.validated_data['energy_meter_billing_info'].mug_meter
        meter_type: MUGMeterType = METER_TYPE__MUG_METER_TYPE__MAP[mug_meter.energy_meter_billing_info.fuel_type]
        quotes = MUGApiClient.request_comparison(customer_id=mug_customer.mug_customer_id,
                                                 site_id=mug_site.mug_site_id,
                                                 meter_id=mug_meter.mug_meter_id,
                                                 meter_type=meter_type)

        comparison_serializer = MUGResultSerializer(data=quotes, many=True)
        comparison_serializer.is_valid(raise_exception=True)
        return Response(comparison_serializer.validated_data, HTTPStatus.OK.value)

    except (RegistrationRequest.DoesNotExist, Customer.DoesNotExist, Site.DoesNotExist, Meter.DoesNotExist,
            MUGEmptyData) as err:
        logger.error(err)
        return Response(HTTPStatus.NO_CONTENT.phrase, HTTPStatus.NO_CONTENT.value)
