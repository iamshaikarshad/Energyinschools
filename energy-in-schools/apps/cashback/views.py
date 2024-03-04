from http import HTTPStatus

from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.cashback.models import OffPeakyPoint
from apps.cashback.serializers import EnergyCashbackSerializer, CashBackQuerySerializer, OffPeakyPointSerializer
from apps.locations.models import Location


class LocationCashbackViewSet(RetrieveModelMixin, GenericViewSet):
    lookup_field = 'uid'  # todo change to pk
    serializer_class = OffPeakyPointSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Location.objects.all()

        return Location.objects.filter(share_energy_consumption=True).all() | \
               self.request.user.location.with_sub_locations

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: EnergyCashbackSerializer, },
                         query_serializer=CashBackQuerySerializer)
    @action(methods=['get'], detail=True, url_path='total')
    def total(self, request: Request,  *_, **__):
        serializer = CashBackQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        cashback = OffPeakyPoint.get_cash_back_for_location(
            location=self.get_object(),
            from_=serializer.validated_data['from_'],
            to=serializer.validated_data['to'],
        )
        result_serializer = EnergyCashbackSerializer(data={
            'current': cashback,
        })
        result_serializer.is_valid(True)

        return Response(result_serializer.data)

    def retrieve(self, request, *args, **kwargs):
        location = self.get_object()
        serializer = self.get_serializer(OffPeakyPoint.get_queryset_for_location(location).order_by('-day'), many=True)
        return Response(serializer.data)
