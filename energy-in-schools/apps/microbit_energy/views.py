from copy import deepcopy
from datetime import datetime, timezone
from typing import Type

import django_filters
from django.db.models import Q
from drf_yasg import openapi
from rest_framework.serializers import Serializer
from rest_framework.viewsets import GenericViewSet

from apps.energy_meters.models import EnergyMeter
from apps.historical_data.constants import LATEST_VALUE_AGGREGATION_TIME
from apps.historical_data.serializers import ResourceValueSerializer
from apps.historical_data.utils.history_data_aggregation_mixin import AggregateToOneValueAction, \
    ResourceHistoryMixin
from apps.hubs.authentication import RaspberryPiAuthentication
from apps.locations.filters import EnergyDataSharedSubLocation
from apps.microbit_energy.serializers import EnergyConsumptionQuerySerializer
from apps.resources.models import Resource
from apps.resources.types import ResourceChildType
from utilities.enum_support_filter_set import EnumSupportFilterSet


def patch_parameter(parameter: openapi.Parameter, **kwargs) -> openapi.Parameter:
    copy = deepcopy(parameter)
    copy.update(**kwargs)
    return copy


class MicrobitEnergyFilterSet(EnumSupportFilterSet):
    energy_type = django_filters.ChoiceFilter(choices=EnergyMeter.Type.choices(), method='filter_energy_type')
    location_uid = EnergyDataSharedSubLocation()

    class Meta:
        model = Resource
        fields = (
            'energy_type',
            'location_uid',
        )

    @staticmethod
    def filter_energy_type(queryset, _, value):
        queryset = queryset.filter(
            Q(energy_meter__type=value) |
            Q(smart_things_sensor__smart_things_energy_meter__type=value)
        )
        return queryset


class MicrobitEnergyViewSet(ResourceHistoryMixin, GenericViewSet):
    authentication_classes = RaspberryPiAuthentication,
    serializer_class = ResourceValueSerializer
    filterset_class = MicrobitEnergyFilterSet

    def get_queryset(self):
        queryset = Resource.objects.filter(
            Q(child_type=ResourceChildType.ENERGY_METER) |
            Q(child_type=ResourceChildType.SMART_THINGS_ENERGY_METER)
        )
        return queryset

    def get_query_params(self, serializer: Type[Serializer]):
        query_params = super().get_query_params(serializer)

        if query_params.from_ is None:
            query_params = query_params._replace(from_=datetime.now(tz=timezone.utc) - LATEST_VALUE_AGGREGATION_TIME)

        return query_params

    aggregate_to_one_multiple_resource = AggregateToOneValueAction(
        detail=False,
        url_path='consumption',
        query_serializer_class=EnergyConsumptionQuerySerializer
    )
