from datetime import datetime, timedelta, timezone, tzinfo
from typing import Any, Callable, List, NamedTuple, Optional, Tuple, Type

from enumfields import Enum
from singleton_decorator import singleton
from sqlalchemy.orm import Query
from sqlalchemy.sql import sqltypes

from apps.historical_data.models import AbstractHistoricalData, DetailedHistoricalData, LongTermHistoricalData
from apps.main.models import BaseModel
from apps.resources.models import Resource
from apps.resources.types import HistoryType, ResourceDataNotAvailable, TimeResolution, Unit


# func(time_field, value_field, aggregation_rules) -> SQLAlchemy Type
PreConverter = Callable[[sqltypes.DateTime, sqltypes.Float, 'AggregationRules'], Any]
AggregateByResources = PreConverter
AggregateByTime = PreConverter
JoinExtraModels = Callable[[Query, 'AggregationRules', sqltypes.Integer, sqltypes.DateTime, sqltypes.Float], Query]
PreProcessQuery = JoinExtraModels
PostProcessQuery = JoinExtraModels
GetByTimeStepExtraField = Callable[[sqltypes.DateTime, sqltypes.Float, 'AggregationRules'], Tuple[Any, ...]]


class ConsistedResourceParamsError(Exception):
    pass


class ConsistedResourceParams(NamedTuple):
    unit: Unit
    detailed_time_resolution: TimeResolution
    long_term_time_resolution: TimeResolution
    detailed_data_live_time: Optional[timedelta]

    @classmethod
    def make_from_resource_list(cls, resources: List[Resource]) -> 'ConsistedResourceParams':
        unit = {resource.unit for resource in resources}
        detailed_time_resolution = {resource.detailed_time_resolution for resource in resources}
        long_term_time_resolution = {resource.long_term_time_resolution for resource in resources}
        detailed_data_live_time = [resource.detailed_data_live_time for resource in resources
                                   if resource.detailed_data_live_time is not None]

        if not resources:
            raise ResourceDataNotAvailable('Resources for the aggregation should be provided!')

        if len(unit) != 1 or len(detailed_time_resolution) != 1 or len(long_term_time_resolution) != 1:
            raise ConsistedResourceParamsError(
                'Can\'t make consisted params for resources ids: "{}"'.format(
                    ", ".join(map(str, (resource.id for resource in resources)))
                )
            )

        return ConsistedResourceParams(
            unit=next(iter(unit)),
            detailed_time_resolution=next(iter(detailed_time_resolution)) if detailed_time_resolution else None,
            long_term_time_resolution=next(iter(long_term_time_resolution)) if long_term_time_resolution else None,
            detailed_data_live_time=min(detailed_data_live_time, default=None),
        )


class AggregationParamsManagerError(Exception):
    pass


class DuplicatedParamsError(AggregationParamsManagerError):
    pass


class UnsupportedConditions(AggregationParamsManagerError):
    pass


class AggregationOption(Enum):
    def __new__(cls, value, is_default):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._is_default_ = is_default
        return obj

    @property
    def is_default(self):
        return self._is_default_


class AggregationParams(NamedTuple):
    source_unit: Unit
    target_unit: Unit
    aggregate_by_time: AggregateByTime
    aggregate_by_resources: AggregateByResources
    pre_converter: PreConverter = lambda _, value, __: value
    models_to_join: Tuple[Type[BaseModel], ...] = ()
    by_times_step_pre_process_query: PreProcessQuery = lambda query, *_: query
    by_resources_step_pre_process_query: PreProcessQuery = lambda query, *_: query
    get_by_time_step_extra_fields: GetByTimeStepExtraField = lambda _, __, ___: ()
    join_extra_models: JoinExtraModels = lambda query, *_: query
    aggregation_option: Optional[AggregationOption] = None

    def is_supported(self, source_unit: Unit, target_unit: Unit, aggregation_option: AggregationOption) -> bool:
        return self.source_unit == source_unit and \
               (target_unit == self.target_unit or
                target_unit is None) and \
               (aggregation_option == self.aggregation_option or
                aggregation_option is None and self.aggregation_option.is_default)

    def replace(self, **kwargs) -> 'AggregationParams':
        return self._replace(**kwargs)

    @property
    def composite_key(self) -> Tuple[Any, ...]:
        return (
            self.source_unit,
            self.target_unit,
            self.aggregation_option,
        )


class AggregationRules(NamedTuple):
    params: AggregationParams
    model: Type[AbstractHistoricalData]
    native_time_resolution: TimeResolution
    resources: List[Resource]
    time_resolution: TimeResolution
    from_: datetime
    to: datetime

    @property
    def tz_info(self) -> tzinfo:
        if self.from_:
            return self.from_.tzinfo

        if self.to:
            return self.to.tzinfo


@singleton
class AggregationParamsManager:
    def __init__(self):
        self._registered_composite_key = set()
        self._aggregation_params_list = []

    def register_aggregation_params(self, aggregation_params: AggregationParams):
        if aggregation_params.composite_key in self._registered_composite_key:
            raise DuplicatedParamsError(
                f'Params with composite key "{aggregation_params.composite_key}" already registered!'
            )

        self._aggregation_params_list.append(aggregation_params)

    def get_aggregation_rules(
            self,
            resources: List[Resource],
            unit: Optional[Unit] = None,
            time_resolution: Optional[TimeResolution] = None,
            from_: Optional[datetime] = None,
            to: Optional[datetime] = None,
            aggregation_option: Optional[AggregationOption] = None,
    ) -> AggregationRules:
        consisted_resource_params = ConsistedResourceParams.make_from_resource_list(resources)

        accepted_parameters = [
            aggregation_params for aggregation_params in self._aggregation_params_list
            if aggregation_params.is_supported(consisted_resource_params.unit, unit, aggregation_option)
        ]
        if unit is None and len(accepted_parameters) > 1:
            # If target unit is None then select any supported target unit.
            # If more then one target units are supported then use native unit as target
            accepted_parameters = [item for item in accepted_parameters
                                   if item.target_unit == consisted_resource_params.unit]

        if self._select_history_type(consisted_resource_params, time_resolution, from_, to) is HistoryType.DETAILED:
            native_time_resolution = consisted_resource_params.detailed_time_resolution
            model = DetailedHistoricalData

        else:
            native_time_resolution = consisted_resource_params.long_term_time_resolution
            model = LongTermHistoricalData

        self._validate_parameters_count(accepted_parameters)
        self._validate_time_resolution(native_time_resolution, time_resolution)

        return AggregationRules(
            params=accepted_parameters[0],
            model=model,
            native_time_resolution=native_time_resolution,
            resources=resources,
            time_resolution=time_resolution,
            from_=from_,
            to=to,
        )

    @staticmethod
    def _validate_parameters_count(accepted_parameters: List[AggregationParams]):
        if len(accepted_parameters) == 0:
            raise UnsupportedConditions("Aggregation parameters for this conditions doesn't exists!")

        if len(accepted_parameters) > 1:
            raise UnsupportedConditions(f'Duplicated aggregation parameters: "{accepted_parameters}"!')

    @staticmethod
    def _validate_time_resolution(native_time_resolution: TimeResolution, time_resolution: TimeResolution):
        if time_resolution and native_time_resolution != time_resolution and (
                native_time_resolution.duration > time_resolution.duration or
                not time_resolution.is_aggregatable
        ):
            raise UnsupportedConditions(
                f'Unsupported time resolution: "{native_time_resolution.value}" '
                f'can not be converted to "{time_resolution.value}"!'
            )

    @staticmethod
    def _select_history_type(
            consisted_resource_params: ConsistedResourceParams,
            time_resolution: TimeResolution,
            from_: datetime,
            to: datetime
    ) -> HistoryType:
        if not consisted_resource_params.detailed_time_resolution:
            return HistoryType.LONG_TERM

        if not consisted_resource_params.long_term_time_resolution:
            return HistoryType.DETAILED

        if time_resolution:
            if time_resolution.duration >= consisted_resource_params.long_term_time_resolution.duration:
                return HistoryType.LONG_TERM

            else:
                return HistoryType.DETAILED

        elif from_:
            to = to or datetime.now(tz=timezone.utc)

            if (to - from_) < consisted_resource_params.long_term_time_resolution.duration * 2:
                return HistoryType.DETAILED

        return HistoryType.LONG_TERM
