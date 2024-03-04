from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
from calendar import monthrange

from http import HTTPStatus
from typing import (
    Any, Callable, Dict, Iterator, List, NamedTuple, Optional, Type, Union
)

import funcy
from apps.locations.models import Location
from django.db.models import QuerySet, Q
from drf_yasg.utils import swagger_auto_schema
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.viewsets import GenericViewSet, ModelViewSet

from apps.historical_data.serializers import (
    AlwaysOnValueSerializer, BaseSerializer, ResourceHistoryValueSerializer, 
    ResourceStateSerializer, ResourceValueSerializer, BoundaryLiveValueSerializer,
    PeriodicConsumptionSerializer, ResourceHistoricalDataWithUnitAbbreviationSerializer,
    PeriodType
)
from apps.historical_data.types import PeriodicConsumptionType
from apps.historical_data.constants import LATEST_VALUE_AGGREGATION_TIME
from apps.historical_data.utils import aggregations
from apps.historical_data.utils.aggregation_params_manager import(
    AggregationOption, AggregationParamsManager,
    ConsistedResourceParamsError, UnsupportedConditions
)
from apps.locations.filtersets import ByLocationFilterSet
from apps.resources.models import Resource
from apps.resources.types import ResourceDataNotAvailable, TimeResolution, Unit, ResourceChildType
from utilities.decorators import reraise_from_factory
from utilities.enum_support_filter_set import EnumSupportFilterSet
from utilities.exceptions import NoContentError


def period_type_map(periods_ago, period_type):
    mapper = {
        PeriodType.HOURS: [
            timedelta(hours=periods_ago),
            lambda dt: [
                dt.replace(minute=0, second=0, microsecond=0),
                dt.replace(minute=59, second=59, microsecond=999999)
            ]
        ],
        PeriodType.DAYS: [
            timedelta(days=periods_ago),
            lambda dt: [
                dt.replace(hour=0, minute=0, second=0, microsecond=0),
                dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            ]
        ],
        PeriodType.WEEKS: [
            timedelta(weeks=periods_ago),
            lambda dt: [
                (dt - timedelta(days=dt.weekday() % 7)).replace(
                    hour=0, minute=0, second=0, microsecond=0
                ),
                (dt + timedelta(days=6 - (dt.weekday() % 7))).replace(
                    hour=23, minute=59, second=59, microsecond=999999
                )
            ]
        ],
        PeriodType.MONTHS: [
            relativedelta(months=periods_ago),
            lambda dt: [
                dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0),
                dt.replace(
                    day=monthrange(dt.year, dt.month)[-1], hour=23, minute=59, second=59, microsecond=999999
                )
            ]
        ],
    }

    return mapper[period_type]


class QueryParams(NamedTuple):
    unit: Unit = None
    time_resolution: TimeResolution = None
    from_: datetime = None
    to: datetime = None
    fill_gaps: bool = False
    compare_from: datetime = None
    compare_to: datetime = None
    period: PeriodicConsumptionType = None
    resource_id: int = None
    format: str = None
    period_type: PeriodType = None
    periods_ago: int = None


class ResourceHistoryFilterSet(EnumSupportFilterSet, ByLocationFilterSet):
    class Meta:
        model = Resource
        fields = ()


class ResourceHistoryMixin(GenericViewSet):
    request: Request
    filterset_class = ResourceHistoryFilterSet

    @staticmethod
    def get_duration(resources):
        delays = list(resource.energy_meter.minutes_delay
                      for resource in resources
                      if resource.child_type == ResourceChildType.ENERGY_METER
                      and resource.energy_meter.minutes_delay is not None)
        minutes_delay = min(delays) if len(delays) else 0

        if minutes_delay and minutes_delay > 10:
            return timedelta(minutes=minutes_delay + 5)
        else:
            return LATEST_VALUE_AGGREGATION_TIME

    def get_permissions(self):
        location_uid = self.request.query_params.get('location_uid')

        try:
            if location_uid is None and 'pk' in self.kwargs:
                resource = Resource.objects.get(pk=self.kwargs['pk'])
                Location.objects.get(id=resource.sub_location_id, is_energy_data_open=True)
            else:
                Location.objects.get(uid=location_uid, is_energy_data_open=True)
        except (Location.DoesNotExist, Resource.DoesNotExist):
            return [IsAuthenticated()]

        return [AllowAny()]

    def get_resources(self: 'Union[ResourceHistoryMixin, ModelViewSet]') \
            -> Union[QuerySet, List[Resource]]:
        if 'pk' in self.kwargs:  # self.detail isn't usable in some cases e. g.: HistoricalStorageDataViewSet
            return [self.get_object()]

        return self.filter_queryset(self.get_queryset())

    def get_aggregation_rules(self, 
                              query_params: QueryParams,
                              resources: List[Resource]=None):
        return AggregationParamsManager().get_aggregation_rules(
            resources=self.get_resources() if resources is None else resources,
            unit=query_params.unit,
            time_resolution=query_params.time_resolution,
            from_=query_params.from_,
            to=query_params.to,
            aggregation_option=self.aggregation_option
        )

    def get_historical_values_response(self, query_serializer: Type[Serializer]):
        query_params = self.get_query_params(query_serializer)
        resources = None
        if 'pk' not in self.kwargs and query_params.time_resolution == TimeResolution.MINUTE:
            resources = self.filter_queryset(self.get_queryset()).filter(~Q(energy_meter__is_half_hour_meter=True))
        aggregation_rules = self.get_aggregation_rules(query_params, resources)

        if query_params.compare_from and query_params.compare_to:
            result_query = aggregations.aggregate_to_list_with_comparison(
                aggregation_rules=aggregation_rules,
                compare_from=query_params.compare_from,
                compare_to=query_params.compare_to
            )
        else:
            result_query = aggregations.aggregate_to_list(
                aggregation_rules=aggregation_rules
            )

        # noinspection PyProtectedMember
        result_iterator = (item._asdict() for item in result_query)

        if query_params.fill_gaps:
            result_iterator = self._fill_gaps(
                result_iterator,
                query_params.time_resolution if query_params.time_resolution.duration > \
                    TimeResolution.SECOND.duration else TimeResolution.MINUTE,
                query_params.from_.astimezone(timezone.utc) if query_params.from_ else None,
                query_params.to.astimezone(timezone.utc) if query_params.to else None,
            )

        # Request duration:
        #   without drf cache - 800
        #   with drf cache - 280
        #   without serializer - 120

        result_serializer = ResourceHistoryValueSerializer(data=dict(
            values=list(result_iterator),
            unit=aggregation_rules.params.target_unit
        ))
        result_serializer.is_valid(True)

        return Response(result_serializer.data)

    def historical_values_csv_export_response(self, query_serializer: Type[Serializer]):
        query_params: QueryParams = self.get_query_params(query_serializer)
        export_filename = f'historical_data_from_{query_params.from_.date()}_to_{query_params.to.date()}'

        if query_params.resource_id:
            resource = Resource.objects.get(pk=int(query_params.resource_id))
            export_filename += f'_for_{resource.name}'
            aggregation_rules = self.get_aggregation_rules(query_params, [resource])
        else:
            aggregation_rules = self.get_aggregation_rules(query_params)

        result_query = aggregations.aggregate_to_list(
            aggregation_rules=aggregation_rules
        )
        result_iterator = (
            {**item._asdict(), 'value_unit': aggregation_rules.params.target_unit.abbreviation} for item in result_query
        )
        result_iterator = self._fill_gaps(
            result_iterator,
            query_params.time_resolution,
            query_params.from_.astimezone(timezone.utc) if query_params.from_ else None,
            query_params.to.astimezone(timezone.utc) if query_params.to else None,
        )

        historical_data = ResourceHistoricalDataWithUnitAbbreviationSerializer(
            data=dict(values=list(result_iterator))
        )
        historical_data.is_valid(True)

        export_filename += f'_{self._get_school_sign()}.{query_params.format}'

        return Response(
            historical_data.data['values'],
            headers={
                'Content-Disposition': f"attachment; filename={export_filename}"
            }
        )

    def _get_school_sign(self):
        if hasattr(self.request.user, 'location') and self.request.user.location:
            return f'{self.request.user.location.name}-{self.request.user.location.uid}'
        else:
            return f'school_{self.request.query_params.get("location_uid")}'

    def get_live_value_response(self, query_serializer: Type[Serializer]):
        query_params = self.get_query_params(query_serializer)
        resources = self.get_resources()

        try:
            result = aggregations.aggregate_latest_value(
                resources=resources,
                unit=query_params.unit,
                duration=self.get_duration(resources)
            )

        except ResourceDataNotAvailable:
            return Response(BaseSerializer({}).data, status=HTTPStatus.NO_CONTENT)

        return Response(ResourceValueSerializer(result).data)

    def get_latest_state_response(self, _: Type[Serializer]):
        resource: Resource = self.get_object()

        result = resource.get_latest_state()
        if result:
            return Response(ResourceStateSerializer(result).data)

        return Response(BaseSerializer({}).data, status=HTTPStatus.NO_CONTENT)

    def get_aggregate_to_one_response(self, query_serializer: Type[Serializer]):
        query_params = self.get_query_params(query_serializer)
        print(query_params,'querdyy ===============================================')

        if 'pk' not in self.kwargs and query_params.time_resolution == TimeResolution.HOUR:
            resources = self.filter_queryset(self.get_queryset()).filter(energy_meter__hh_values_meter=None)
            print('hourly', resources)
        else:
            resources = self.get_resources()
            print('else', resources)
        if query_params.periods_ago is not None and query_params.period_type is not None:
            delta, get_period_borders = period_type_map(query_params.periods_ago, query_params.period_type)

            now = datetime.utcnow()
            then = now - delta
            from_, to = get_period_borders(then)
        else:
            from_, to = query_params.from_, query_params.to

        try:
            result = aggregations.aggregate_to_one(
                resources=resources,
                unit=query_params.unit,
                from_=from_,
                to=to,
                aggregation_option=self.aggregation_option,
            )

        except ResourceDataNotAvailable:
            return Response(BaseSerializer({}).data, status=HTTPStatus.NO_CONTENT)

        return Response(ResourceValueSerializer(result).data)

    def get_always_on_response(self, query_serializer: Type[Serializer]):
        query_params = self.get_query_params(query_serializer)
        try:
            result = aggregations.get_always_on(
                resources=self.get_resources(),
                from_=query_params.from_,
                to=query_params.to
            )
        except ResourceDataNotAvailable:
            return Response(BaseSerializer({}).data, status=HTTPStatus.NO_CONTENT)

        return Response(AlwaysOnValueSerializer(result).data)

    def get_boundary_data_response(self, query_serializer: Type[Serializer]):
        query_params = self.get_query_params(query_serializer)
        try:
            min_value, max_value = aggregations.get_boundary_live_data(
                resources=self.get_resources(),
                unit=query_params.unit,
            )
        except ResourceDataNotAvailable:
            return Response(BaseSerializer({}).data, status=HTTPStatus.NO_CONTENT)

        return Response(BoundaryLiveValueSerializer({'min': min_value, 'max': max_value}).data)

    def get_periodic_data_response(self, query_serializer: Type[Serializer]):
        query_params = self.get_query_params(query_serializer)

        try:
            result = aggregations.get_periodic_data(
                resources=self.get_resources(),
                unit=query_params.unit,
                period=query_params.period
            )

        except ResourceDataNotAvailable:
            return Response(BaseSerializer({}).data, status=HTTPStatus.NO_CONTENT)

        result = [item._asdict() for item in result]

        if query_params.fill_gaps:
            result = self._fill_gaps_for_periodic_data(result)
            result.sort(key=lambda x: x['hour'])

        result_serializer = PeriodicConsumptionSerializer(data=dict(
            values=result,
            unit=query_params.unit
        ))
        result_serializer.is_valid(True)
        return Response(result_serializer.data)

    def get_query_params(self, serializer: Type[Serializer]) -> QueryParams:
        query_serializer = serializer(data=self.request.query_params)
        query_serializer.is_valid(True)

        # noinspection PyUnresolvedReferences,PyProtectedMember
        return QueryParams(**{
            key: query_serializer.validated_data.get(key, QueryParams._field_defaults[key])
            for key in QueryParams._fields
        })

    @property
    def aggregation_option(self) -> Optional[AggregationOption]:
        """ flag for selecting aggregation params when you have params that
        have the same source_unit and target_unit to indicate which one you want to use."""

        return None

    @classmethod
    def _fill_gaps(cls, values_iterator: Iterator[Dict[str, Any]], time_resolution: TimeResolution,
                   from_: datetime, to: datetime) \
            -> Iterator[Dict[str, Any]]:
        """
        Using `time_resolution.duration` have some deviation in reason that the months and years can have different
            duration. But it should not be important for current use cases
        """

        if from_:
            first_previous = {'time': from_ - time_resolution.duration}
        else:
            first_previous = None

        current = first_previous

        for current, previous in funcy.with_prev(values_iterator, first_previous):
            if previous:
                yield from cls._generate_empty_values(previous['time'], current['time'], time_resolution)

            yield current

        if current and to:
            yield from cls._generate_empty_values(current['time'], to, time_resolution)

    @classmethod
    def _fill_gaps_for_periodic_data(cls, values: List[Dict[str, Any]]):
        used_hours = [result['hour'] for result in values]
        values += [{'hour': hour, 'value': None} for hour in set(range(24)) - set(used_hours)]
        return values

    @staticmethod
    def _generate_empty_values(from_: datetime, to: datetime, time_resolution: TimeResolution):
        while to - from_ > time_resolution.duration:
            from_ += time_resolution.duration
            yield {
                'time': from_,
                'value': None,
            }


class AbstractAction:
    responses: Dict[int, serializers.Serializer]
    handler: Callable[[serializers.Serializer], Response]

    def __init__(self, query_serializer_class: Type[serializers.Serializer], url_path: str, detail: bool):
        self.url_path = url_path
        self.query_serializer_class = query_serializer_class
        self.detail = detail

    def __get__(self, instance, owner):
        def wrapper(_self: ResourceHistoryMixin, *_, **__):
            return self.handler(_self, self.query_serializer_class)

        wrapper.__name__ = self.name

        # todo
        setattr(owner, self.name, swagger_auto_schema(
            method='get',
            responses=self.responses,
            query_serializer=self.query_serializer_class()
        )(action(
            methods=['get'],
            detail=self.detail,
            url_path=self.url_path
        )(funcy.reraise(
            ResourceDataNotAvailable, NoContentError
        )(reraise_from_factory(
            (UnsupportedConditions, ConsistedResourceParamsError),
            lambda exception: ValidationError(f'Those aggregation conditions are unsupported: {exception}')
        )(
            wrapper
        )))))

        return getattr(owner, self.name)

    def __set_name__(self, owner, name):
        self.name = name


class LiveValueAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: ResourceValueSerializer,
        HTTPStatus.NO_CONTENT.value: BaseSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_live_value_response)


class StateAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: ResourceStateSerializer,
        HTTPStatus.NO_CONTENT.value: BaseSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_latest_state_response)


class HistoricalDataAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: ResourceHistoryValueSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_historical_values_response)


class AggregateToOneValueAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: ResourceValueSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_aggregate_to_one_response)


class AlwaysOnAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: AlwaysOnValueSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_always_on_response)


class BoundaryDataAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: BoundaryLiveValueSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_boundary_data_response)


class PeriodicConsumptionAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: PeriodicConsumptionSerializer,
        HTTPStatus.NO_CONTENT.value: BaseSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.get_periodic_data_response)


class HistoricalDataExportAction(AbstractAction):
    responses = {
        HTTPStatus.OK.value: ResourceHistoryValueSerializer,
        HTTPStatus.NO_CONTENT.value: BaseSerializer,
        HTTPStatus.BAD_REQUEST.value: BaseSerializer
    }
    handler = staticmethod(ResourceHistoryMixin.historical_values_csv_export_response)
