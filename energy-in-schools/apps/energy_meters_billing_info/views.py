import logging
from rest_framework import status
from http import HTTPStatus

from django.db import IntegrityError
from django.db.models import query
from django.db.transaction import atomic
from django_filters.rest_framework import FilterSet
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.energy_meters_billing_info.serializers import EnergyMeterBillingInfoSerializer, \
    EnergyMeterBillingInfoResourceSerializer
from apps.locations.decorators import own_location_only
from apps.locations.filters import LocationIDFilter
from apps.mug_service.api_client import MUGApiClient
from apps.mug_service.exceptions import MUGServiceDisabled
from apps.mug_service.constants import METER_TYPE__MUG_METER_TYPE__MAP
from apps.mug_service.models import Meter, Customer, Site
from apps.resources.models import Resource
from apps.locations.models import Location

from apps.registration_requests.models import RegistrationRequest


logger = logging.getLogger(__name__)


NOT_UNIQUE_ERROR_MESSAGE = 'You filled not unique values for Meter ID or Resource'


class ResponseCreateMugMeterBulk(Response):
    def close(self):
        super().close()
        if not self.data:
            return
        location = Location.objects.get(pk=self.data[0]['location_id'])

        try:
            mug_customer_id = location.mug_customer.mug_customer_id
        except Customer.DoesNotExist:
            logger.info(f"!!!MUG Customer not found for Location '{location.uid}'")
            customer = Customer.create_from_registration_request(location.school.registration_request)
            mug_customer_id = customer.mug_customer_id
            logger.info(f"!!!MUG Customer created with Id '{mug_customer_id}'")
        except RegistrationRequest.DoesNotExist as error:
            logger.info(f"Registration request not found for Location '{location.uid}'")
            raise error

        try:
            mug_site_id = location.mug_site.mug_site_id
        except Site.DoesNotExist:
            logger.info(f"!!!MUG Site not found for Location '{location.uid}'")
            mug_site = Site.create_from_location(location)
            mug_site_id = mug_site.mug_site_id
            logger.info(f"!!!MUG Site created with id '{mug_site_id}'")

        try:
            meters_id__models_id = {
                meter_billing_info.meter_id: meter_billing_info.id
                for meter_billing_info in
                EnergyMeterBillingInfo.objects.filter(meter_id__in=[meter_info['meter_id'] for meter_info in self.data])
            }
            meters_id__mug_meters_id = MUGApiClient.bulk_create_meters(mug_customer_id, mug_site_id, self.data)
            Meter.objects.bulk_create([
                Meter(energy_meter_billing_info_id=meters_id__models_id[meter_id], mug_meter_id=mug_meter_id)
                for meter_id, mug_meter_id in meters_id__mug_meters_id.items()
            ])
        except MUGServiceDisabled:
            logger.info(f"MUG service disabled")


class ResponseCreateMugMeter(Response):
    def close(self):
        super().close()
        location = Location.objects.get(pk=self.data['location_id'])

        try:
            mug_customer_id = location.mug_customer.mug_customer_id
        except Customer.DoesNotExist:
            logger.info(f"***MUG Customer not found for Location '{location.uid}'")
            customer = Customer.create_from_registration_request(location.school.registration_request)
            mug_customer_id = customer.mug_customer_id
            logger.info(f"***MUG Customer created with Id '{mug_customer_id}'")
        except RegistrationRequest.DoesNotExist as error:
            logger.info(f"Registration request not found for Location '{location.uid}'")
            raise error

        try:
            mug_site_id = location.mug_site.mug_site_id
        except Site.DoesNotExist:
            logger.info(f"***MUG Site not found for Location '{location.uid}'")
            mug_site = Site.create_from_location(location)
            mug_site_id = mug_site.mug_site_id
            logger.info(f"***MUG Site created with id '{mug_site_id}'")
        try:
            meter_billing_info = EnergyMeterBillingInfo.objects.filter(meter_id=self.data['meter_id']).first()
            mug_meter_id = MUGApiClient.create_meter(mug_customer_id, mug_site_id, self.data)
            Meter.objects.create(
                energy_meter_billing_info_id=meter_billing_info.id,
                mug_meter_id=mug_meter_id,
            )
        except MUGServiceDisabled:
            logger.info(f"MUG service disabled")

        if self.data['fuel_type'] == 'ELECTRICITY':
            try:
                MUGApiClient.post_extra_meter_details(mug_customer_id, mug_site_id, mug_meter_id, meter_billing_info)
            except Exception as error:
                logger.info(f"Could not post extra meter details due to: {error}")
                print('COULD NOT POST EXTRA DETAILS {}'.format(error))

class EnergyMeterBillingInfoFilter(FilterSet):
    location = LocationIDFilter()

    class Meta:
        model = EnergyMeterBillingInfo
        fields = ['location']


class EnergyMeterBillingInfoViewSet(ModelViewSet):
    serializer_class = EnergyMeterBillingInfoSerializer
    filterset_class = EnergyMeterBillingInfoFilter

    @own_location_only
    def get_queryset(self):
        return EnergyMeterBillingInfo.objects.filter(location__id=self.request.user.location.id)

    def get_serializer(self, *args, **kwargs):
        if self.action == self.bulk_create.__name__:
            kwargs = dict(**kwargs, many=True)
        return super().get_serializer(*args, **kwargs)

    @action(methods=['post'], detail=False, url_path='bulk')
    @atomic
    def bulk_create(self, request, *args, **kwargs):
        try:
            response = self.embi_base_create(request, *args, **kwargs)
            return ResponseCreateMugMeterBulk(response.data, response.status_code)
        except IntegrityError as err:  # Uniqueness can't be checked on serializer level
            logger.error(err)
            return Response(NOT_UNIQUE_ERROR_MESSAGE, status=HTTPStatus.BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        try:
            response = self.embi_base_create(request, *args, **kwargs)
            return ResponseCreateMugMeter(response.data, response.status_code)
        except IntegrityError as err:  # Uniqueness can't be checked on serializer level
            logger.error(err)
            return Response(NOT_UNIQUE_ERROR_MESSAGE, status=HTTPStatus.BAD_REQUEST)

    def list(self, request):
        queryset = self.get_queryset()
        serializer = EnergyMeterBillingInfoSerializer(queryset, many=True)
        download = request.GET.get('download', '')
        if download:
            return self.export_to_excel(serializer.data)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        meter_info = get_object_or_404(queryset, pk=pk)
        serializer = EnergyMeterBillingInfoSerializer(meter_info)
        download = request.GET.get('download', '')
        if download:
            return self.export_to_excel([serializer.data])
        return Response(serializer.data)

    def update(self, request, pk=None):
        queryset = self.get_queryset()
        meter_info = get_object_or_404(queryset, pk=pk)
        if 'resource_id' in request.data:
            resource = Resource.objects.get(pk=request.data['resource_id'])
            meter_info.resource = resource
            meter_info.save()

        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            meter = Meter.objects.get(energy_meter_billing_info__id=instance.id)
            meter.delete()
        except Meter.DoesNotExist:
            pass

        instance.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


    def export_to_excel(self, serialized_data):
        import io
        import json
        from django.http import HttpResponse
        from django.views.generic import View
        import xlsxwriter

        output = io.BytesIO()
        data = json.loads(json.dumps(serialized_data))
        file_name = 'meter_info_' + str(data[0]['id']) + '.xlsx' if len(data) == 1 else 'meters_info.xlsx'
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()

        headers = data[0].keys()
        worksheet.write_row(0, 0, headers)

        for index, meter in enumerate(data):
            meter['consumption_by_rates'] = json.dumps(meter['consumption_by_rates'])
            meter_values = meter.values()
            worksheet.write_row(index + 1, 0, meter_values)

        workbook.close()

        output.seek(0)

        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=%s' % file_name

        return response

    @swagger_auto_schema(method='patch', request_body=EnergyMeterBillingInfoResourceSerializer(many=True),
                         responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase})
    @action(methods=['patch'], detail=False, url_path='resources')
    @atomic
    def resources(self, request):

        serializer = EnergyMeterBillingInfoResourceSerializer(data=request.data, many=True)
        serializer.context['request'] = request
        serializer.is_valid(raise_exception=True)

        for item in serializer.validated_data:
            try:
                energy_meter_billing_info = item['energy_meter_billing_info']
                energy_meter_billing_info.resource = item['resource']
                energy_meter_billing_info.save()

            except IntegrityError as err:
                logger.error(err)

        return Response()

    def embi_base_create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return response
