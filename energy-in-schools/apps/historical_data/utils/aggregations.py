from datetime import datetime, timedelta, timezone, tzinfo
from functools import partial
from typing import Callable, Iterable, Iterator, List, NamedTuple, Optional, Union, cast, Tuple

from aldjemy.orm import get_session
from django.db.models import QuerySet
from sqlalchemy import Column, DateTime, and_, or_, case, func, literal_column, extract
from sqlalchemy.orm import Query
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy_utcdatetime import UTCDateTime

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.historical_data.constants import LATEST_VALUE_AGGREGATION_TIME
from apps.historical_data.models import AbstractHistoricalData
from apps.historical_data.types import PeriodicConsumptionType, PeriodRange
from apps.historical_data.utils.aggregation_params_manager import AggregationOption, AggregationParamsManager, \
    AggregationRules
from apps.historical_data.utils.aggregation_params_utils import avg_func
from apps.historical_data.utils.sqlalchemy_functions import TruncDateTime
from apps.resources.models import Resource
from apps.resources.types import AlwaysOnValue, BoundaryValue, ResourceDataNotAvailable, ResourceValue, TimeResolution, \
    Unit
from apps.smart_things_sensors.models import SmartThingsEnergyMeter


class TimeValuePair(NamedTuple):
    time: datetime
    value: float


class TimeValueWithComparison(NamedTuple):
    time: datetime
    value: Optional[float]
    cmp_value: Optional[float]


Resources = Union[QuerySet, List[Resource], List[int]]


def aggregate_to_list(
        aggregation_rules: AggregationRules,
) -> Union[Iterable[TimeValuePair], Query]:
    """
    ATTENTION: real type of the result in Iterable[result] but it have the same structure
    You can write get_aggregated(...).one() for getting exactly one element

    :param aggregation_rules:
    :return:
    """

    aggregate_by_time_query = get_aggregate_by_time_query(
        aggregation_rules=aggregation_rules
    )

    query: Query = get_aggregate_to_list_query(
        aggregate_by_time_query=aggregate_by_time_query,
        aggregation_rules=aggregation_rules,
    )

    return query


def get_always_on(
        resources: Resources,
        from_: datetime = None,
        to: datetime = None
) -> AlwaysOnValue:
    """
    :param resources:
    :param from_: inclusive
    :param to: not inclusive
    :return:
    """
    always_on_start_hour = 1
    always_on_end_hour = 3

    aggregation_rules = AggregationParamsManager().get_aggregation_rules(
        resources=resources,
        unit=Unit.WATT,
        time_resolution=TimeResolution.HOUR,
        from_=from_,
        to=to,
    )

    aggregate_by_time_query = get_aggregate_by_time_query(
        aggregation_rules=aggregation_rules,
    )

    filtered_between_hours = aggregate_by_time_query.filter(
        func.date_part('hour', literal_column('time')).between(always_on_start_hour, always_on_end_hour)
    )

    always_on_by_resource: Query = get_session().query(
        func.avg(literal_column('sub.value')).label('always_on_by_resource')
    ).select_from(
        filtered_between_hours.subquery('sub')
    ).group_by(
        'resource_id'
    )

    always_on_query: Query = get_session().query(
        func.sum(literal_column('sub.always_on_by_resource')).label('value')
    ).select_from(
        always_on_by_resource.subquery('sub')
    )

    result = always_on_query.scalar()

    if result is None:
        raise ResourceDataNotAvailable

    return AlwaysOnValue(
        value=result,
        unit=Unit.WATT,
    )


def get_boundary_live_data(
        resources: Resources,
        unit: Unit,
        duration: timedelta = LATEST_VALUE_AGGREGATION_TIME
) -> Iterable[BoundaryValue]:
    aggregation_rules = AggregationParamsManager().get_aggregation_rules(
        resources=resources,
        unit=unit,
        from_=datetime.now(tz=timezone.utc) - duration,
    )

    try:
        sensors_by_live_value_asc = get_aggregate_by_time_query(
            aggregation_rules=aggregation_rules,
        ).order_by('value').all()  # this should not be a problem cuz sensor number in location is not big
    except NoResultFound as exception:
        raise ResourceDataNotAvailable from exception

    if len(sensors_by_live_value_asc) == 0:
        raise ResourceDataNotAvailable

    min_value, max_value = sensors_by_live_value_asc[0], sensors_by_live_value_asc[-1]

    return [
        BoundaryValue(
            resource_id=min_value.resource_id,
            value=ResourceValue(
                time=min_value.time,
                value=min_value.value,
                unit=aggregation_rules.params.target_unit
            ),
        ),
        BoundaryValue(
            resource_id=max_value.resource_id,
            value=ResourceValue(
                time=max_value.time,
                value=max_value.value,
                unit=aggregation_rules.params.target_unit
            ),
        )
    ]


def get_periodic_data(
        resources: Resources,
        unit: Unit,
        period: PeriodicConsumptionType,
) -> Iterable:

    aggregation_rules = AggregationParamsManager().get_aggregation_rules(
        resources=resources,
        unit=unit,
        time_resolution=TimeResolution.HOUR,
        from_=datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=365),
    )

    try:
        period_ranges = _get_current_period_date_ranges(period.period_range, datetime.now(timezone.utc))
        time_field = Column(key='sub.time', name='time', type_=UTCDateTime(timezone=True))

        aggregate_by_time_query = get_aggregate_by_time_query(aggregation_rules).filter(
            extract('dow', time_field).in_(period.days),
            or_(
                *((time_field.between(period_range[0], period_range[1]) for period_range in period_ranges))
            ),
        )

        result_query = get_session().query(
            extract('hour', time_field).label('hour'),
            avg_func(
                time_field,
                literal_column('sub.value'),
                aggregation_rules,
            ).label('value')
        ).select_from(
            aggregate_by_time_query.subquery('sub')
        ).group_by(
            'hour'
        ).order_by(
            'hour'
        ).all()

    except NoResultFound as exception:
        raise ResourceDataNotAvailable from exception

    if len(result_query) == 0:
        raise ResourceDataNotAvailable

    return result_query


def get_aggregate_to_list_query(
        aggregate_by_time_query: Query,
        aggregation_rules: AggregationRules,
) -> Query:
    pre_processed_query = aggregation_rules \
        .params \
        .by_resources_step_pre_process_query(aggregate_by_time_query, aggregation_rules)

    time_field = Column(key='sub.time', name='time', type_=UTCDateTime(timezone=True))
    return get_session().query(
        time_field.label('time'),
        aggregation_rules.params.aggregate_by_resources(
            time_field,
            literal_column('sub.value'),
            aggregation_rules,
        ).label('value')
    ).select_from(
        pre_processed_query.subquery('sub')
    ).group_by(
        'time'
    ).order_by(
        'time'
    )


def _get_row_time_zone_converter(tz_info: tzinfo):
    if tz_info.utcoffset(None):
        return lambda row: TimeValuePair(
            time=row.time.astimezone(tz_info),
            value=row.value,
        )

    return lambda row: row


def _get_time_zone_converter(tz_info: tzinfo):
    if tz_info.utcoffset(None):
        return lambda time: time.astimezone(tz_info)

    return lambda time: time


def aggregate_to_list_with_comparison(
        aggregation_rules: AggregationRules,
        compare_from: datetime,
        compare_to: datetime,
        comparison_cut: TimeResolution = None
) -> Iterator[TimeValueWithComparison]:  # todo: test performance (numba can be used)
    """
    Merge two queries with different `from` and `to` by time with replaced year/month/day

    :param aggregation_rules:
    :param compare_from:
    :param compare_to:
    :param comparison_cut:
        cut datetime for merging
        e. g.: month means cutting to 0000-00-12 34:56
        can be calculated automatically
    :return:
    """
    convert_row_time_zone = _get_row_time_zone_converter(aggregation_rules.tz_info)
    convert_compare_row_time_zone = _get_row_time_zone_converter(compare_from.tzinfo)
    convert_time_zone = _get_time_zone_converter(aggregation_rules.tz_info)

    left_query_iter = iter(map(convert_row_time_zone, aggregate_to_list(aggregation_rules=aggregation_rules)))
    right_query_iter = iter(map(convert_compare_row_time_zone, aggregate_to_list(aggregation_rules=aggregation_rules._replace(
        from_=compare_from,
        to=compare_to,
    ))))

    comparison_cut = comparison_cut or _find_comparison_cut(compare_to - compare_from)
    cut_datetime = _get_comparison_datetime_cutter(comparison_cut, aggregation_rules.from_)

    left: AbstractHistoricalData = next(left_query_iter, None)
    right: AbstractHistoricalData = next(right_query_iter, None)
    right_cut_time = cut_datetime(right.time) if right else None
    next_left = left

    while left or right:
        row = dict(time=None, value=None, cmp_value=None)

        if left and (right is None or left.time <= right_cut_time):
            row['time'] = left.time
            row['value'] = left.value
            next_left = next(left_query_iter, None)

        if right and (left is None or left.time >= right_cut_time):
            row['time'] = right_cut_time
            row['cmp_value'] = right.value
            right = next(right_query_iter, None)
            right_cut_time = cut_datetime(right.time) if right else None

        left = next_left

        yield TimeValueWithComparison(
            time=convert_time_zone(row['time']),
            value=row['value'],
            cmp_value=row['cmp_value'],
        )


def aggregate_to_one(
        resources: Resources,
        unit: Unit,
        from_: datetime = None,
        to: datetime = None,
        aggregation_option: AggregationOption = None
) -> ResourceValue:
    aggregation_rules = AggregationParamsManager().get_aggregation_rules(
        resources=resources,
        unit=unit,
        from_=from_,
        to=to,
        aggregation_option=aggregation_option
    )

    try:
        aggregated_by_meters_query = get_aggregate_by_time_query(
            aggregation_rules=aggregation_rules,
        )
        query = get_aggregated_to_one_query(
            aggregated_by_meters_query=aggregated_by_meters_query,
            aggregation_rules=aggregation_rules
        )
        result: TimeValuePair = query.one()

    except NoResultFound as exception:
        raise ResourceDataNotAvailable from exception

    if result.time is None:
        raise ResourceDataNotAvailable

    return ResourceValue(
        **result._asdict(),
        unit=aggregation_rules.params.target_unit
    )


def aggregate_latest_value(
        resources: Resources,
        unit: Unit,
        duration: timedelta = LATEST_VALUE_AGGREGATION_TIME
) -> ResourceValue:
    return aggregate_to_one(
        resources=resources,
        unit=unit,
        from_=datetime.now(tz=timezone.utc) - duration
    )


def get_aggregated_to_one_query(
        aggregated_by_meters_query: Query,
        aggregation_rules: AggregationRules
) -> Query:
    pre_processed_query = aggregation_rules \
        .params \
        .by_resources_step_pre_process_query(aggregated_by_meters_query, aggregation_rules)

    time_field = Column(key='sub.time', name='time', type_=UTCDateTime(timezone=True))

    query: Query = get_session().query(
        func.max(time_field).label('time'),
        aggregation_rules.params.aggregate_by_resources(
            time_field,
            literal_column('sub.value'),
            aggregation_rules
        ).label('value')
    ).select_from(
        pre_processed_query.subquery('sub')
    )
    return query


def get_aggregate_by_time_query(
        aggregation_rules: AggregationRules,
):
    resources = [resource.id for resource in aggregation_rules.resources]
    sa_model = aggregation_rules.model.sa

    trunc_function = _get_time_trunc_function(aggregation_rules.time_resolution, aggregation_rules.tz_info)

    pre_processed_query = aggregation_rules.params.by_times_step_pre_process_query(
        sa_model,
        aggregation_rules,
        sa_model.resource_id,
        sa_model.time,
        sa_model.value,
    )

    if pre_processed_query is sa_model:  # without pre processing query
        time_field = sa_model.time
        value_field = sa_model.value
        resource_id_field = sa_model.resource_id

    else:  # with pre processing query
        time_field = literal_column('pre_processed.time')
        value_field = literal_column('pre_processed.value')
        resource_id_field = literal_column('pre_processed.resource_id')
        pre_processed_query = pre_processed_query.subquery('pre_processed')

    query = get_session().query(
        trunc_function(time_field).label('time'),
        resource_id_field.label('resource_id'),
        aggregation_rules.params.aggregate_by_time(
            time_field,
            aggregation_rules.params.pre_converter(time_field, value_field, aggregation_rules),
            aggregation_rules,
        ).label('value'),
        *aggregation_rules.params.get_by_time_step_extra_fields(time_field, value_field, aggregation_rules),
    ).select_from(
        pre_processed_query
    ).group_by(
        resource_id_field,
        *((trunc_function(time_field).label('time'),) if aggregation_rules.time_resolution else ()),
    ).filter(
        resource_id_field.in_(resources),
        *((time_field >= aggregation_rules.from_,) if aggregation_rules.from_ else ()),
        *((time_field < aggregation_rules.to,) if aggregation_rules.to else ()),
    )

    for model in aggregation_rules.params.models_to_join:

        if model == EnergyProviderAccount:
            query = query.outerjoin(
                model.sa,
                case((
                    (Resource.sa.child_type == Resource.ChildType.ENERGY_METER.value, EnergyMeter.sa.provider_account),
                    (Resource.sa.child_type == Resource.ChildType.SMART_THINGS_ENERGY_METER.value,
                     SmartThingsEnergyMeter.sa.provider_account),
                )),
            )

        else:
            query = query.outerjoin(model.sa)

    query = aggregation_rules.params.join_extra_models(
        query,
        aggregation_rules,
        resource_id_field,
        time_field,
        value_field
    )

    return query


def _get_comparison_datetime_cutter(
        comparison_cut: TimeResolution,
        datetime_source: datetime
) -> Callable[[datetime], datetime]:
    if comparison_cut is TimeResolution.WEEK:
        return lambda date: date.replace(
            year=datetime_source.year,
            month=datetime_source.month,
            day=datetime_source.day,
            tzinfo=datetime_source.tzinfo
        ) + timedelta(days=date.weekday() - datetime_source.weekday())

    elif comparison_cut is TimeResolution.MONTH:
        return lambda date: date.replace(
            year=datetime_source.year,
            month=datetime_source.month,
            day=1,
            tzinfo=datetime_source.tzinfo
        ) + timedelta(days=date.day - 1)

    else:  # TimeResolution.DAY and TimeResolution.YEAR
        replace_dict = {'year': datetime_source.year}

        if comparison_cut is TimeResolution.DAY:
            replace_dict['month'] = datetime_source.month
            replace_dict['day'] = datetime_source.day

        # `cast` it is just a hint for type checker
        return cast(Callable[[datetime], datetime], partial(datetime.replace, **replace_dict))


def _find_comparison_cut(comparison_offset: timedelta) -> TimeResolution:
    for comparison_cut in (
            TimeResolution.DAY,
            TimeResolution.WEEK,
            TimeResolution.MONTH,
            TimeResolution.YEAR,
    ):
        if comparison_offset <= comparison_cut.duration:
            break

    return comparison_cut


def _get_time_trunc_function(time_resolution: TimeResolution, tz_info: tzinfo):
    if time_resolution is None:
        trunc_function = func.max

    elif time_resolution.is_aggregatable:
        if tz_info and tz_info.utcoffset(None):
            def trunc_function(time_field: DateTime):
                """
                we have date:1, time:23, tz:+00 and want to truncate date for UTC+2

                23+00 =>(to +2) 2 01 =>(trunc) 2 00 =>(to utc) 1 22+00
                """

                # todo: make it in better way
                total_seconds = -tz_info.utcoffset(None).total_seconds()
                hours, total_seconds = divmod(total_seconds, 60 * 60)
                minutes = total_seconds // 60
                offset_str = f'UTC{int(hours):+d}:{abs(int(minutes))}'

                return TruncDateTime(
                    time_resolution.value,
                    time_field.op('AT TIME ZONE')(offset_str)
                ).op('AT TIME ZONE')(offset_str)

        else:
            trunc_function = partial(TruncDateTime, time_resolution.value)

    else:
        def trunc_function(time_field):
            return time_field

    return trunc_function


def _get_current_period_date_ranges(
        period_range: PeriodRange,
        current_datetime: datetime,
) -> List[Tuple[datetime, datetime]]:

    from_ = current_datetime.replace(month=period_range.from_.month, day=period_range.from_.day)
    to = current_datetime.replace(month=period_range.to.month, day=period_range.to.day)
    second_pair = None

    if current_datetime < from_:
        from_ = from_.replace(year=from_.year - 1)
        to = to.replace(year=to.year - 1)

    if to < from_:  # Case with winter period
        to = to.replace(year=to.year + 1)

    if current_datetime < to:
        second_pair = (current_datetime.replace(year=current_datetime.year - 1), to.replace(to.year - 1))
        to = current_datetime

    return [(from_, to)] if not second_pair else [(from_, to), second_pair]
