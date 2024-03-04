from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet

from apps.historical_data.utils.history_data_aggregation_mixin import AggregateToOneValueAction, HistoricalDataAction, \
    LiveValueAction, ResourceHistoryFilterSet, ResourceHistoryMixin, StateAction, BoundaryDataAction
from apps.locations.decorators import own_location_only
from apps.smart_things_sensors.models import SmartThingsEnergyMeter, SmartThingsSensor
from apps.smart_things_sensors.serializers import SmartThingsEnergyMeterSerializer, SmartThingsSensorSerializer, \
    serializer_set
from utilities.serializer_helpers import get_serializer_fields


class SensorFilterSet(ResourceHistoryFilterSet):
    class Meta:
        model = SmartThingsSensor

        fields = get_serializer_fields(
            model.capability,
            add_id=False
        )


class SmartThingsSensorViewSet(ResourceHistoryMixin,
                               mixins.RetrieveModelMixin,
                               mixins.UpdateModelMixin,
                               mixins.ListModelMixin,
                               GenericViewSet):
    serializer_class = SmartThingsSensorSerializer
    filterset_class = SensorFilterSet

    @own_location_only
    def get_queryset(self):
        return SmartThingsSensor.objects.select_related('device').all()

    def perform_update(self, serializer):
        instance = self.get_object()
        for sensor in instance.device.sensors.all():
            if sensor.sub_location != serializer.validated_data['sub_location']:
                sensor.sub_location = serializer.validated_data['sub_location']

                sensor.save()
        super().perform_update(serializer)

    live_value_single_resource = LiveValueAction(
        detail=True,
        url_path='data/live',
        query_serializer_class=serializer_set.live
    )
    state_single_resource = StateAction(
        detail=True,
        url_path='data/state',
        query_serializer_class=serializer_set.state
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

    live_value_multiple_resources = LiveValueAction(
        detail=False,
        url_path='aggregated-data/live',
        query_serializer_class=serializer_set.live
    )
    historical_values_multiple_resources = HistoricalDataAction(
        detail=False,
        url_path='aggregated-data/historical',
        query_serializer_class=serializer_set.sequence
    )
    aggregate_to_one_multiple_resources = AggregateToOneValueAction(
        detail=False,
        url_path='aggregated-data/total',
        query_serializer_class=serializer_set.total
    )

    boundary_live_data_multiple_resources = BoundaryDataAction(
        detail=False,
        url_path='boundary-live-data',
        query_serializer_class=serializer_set.live
    )


class SmartThingsEnergyMeterViewSet(mixins.RetrieveModelMixin,
                                    mixins.UpdateModelMixin,
                                    mixins.ListModelMixin,
                                    GenericViewSet):
    serializer_class = SmartThingsEnergyMeterSerializer

    @own_location_only
    def get_queryset(self):
        return SmartThingsEnergyMeter.objects.select_related('device').all()
