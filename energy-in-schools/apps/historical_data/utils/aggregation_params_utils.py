from datetime import timedelta

from sqlalchemy import case, func
from sqlalchemy.sql import sqltypes

from apps.historical_data.utils.aggregation_params_manager import AggregationRules, PreConverter


def combine(*funcs: PreConverter) -> PreConverter:
    def combined(time_field: sqltypes.DateTime, value_field: sqltypes.Float, aggregation_rules: AggregationRules):
        for function_ in funcs:
            value_field = function_(time_field, value_field, aggregation_rules)

        return value_field

    return combined


def to_kilo(_, value_field: sqltypes.Float, __):
    """Convert to kilo unit"""
    return value_field / 1000


def watts_to_watt_hours(_, value_field: sqltypes.Float, aggregation_rules: AggregationRules):
    return value_field * (aggregation_rules.native_time_resolution.duration / timedelta(hours=1))


def sum_func(_, value, __):
    return func.sum(value)


def count_func(_, value, __):
    return func.count(value)


def avg_func(_, value, __):
    return func.avg(value)


def zero_or_more(_, value, __):
    return func.greatest(0, value)


def one_if_equal(_, value, __, *, target_value):
    return case(((value == target_value, 1),), else_=0)
