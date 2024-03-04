from http import HTTPStatus
from typing import Dict, List, Union

from django.conf import settings
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.utils import aggregations
from apps.locations.filtersets import OwnLocationOnlyFilterSet
from apps.locations.models import Location
from apps.locations.querysets import AbstractInLocationQuerySet
from apps.locations.serializers import LocationMoodSerializer, LocationSerializer
from apps.resources.types import ResourceDataNotAvailable, Unit
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.serializers import SmartThingsDevicesSerializer
from .constants import ENERGY_CONSUMPTION_MOOD_MAPPING


class LocationFilterSet(OwnLocationOnlyFilterSet):
    class Meta:
        model = Location
        fields = ()


class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    filterset_class = LocationFilterSet

    def get_queryset(self):
        queryset: AbstractInLocationQuerySet = Location.objects.all().select_related('address')

        if self.request.user.is_authenticated:  # the check is for swagger generation only
            if self.request.method != 'GET':
                queryset = queryset.in_location(self.request.user.location)

            elif not settings.TEST_MODE:
                queryset = queryset.in_location(self.request.user.location) | queryset.filter(is_test=False)

        return queryset

    def get_permissions(self):
        if self.action == 'smart_things_devices':
            return [IsAdminUser()]
        else:
            return super().get_permissions()

    def get_object(self):
        """
        Returns the object the view is displaying.

        You may want to override this if you need to provide non-standard
        queryset lookups.  Eg if objects are referenced using multiple
        keyword arguments in the url conf.
        """
        queryset = self.filter_queryset(self.get_queryset())

        uid_filter = self.request.query_params.get('uid', False)

        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_field = 'pk'

        if uid_filter:
            lookup_field = 'uid'

        assert lookup_url_kwarg in self.kwargs, (
                'Expected view %s to be called with a URL keyword argument '
                'named "%s". Fix your URL conf, or set the `.lookup_field` '
                'attribute on the view correctly.' %
                (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    def perform_create(self, serializer: LocationSerializer):
        serializer.save(parent_location=self.request.user.location)

    def get_energy_meters(self, meter_type) -> Union[QuerySet, List[EnergyMeter]]:
        return EnergyMeter.objects.in_location(self.get_object()).filter(type=meter_type)

    @swagger_auto_schema(method='get', responses={HTTPStatus.OK.value: LocationMoodSerializer})
    @action(methods=['get'], detail=True, url_path='energy-mood')
    def energy_mood(self, *_, **__):
        """Return Energy Mood for Each School"""
        current_mood: Dict[str, int] = {
        }

        for energy_type in MeterType:
            try:
                result = aggregations.aggregate_latest_value(
                    resources=self.get_energy_meters(energy_type),
                    unit=Unit.WATT,
                )
            except ResourceDataNotAvailable:
                current_mood[energy_type.value.lower()] = 5 if energy_type != MeterType.SOLAR else 0
            else:
                live_value = result.value
                threshold_value = min(ENERGY_CONSUMPTION_MOOD_MAPPING.keys(), key=lambda value: abs(value - live_value))
                current_mood[energy_type.value.lower()] = ENERGY_CONSUMPTION_MOOD_MAPPING[threshold_value]

        serializer = LocationMoodSerializer(data=current_mood)
        serializer.is_valid(True)

        return Response(serializer.data)

    @swagger_auto_schema(method='get', responses={HTTPStatus.OK.value: SmartThingsDevicesSerializer})
    @action(methods=['get'], detail=True, url_path='smart-things-devices')
    def smart_things_devices(self, *_, **__):
        devices: QuerySet = SmartThingsDevice.objects.filter(sub_location=self.get_object())

        serializer = SmartThingsDevicesSerializer(devices, many=True)

        return Response(serializer.data)


class OpenDataLocationViewSet(viewsets.ViewSet):
    queryset = Location.objects.all()
    permission_classes = [AllowAny]

    def list(self, request):
        schools = self.queryset.filter(is_energy_data_open=True)

        if not len(schools):
            return Response({
                'status': 'Not found',
                'message': "There are no open schools found"
            }, status=status.HTTP_404_NOT_FOUND)

        response = {
            'schools': [{'name': school.name, 'uid': school.uid} for school in schools],
        }

        return Response(response, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        query_params = request.GET

        try:
            if request.user.is_superuser :
                if query_params.get('uid') != 'true':
                    school = self.queryset.get(id=pk)
                else:
                    school = self.queryset.get(uid=pk)
            elif query_params.get('uid') != 'true' and not request.user.is_superuser:
                school = self.queryset.get(id=pk, is_energy_data_open=True)
            else:
                school = self.queryset.get(uid=pk, is_energy_data_open=True)
        except Location.DoesNotExist:
            return Response({
                'status': 'Not found',
                'message': "There are no open school with id provided"
            }, status=status.HTTP_404_NOT_FOUND)

        response = LocationSerializer(school).data

        return Response(response, status=status.HTTP_200_OK)

    def update(self, request, pk=None):
        if not request.user.is_superuser:
            return Response({
                'status': 'Forbidden request',
                'message': 'You are not allowed to perform this operation'
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data

        if 'consent' not in data:
            return Response({
                'status': 'Bad request',
                'message': 'Missing required parameter consent'
            }, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(data['consent'], bool):
            return Response({
                'status': 'Bad request',
                'message': 'Required parameter consent should be boolean'
            }, status=status.HTTP_400_BAD_REQUEST)

        if 'uid' not in data or data['uid'] is False:
            school = self.queryset.get(id=pk)
        else:
            school = self.queryset.get(uid=pk)

        if school is None:
            return Response({
                'status': 'Not found',
                'message': "There are no school with id provided"
            }, status=status.HTTP_404_NOT_FOUND)

        school.is_energy_data_open = data['consent']
        school.save()

        response = {
            'school_id': school.uid,
            'consent': data['consent']
        }

        return Response(response, status=status.HTTP_200_OK)
