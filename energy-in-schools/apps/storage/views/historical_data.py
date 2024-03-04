from rest_framework.mixins import CreateModelMixin, ListModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.locations.decorators import own_location_only
from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.resources.types import ResourceValue
from apps.storage.serializers.historical import MicrobitHistoricalDataSerializer


class HistoricalStorageDataViewSet(ListModelMixin,
                                   CreateModelMixin,
                                   GenericViewSet):
    serializer_class = MicrobitHistoricalDataSerializer

    @own_location_only
    def get_queryset(self):
        return MicrobitHistoricalDataSet.objects.all()

    def list(self, request, *args, **kwargs):
        data_set: MicrobitHistoricalDataSet = self.get_object()

        serializer = MicrobitHistoricalDataSerializer(
            data=data_set.detailed_historical_data.order_by('time').all(),
            many=True
        )
        serializer.is_valid()

        headers = {}
        if self.request.query_params.get('format', '') == 'csv':
            headers = {
                'Content-Disposition':
                    f"attachment; filename={data_set.namespace}_{data_set.name}_{data_set.type}_historical_data.csv"
            }
        return Response(serializer.data, headers=headers)

    def perform_create(self, serializer: MicrobitHistoricalDataSerializer):
        dataset: MicrobitHistoricalDataSet = self.get_object()
        dataset.add_value(ResourceValue(
            time=serializer.validated_data['time'].replace(microsecond=0),
            value=serializer.validated_data['value'],
            unit=dataset.unit,
        ))
