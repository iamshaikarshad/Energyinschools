from datetime import datetime, timezone
from http import HTTPStatus

from apps.locations.models import Location
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.energy_tariffs.models import EnergyTariff
from apps.energy_tariffs.serializers import EnergyTariffSerializer
from apps.locations.decorators import own_location_only
from apps.locations.serializers import LocationUIDSerializer
from utilities.enum_support_filter_set import EnumSupportFilterSet


class TariffFilter(EnumSupportFilterSet):
    class Meta:
        model = EnergyTariff
        fields = (
            'meter_type',
        )


class EnergyTariffViewSet(ModelViewSet):
    serializer_class = EnergyTariffSerializer
    filterset_class = TariffFilter

    def get_permissions(self):
        location_uid = self.request.query_params.get('location_uid')

        try:
            Location.objects.get(uid=location_uid, is_energy_data_open=True)
        except Location.DoesNotExist:
            return [IsAuthenticated()]

        return [AllowAny()]

    @own_location_only
    def get_queryset(self):
        queryset = EnergyTariff.objects.filter(type=EnergyTariff.Type.NORMAL).all()
        location_uid = self.request.query_params.get('location_uid', None)
        if location_uid:
            return queryset.filter_by_location_uid(location_uid)

        return queryset

    @swagger_auto_schema(
        method='get',
        query_serializer=LocationUIDSerializer,
        responses={HTTPStatus.OK.value: EnergyTariffSerializer(many=True)}
    )
    @action(methods=['get'], detail=False, url_path='current-tariffs')
    def current_tariffs(self, *_):
        _from = self.request.query_params.get('from', None)
        _to = self.request.query_params.get('to', None)

        range_is_passed = isinstance(_from, str) and isinstance(_to, str)
        date_format = '%Y-%m-%dT%H:%M:%S%z'
        now = datetime.now(tz=timezone.utc)

        from_datetime = datetime.strptime(''.join(_from.rsplit(':', 1)), date_format) if range_is_passed else now
        to_datetime = datetime.strptime(''.join(_to.rsplit(':', 1)), date_format) if range_is_passed else now

        current_tariffs_queryset = self.filter_queryset(self.get_queryset()).filter(
            Q(active_date_end=None) | Q(active_date_end__gte=from_datetime.date()),
            active_date_start__lte=to_datetime.date(),
        ).order_by(
            'provider_account',
            'meter_type',
            'active_date_start',
            'active_time_start'
        )
        serializer = self.serializer_class(
            current_tariffs_queryset,
            many=True
        )

        return Response(serializer.data)
