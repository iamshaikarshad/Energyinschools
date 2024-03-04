import datetime
from typing import Any, Tuple

from aldjemy.orm import get_session
from sqlalchemy import and_, extract, func, literal_column, or_, case, any_, cast
from sqlalchemy.orm import Query, aliased
from sqlalchemy.sql import sqltypes

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_tariffs.models import EnergyTariff
from apps.historical_data.utils.aggregation_params_manager import AggregationOption, AggregationParamsManager, \
    AggregationRules
from apps.historical_data.utils.aggregations import get_aggregate_by_time_query
from apps.historical_data.utils.sqlalchemy_functions import get_days_between, get_days_in_month, get_days_in_year, \
    get_months_between
from apps.locations.models import Location
from apps.resources.types import TimeResolution, Unit
from apps.resources.models import Resource
from apps.smart_things_sensors.models import SmartThingsEnergyMeter


class FieldAlias:
    CASH_BACK_TARIFF = 'cash_back_tariff'
    CASH_BACK_TOU = 'cash_back_tou'
    NORMAL_TARIFF = 'normal_tariff'

    DAILY_FIXED_COST = 'daily_fixed_cost'
    MONTHLY_FIXED_COST = 'monthly_fixed_cost'

    MIN_TIME = 'min_time'
    MAX_TIME = 'max_time'

    ENERGY_PROVIDER_ACCOUNT_ID = 'energy_provider_account_id'
    LOCATION_TABLE = Location._meta.db_table


class CostAggregationOption(AggregationOption):
    WATT_HOUR_COST = 'watt_hour_cost', False
    FULL_COST = 'full_cost', True
    CASH_BACK = 'cash_back', False
    CASH_BACK_SUB_QUERY = 'cash_back_sub_query', False


def _calculate_cost_per_watt_hour(
        value_field: sqltypes.Float,
        model_alias_label: str = FieldAlias.NORMAL_TARIFF
):
    """
    tariff_pre_process_query give warranty that input data fot this function
    have time resolution one_hour and unit watt_hour
    """
    return value_field * literal_column(f'{model_alias_label}.watt_hour_cost')


def calculate_watt_hour_cost(_: sqltypes.DateTime, value_field: sqltypes.Float, __):
    return _calculate_cost_per_watt_hour(value_field)


def calculate_watt_hour_cash_back(_: sqltypes.DateTime, value_field: sqltypes.Float, __):
    return _calculate_cost_per_watt_hour(value_field, FieldAlias.CASH_BACK_TARIFF) \
           - _calculate_cost_per_watt_hour(value_field, FieldAlias.CASH_BACK_TOU)


def get_fixed_price_cost_fields(time_field: sqltypes.DateTime, _, __) -> Tuple[Any, ...]:
    daily_fixed_cost_field = literal_column(f'{FieldAlias.NORMAL_TARIFF}.{FieldAlias.DAILY_FIXED_COST}')
    monthly_fixed_cost_field = literal_column(f'{FieldAlias.NORMAL_TARIFF}.{FieldAlias.MONTHLY_FIXED_COST}')

    return (
        func.min(time_field).label(FieldAlias.MIN_TIME),
        func.max(time_field).label(FieldAlias.MAX_TIME),

        # avg doesn't matter - there is only one value:
        func.avg(daily_fixed_cost_field).label(FieldAlias.DAILY_FIXED_COST),
        func.avg(monthly_fixed_cost_field).label(FieldAlias.MONTHLY_FIXED_COST),
        func.avg(EnergyProviderAccount.sa.id).label(FieldAlias.ENERGY_PROVIDER_ACCOUNT_ID)
    )


def aggregate_tariff_by_resources(
        time_field: sqltypes.DateTime,
        value_field: sqltypes.Float,
        aggregation_rules: AggregationRules
) -> sqltypes.Float:
    alias = 'sub'
    min_time_field = literal_column(f'{alias}.{FieldAlias.MIN_TIME}')
    max_time_field = literal_column(f'{alias}.{FieldAlias.MAX_TIME}')
    daily_fixed_cost_field = literal_column(f'{alias}.{FieldAlias.DAILY_FIXED_COST}')
    monthly_fixed_cost_field = literal_column(f'{alias}.{FieldAlias.MONTHLY_FIXED_COST}')

    if aggregation_rules.time_resolution is None:
        return func.sum(
            value_field +
            daily_fixed_cost_field * get_days_between(min_time_field, max_time_field, True) +
            monthly_fixed_cost_field * get_months_between(min_time_field, max_time_field, True)
        )
    elif aggregation_rules.time_resolution is TimeResolution.YEAR:
        return func.sum(
            value_field +
            daily_fixed_cost_field * get_days_in_year(time_field) +
            monthly_fixed_cost_field * 12
        )
    elif aggregation_rules.time_resolution is TimeResolution.MONTH:
        return func.sum(
            value_field +
            daily_fixed_cost_field * get_days_in_month(time_field) +
            monthly_fixed_cost_field
        )
    elif aggregation_rules.time_resolution is TimeResolution.DAY:
        return func.sum(
            value_field +
            daily_fixed_cost_field
        )
    else:
        return func.sum(value_field)


def get_daily_cash_back(
        _: Query,
        aggregation_rules: AggregationRules,
        *__,
) -> Query:
    """
    Convert any data to data with time resolution one_hour and unit watt_hour.
    """
    # noinspection PyTypeChecker
    return get_aggregate_by_time_query(
        aggregation_rules=AggregationParamsManager().get_aggregation_rules(
            resources=aggregation_rules.resources,
            unit=Unit.POUND_STERLING,
            time_resolution=TimeResolution.DAY,
            from_=aggregation_rules.from_,
            to=aggregation_rules.to,
            aggregation_option=CostAggregationOption.CASH_BACK_SUB_QUERY,
        )
    )


def tariff_by_resources_step_pre_process_query(
        query: Query,
        _: AggregationRules,
) -> Query:
    alias = 'by_resources_step_pre_process'
    daily_fixed_cost_field = literal_column(f'{alias}.{FieldAlias.DAILY_FIXED_COST}')
    monthly_fixed_cost_field = literal_column(f'{alias}.{FieldAlias.MONTHLY_FIXED_COST}')
    time_field = literal_column(f'{alias}.time')
    min_time_field = literal_column(f'{alias}.{FieldAlias.MIN_TIME}')
    max_time_field = literal_column(f'{alias}.{FieldAlias.MAX_TIME}')
    value_field = literal_column(f'{alias}.value')
    energy_provider_account_id_field = literal_column(f'{alias}.{FieldAlias.ENERGY_PROVIDER_ACCOUNT_ID}')

    return get_session().query(
        # avg doesn't matter - there is only one value:
        func.avg(daily_fixed_cost_field).label(FieldAlias.DAILY_FIXED_COST),
        func.avg(monthly_fixed_cost_field).label(FieldAlias.MONTHLY_FIXED_COST),

        time_field.label('time'),
        func.min(min_time_field).label(FieldAlias.MIN_TIME),
        func.max(max_time_field).label(FieldAlias.MAX_TIME),
        func.sum(value_field).label('value'),
    ).select_from(
        query.subquery(alias)
    ).group_by(
        energy_provider_account_id_field,
        time_field,
    )


def join_tariff_model(
        query: Query,
        resource_id_field: sqltypes.Integer,
        time_field: sqltypes.DateTime,
        model_alias_label: str = FieldAlias.NORMAL_TARIFF,
        energy_tariff_type: EnergyTariff.Type = EnergyTariff.Type.NORMAL,
) -> Query:
    model_alias = aliased(EnergyTariff.sa, name=model_alias_label)
    tariff_type_field = literal_column(f'{model_alias_label}.type')
    tariff_provider_account_id_field = literal_column(f'{model_alias_label}.provider_account_id')
    tariff_resource_id_field = literal_column(f'{model_alias_label}.resource_id')
    tariff_meter_type_field = literal_column(f'{model_alias_label}.meter_type')
    tariff_active_time_start_field = literal_column(f'{model_alias_label}.active_time_start')
    tariff_active_time_end_field = literal_column(f'{model_alias_label}.active_time_end')
    tariff_active_date_start_field = literal_column(f'{model_alias_label}.active_date_start')
    tariff_active_date_end_field = literal_column(f'{model_alias_label}.active_date_end')
    tariff_active_days_in_week = literal_column(f'{model_alias_label}.active_days_in_week')
    timezone_field = literal_column(f'{FieldAlias.LOCATION_TABLE}.timezone')

    return query.join(
        model_alias,
        and_(
            tariff_type_field == energy_tariff_type.value,
            tariff_meter_type_field == case((
                (Resource.sa.child_type == Resource.ChildType.ENERGY_METER.value, EnergyMeter.sa.type),
                (Resource.sa.child_type == Resource.ChildType.SMART_THINGS_ENERGY_METER.value, SmartThingsEnergyMeter.sa.type),
            )),
            tariff_active_date_start_field <= func.date(time_field),
            or_(
                tariff_provider_account_id_field == EnergyProviderAccount.sa.id,
                tariff_resource_id_field == resource_id_field,
            ),
            or_(
                tariff_active_date_end_field.is_(None),
                func.date(time_field) <= tariff_active_date_end_field,
            ),
            or_(
                tariff_active_days_in_week.is_(None),
                tariff_active_days_in_week == "{}",
                extract('dow', time_field.op('AT TIME ZONE')(timezone_field)) == any_(tariff_active_days_in_week),
            ),
            or_(
                and_(
                    tariff_active_time_end_field.is_(None),
                    tariff_active_time_start_field <= cast(time_field.op('AT TIME ZONE')(timezone_field),
                                                           sqltypes.Time),
                ),
                and_(
                    tariff_active_time_start_field < tariff_active_time_end_field,
                    tariff_active_time_start_field <= cast(time_field.op('AT TIME ZONE')(timezone_field), sqltypes.Time),
                    cast(time_field.op('AT TIME ZONE')(timezone_field), sqltypes.Time) < tariff_active_time_end_field,
                ),
                and_(
                    tariff_active_time_end_field < tariff_active_time_start_field,
                    or_(
                        and_(
                            tariff_active_time_start_field <= cast(time_field.op('AT TIME ZONE')(timezone_field),
                                                                   sqltypes.Time),
                            tariff_active_time_end_field < cast(time_field.op('AT TIME ZONE')(timezone_field),
                                                                   sqltypes.Time),
                        ),
                        and_(
                            cast(time_field.op('AT TIME ZONE')(timezone_field),
                                 sqltypes.Time) < tariff_active_time_end_field,
                            cast(time_field.op('AT TIME ZONE')(timezone_field),
                                 sqltypes.Time) <= tariff_active_time_start_field,
                        )
                    )
                )
            )
        )
    )


def join_normal_tariff(
        query: Query,
        _: AggregationRules,
        resource_id_field: sqltypes.Integer,
        time_field: sqltypes.DateTime,
        ___: sqltypes.Float,
) -> Query:
    return join_tariff_model(query, resource_id_field, time_field)


def join_cash_back_tariff(
        query: Query,
        _: AggregationRules,
        resource_id_field: sqltypes.Integer,
        time_field: sqltypes.DateTime,
        ___: sqltypes.Float,
) -> Query:  # TODO: Deprecated
    query = join_tariff_model(
        query,
        resource_id_field,
        time_field,
        FieldAlias.CASH_BACK_TARIFF,
        EnergyTariff.Type.CASH_BACK_TARIFF,
    )
    query = join_tariff_model(
        query,
        resource_id_field,
        time_field,
        FieldAlias.CASH_BACK_TOU,
        EnergyTariff.Type.CASH_BACK_TOU,
    )

    return query
