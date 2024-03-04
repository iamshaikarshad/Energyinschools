import logging
from http import HTTPStatus

from django.shortcuts import get_object_or_404
from rest_framework.mixins import CreateModelMixin, ListModelMixin
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from drf_yasg.utils import swagger_auto_schema

from apps.accounts.view_permissions import SEMAdminPermission
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.locations.serializers import LocationIdQueryParamSerializer
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.decorators import mug_client_error_handler__view
from apps.mug_service.constants import METER_TYPE__MUG_METER_TYPE__MAP, SwitchStatus, PaymentType
from apps.mug_service.models import Switch
from apps.mug_service.serializers import SwitchRequestSerializer, SwitchModelSerializer
from apps.mug_service.internal_types import MUGCustomerBankInfo, MUGSiteBankInfo


logger = logging.getLogger(__name__)


class SwitchesViewSet(CreateModelMixin, ListModelMixin, GenericViewSet):
    permission_classes = (IsAuthenticated, SEMAdminPermission)
    serializer_class = SwitchModelSerializer

    def get_queryset(self):
        energy_meter_billing_info_id = self.kwargs.get('id', None)
        return Switch.objects.filter(energy_meter_billing_info_id=energy_meter_billing_info_id)

    def _get_energy_meter_billing_info_object(self) -> EnergyMeterBillingInfo:
        return get_object_or_404(
            EnergyMeterBillingInfo.objects.in_location(self.request.user.location),
            pk=self.kwargs['id'],
        )

    @swagger_auto_schema(request_body=SwitchRequestSerializer)
    @mug_client_error_handler__view
    def create(self, request, *args, **kwargs):
        energy_meter_billing_info: EnergyMeterBillingInfo = self._get_energy_meter_billing_info_object()

        request_serializer = SwitchRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        result_id: int = request_serializer.validated_data['result_id']

        customer_id = request.user.location.mug_customer.mug_customer_id
        site_id = request.user.location.mug_site.mug_site_id

        if request_serializer.validated_data['payment_type'] == PaymentType.MONTHLY_DIRECT_DEBIT:
            MUGApiClient.update_payment_info(request_serializer.validated_data,
                                             MUGCustomerBankInfo, customer_id)
            MUGApiClient.update_payment_info(request_serializer.validated_data,
                                             MUGSiteBankInfo, customer_id, site_id=site_id)

        contract_id: int = MUGApiClient.request_switch(
            customer_id=customer_id,
            site_id=site_id,
            meter_id=energy_meter_billing_info.mug_meter.mug_meter_id,
            meter_type=METER_TYPE__MUG_METER_TYPE__MAP[energy_meter_billing_info.fuel_type],
            result_id=result_id,
        )

        unit_rates_per_period = {
            rate_info['rate_meter_type']: rate_info['unit_rate']
            for rate_info in request_serializer['tariff_rate_infos'].value
        }

        serializer = SwitchModelSerializer(data=dict(
            contract_id=contract_id,
            status=SwitchStatus.SENT_TO_MUG,
            quote_id=result_id,
            from_supplier_id=energy_meter_billing_info.supplier_id,
            to_supplier_id=request_serializer.validated_data['supplier_id'],
            to_tariff_name=request_serializer.validated_data['tariff_name'],
            to_standing_charge=request_serializer.validated_data['to_standing_charge'],
            to_day_unit_rate=unit_rates_per_period.get('Weekday', 0.0),
            to_night_unit_rate=unit_rates_per_period.get('Night', 0.0),
            to_evening_and_weekend_unit_rate=unit_rates_per_period.get('Weekend', 0.0),
            to_peak_unit_rate=unit_rates_per_period.get('Peak', 0.0),
            contract_start_date=request_serializer.validated_data['contract_start_date'].date(),
            contract_end_date=request_serializer.validated_data['contract_end_date'].date(),
            energy_meter_billing_info_id=energy_meter_billing_info.id)
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=HTTPStatus.CREATED.value)


class LocationSwitchesViewSet(ListModelMixin, GenericViewSet):
    permission_classes = (IsAuthenticated, SEMAdminPermission | IsAdminUser)
    serializer_class = SwitchModelSerializer
    query_serializer_class = LocationIdQueryParamSerializer

    def get_queryset(self):
        location_id = None
        if 'location_id' in self.request.query_params.keys():
            query_params = self.query_serializer_class(data=self.request.query_params)
            query_params.is_valid(raise_exception=True)
            location_id = query_params['location_id'].value
        if (self.request.user.is_authenticated and self.request.user.location) or\
                (self.request.user.is_staff and location_id):
            location_id = location_id or self.request.user.location.id
            return Switch.objects.filter(energy_meter_billing_info__location_id=location_id)
        else:
            return Switch.objects.none()

    @swagger_auto_schema(query_serializer=LocationIdQueryParamSerializer())
    def list(self, request):
        return super().list(request)
