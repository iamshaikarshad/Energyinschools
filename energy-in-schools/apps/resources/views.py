import django_filters
# from django_filters.rest_framework import FilterSet
from rest_framework import mixins
from rest_framework.permissions import IsAdminUser
# from rest_framework.schemas.generators import is_custom_action
from rest_framework.viewsets import GenericViewSet, ReadOnlyModelViewSet

from apps.historical_data.utils.history_data_aggregation_mixin import AggregateToOneValueAction, HistoricalDataAction, \
    LiveValueAction, ResourceHistoryFilterSet, ResourceHistoryMixin, StateAction
from apps.locations.decorators import own_location_only
from apps.resources.models import Resource
from apps.resources.serializers import AddMissedResourceHistorySerializer, ResourceSerializer, serializer_set
from apps.resources.types import ResourceChildType, ResourceValue, Unit


class ResourceFilterSet(ResourceHistoryFilterSet):
    native_unit = django_filters.ChoiceFilter(choices=Unit.choices(), field_name='unit')
    child_type = django_filters.MultipleChoiceFilter(choices=Resource.ChildType.choices())

    class Meta:
        model = Resource
        fields = (
            'child_type',
            'native_unit',
        )


class ResourceViewSet(ResourceHistoryMixin, ReadOnlyModelViewSet):
    serializer_class = ResourceSerializer
    filterset_class = ResourceFilterSet

    def is_custom_action(self):
        return self.action not in {
            'retrieve', 'list', 'create', 'update', 'partial_update', 'destroy'
        }

    @own_location_only
    def get_queryset(self):
        queryset = Resource.objects.all()

        if not self.is_custom_action():
            queryset = queryset.select_related(*(
                resource_child_type.value for resource_child_type in ResourceChildType
                if resource_child_type != ResourceChildType.SMART_THINGS_ENERGY_METER
            ), 'smart_things_sensor__device', 'smart_things_sensor__smart_things_energy_meter')

        return queryset

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
        url_path='data/aggregated-historical',
        query_serializer_class=serializer_set.sequence
    )
    aggregate_to_one_multiple_resources = AggregateToOneValueAction(
        detail=False,
        url_path='aggregated-data/total',
        query_serializer_class=serializer_set.total
    )


class AddMissedValuesApiView(mixins.CreateModelMixin,
                             GenericViewSet):
    permission_classes = IsAdminUser,
    serializer_class = AddMissedResourceHistorySerializer
    queryset = Resource.objects.all()
    lookup_url_kwarg = 'pk'

    def perform_create(self, serializer: AddMissedResourceHistorySerializer):
        resource: Resource = self.get_object()
        resource.add_missed_data([
            ResourceValue(
                time=item['time'],
                value=item['value'],
                unit=serializer.validated_data['unit']
            )
            for item in
            serializer.validated_data['values']
        ])

        return Resource()
