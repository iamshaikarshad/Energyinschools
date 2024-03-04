import logging
from http import HTTPStatus
from django.db.models import query

from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.accounts.view_permissions import MUGUserPermission
from apps.historical_data.utils.aggregation_params_manager import AggregationParamsManager
from apps.historical_data.utils.aggregations import aggregate_to_list
from apps.mug_service.models import Meter, Savings, Location
from apps.mug_service.serializers import HHDataRequestSerializer, HHDataSerializer, MUGMeterToFetchInfoSerializer,\
    MUGMeterRateTypeSerializer, MUGMeterToCreateSerializer, MUGSavingsSerializer, MUGCarbonIntensitySerializer, MUGSavingsRequestSerializer

from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.decorators import mug_client_error_handler__view
from apps.mug_service.exceptions import MUGBadRequest, MUGEmptyData, MUGBadRequestData
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.resources.models import Resource
from apps.resources.types import TimeResolution, Unit

logger = logging.getLogger(__name__)


class MUGMeterViewSet(GenericViewSet):  # Only MUG user (role=RoleName.MUG_USER) can access this endpoint
    permission_classes = (IsAuthenticated, MUGUserPermission)
    queryset = Meter.objects.all()
    lookup_field = 'meter_id'

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, mug_meter_id=self.kwargs['meter_id'])
        self.check_object_permissions(self.request, obj)
        return obj

    @swagger_auto_schema(method='get',
                         query_serializer=HHDataRequestSerializer,
                         responses={
                             HTTPStatus.OK.value: HHDataSerializer,
                             HTTPStatus.NO_CONTENT.value: HTTPStatus.NO_CONTENT.phrase,
                         },
                         operation_description="Only for MUG user")
    @action(methods=['get'], detail=True, url_path='hh-data')
    def hh_data(self, request: Request, *_, **__):
        meter: Meter = self.get_object()
        request_serializer = HHDataRequestSerializer(data=request.query_params)
        request_serializer.is_valid(raise_exception=True)

        resource: Resource = meter.energy_meter_billing_info.resource
        if not resource:
            logger.warning(f'MUG Meter is not connected to the resource (ID={meter.id})')
            return Response(HTTPStatus.NO_CONTENT.phrase, HTTPStatus.NO_CONTENT.value)

        data = list(aggregate_to_list(AggregationParamsManager().get_aggregation_rules(
            resources=[resource],
            unit=Unit.WATT,
            time_resolution=TimeResolution.HALF_HOUR,
            from_=request_serializer.validated_data['from_datetime'],
            to=request_serializer.validated_data['to_datetime'],
        )))

        if not data:
            return Response(HTTPStatus.NO_CONTENT.phrase, HTTPStatus.NO_CONTENT.value)

        result_serializer = HHDataSerializer(data={'unit': Unit.WATT, 'hh_data': [item._asdict() for item in data]})
        result_serializer.is_valid(raise_exception=True)
        return Response(result_serializer.data)

@swagger_auto_schema(method='post',
                     request_body=MUGMeterToCreateSerializer,
                     responses={
                         HTTPStatus.OK.value: HTTPStatus.OK.phrase,
                         HTTPStatus.BAD_REQUEST.value: HTTPStatus.BAD_REQUEST.phrase,
                         HTTPStatus.NOT_ACCEPTABLE.value: HTTPStatus.NOT_ACCEPTABLE.phrase,
                     })
@api_view(['POST'])
@permission_classes((IsAuthenticated,))
@mug_client_error_handler__view
def create_mug_meter(request, *_, **__):
    queryset = EnergyMeterBillingInfo.objects.all()
    if 'energy_meter_billing_info_id' not in request.data:
        return Response('"energy_meter_billing_info_id" field is missing', status=HTTPStatus.BAD_REQUEST)

    energy_meter_billing_info = get_object_or_404(queryset, pk=request.data['energy_meter_billing_info_id'])
    created_meter = Meter.create_from_energy_meter_billing_info(energy_meter_billing_info)
    if created_meter:
        return Response("Meter created successfully", status=HTTPStatus.OK)
    else:
        return Response("Meter was not created", status=HTTPStatus.NOT_ACCEPTABLE)

@swagger_auto_schema(method='get',
                         query_serializer=MUGSavingsRequestSerializer,
                         responses={
                             HTTPStatus.OK.value: HHDataSerializer,
                             HTTPStatus.NO_CONTENT.value: HTTPStatus.NO_CONTENT.phrase,
                         },
                         operation_description="Only for MUG user")
@api_view(['GET'])
@permission_classes((IsAuthenticated,))
@mug_client_error_handler__view
def get_meter_savings(request, location_id, embi_id, *args, **kwargs):
    location = Location.objects.get(pk=location_id)
    mug_customer_id = location.mug_customer.mug_customer_id
    mug_site_id = location.mug_site.mug_site_id
    queryset = Meter.objects.all()
    meter = get_object_or_404(queryset, energy_meter_billing_info_id=embi_id)
    mug_meter_id = meter.mug_meter_id
    mug_api_response = MUGApiClient.request_get_meter_savings(mug_customer_id, mug_site_id, mug_meter_id) 
    request_serializer = MUGSavingsSerializer(data=mug_api_response)
    request_serializer.is_valid(raise_exception=True)

    return Response(request_serializer.data)

@api_view(['GET'])
@permission_classes((IsAuthenticated,))
@mug_client_error_handler__view
def get_carbon_intensity(request, location_id, embi_id, *_, **__):
    location = Location.objects.get(pk=location_id)
    mug_customer_id = location.mug_customer.mug_customer_id
    mug_site_id = location.mug_site.mug_site_id
    queryset = Meter.objects.all()
    meter = get_object_or_404(queryset, energy_meter_billing_info_id=embi_id)
    mug_meter_id = meter.mug_meter_id
    mug_api_response = MUGApiClient.request_get_carbon_intensity(mug_customer_id, mug_site_id, mug_meter_id) 
    request_serializer = MUGCarbonIntensitySerializer(data=mug_api_response)
    request_serializer.is_valid(raise_exception=True)

    return Response(request_serializer.data)

@swagger_auto_schema(method='post',
                     request_body=MUGMeterToFetchInfoSerializer,
                     responses={
                         HTTPStatus.OK.value: MUGMeterRateTypeSerializer,
                         HTTPStatus.BAD_REQUEST.value: HTTPStatus.BAD_REQUEST.phrase,
                         HTTPStatus.NO_CONTENT.value: HTTPStatus.NO_CONTENT.phrase,
                     })
@api_view(['POST'])
@permission_classes((IsAuthenticated,))
@mug_client_error_handler__view
def get_meter_info(request: Request, *args, **kwargs):
    serializer = MUGMeterToFetchInfoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        mug_api_response = MUGApiClient.request_get_meter_info(**serializer.data)
        serializer: MUGMeterRateTypeSerializer = MUGMeterRateTypeSerializer(data=mug_api_response._asdict())
        serializer.is_valid(raise_exception=True)
    except MUGBadRequest:
        return Response('This meter number is NOT valid', status=HTTPStatus.BAD_REQUEST)
    except MUGEmptyData:
        return Response(status=HTTPStatus.NO_CONTENT)
    except MUGBadRequestData:
        return Response('Not acceptable meter type', status=HTTPStatus.BAD_REQUEST)
    return Response(serializer.data)
