from datetime import datetime
from typing import Union

from sqlalchemy import Interval, cast, func
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql import sqltypes
from sqlalchemy.sql.expression import FunctionElement


AnyDateTime = Union[sqltypes.DateTime, datetime]


class TruncDateTime(FunctionElement):
    __visit_name__ = 'notacolumn'
    name = 'apps.TruncDateTime'
    type = sqltypes.DateTime(timezone=True)

    def __init__(self, precision, expr, **kwargs):
        super().__init__(precision, expr, **kwargs)
        self.precision = precision
        self.expr = expr


@compiles(TruncDateTime, 'sqlite')
def trunc_date_time_sqlite(element, compiler, **kw):
    return compiler.process(func.django_datetime_trunc(element.precision, element.expr, 'UTC'))


@compiles(TruncDateTime, 'postgresql')
def trunc_date_time_postgresql(element, compiler, **kw):
    return compiler.process(func.date_trunc(element.precision, element.expr))


def get_days_in_month(time_field: AnyDateTime):
    return func.date_part('day', (TruncDateTime('month', time_field)
                                  + cast('1 month', Interval)
                                  - cast('1 day', Interval)))


def get_days_in_year(time_field: AnyDateTime):
    return func.date_part('day', (TruncDateTime('year', time_field)
                                  + cast('1 year', Interval)
                                  - TruncDateTime('year', time_field)))


def get_days_between(from_: AnyDateTime, to: AnyDateTime, round_up: bool = False) -> sqltypes.Integer:
    return func.date_part('day', (to + cast(f'{12 if round_up else 0} hours', Interval) - from_))


def get_months_between(from_: AnyDateTime, to: AnyDateTime, round_up: bool = False) -> sqltypes.Integer:
    return func.date_part('month', func.age(to + cast(f'{14 if round_up else 0} days', Interval), from_)) + \
           12 * func.date_part('year', func.age(to + cast(f'{14 if round_up else 0} days', Interval), from_))
