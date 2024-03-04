from typing import Iterable

from rest_framework.viewsets import ModelViewSet

from apps.historical_data.utils.history_data_aggregation_mixin import AggregateToOneValueAction, HistoricalDataAction, \
    LiveValueAction, ResourceHistoryMixin
from apps.locations.decorators import own_location_only
from apps.main.view_mixins import SoftDeleteCreateModelViewSetMixin
from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.storage.serializers.historical import MicrobitHistoricalDataSetSerializer, serializer_set


class HistoricalStorageDataSetViewSet(SoftDeleteCreateModelViewSetMixin, ResourceHistoryMixin, ModelViewSet):
    serializer_class = MicrobitHistoricalDataSetSerializer

    @own_location_only
    def get_queryset(self):
        return MicrobitHistoricalDataSet.objects.order_by('-last_detailed_data_add_time')

    def get_unique_together_fields(self) -> Iterable[str]:
        return (
            'namespace',
            'name',
            'type',
            'hub',
            'sub_location',
        )

    live_value_single_resource = LiveValueAction(
        detail=True,
        url_path='data/live',
        query_serializer_class=serializer_set.live
    )
    historical_values_single_resource = HistoricalDataAction(
        detail=True,
        url_path='data/historical',
        query_serializer_class=serializer_set.sequence
    )
    aggregate_to_one_single_resource = AggregateToOneValueAction(
        detail=True,
        url_path='data/total',
        query_serializer_class=serializer_set.total
    )

    live_value_multiple_resource = LiveValueAction(
        detail=False,
        url_path='aggregated-data/live',
        query_serializer_class=serializer_set.live
    )
    historical_values_multiple_resource = HistoricalDataAction(
        detail=False,
        url_path='aggregated-data/historical',
        query_serializer_class=serializer_set.sequence
    )
    aggregate_to_one_multiple_resource = AggregateToOneValueAction(
        detail=False,
        url_path='aggregated-data/total',
        query_serializer_class=serializer_set.total
    )
