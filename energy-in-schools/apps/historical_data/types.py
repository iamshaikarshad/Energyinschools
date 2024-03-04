from typing import Tuple, NamedTuple

from enumfields import Enum


class DayMonth(NamedTuple):
    day: int
    month: int


class PeriodRange(NamedTuple):
    from_: DayMonth
    to: DayMonth


WEEKENDS = (0, 6)
WEEKDAYS = (1, 2, 3, 4, 5)
ALL_DAYS_IN_WEEK = tuple(i for i in range(7))
SUMMER_RANGE = PeriodRange(from_=DayMonth(month=4, day=1), to=DayMonth(month=9, day=30))
WINTER_RANGE = PeriodRange(from_=DayMonth(month=10, day=1), to=DayMonth(month=3, day=31))


class Week(Enum):
    WEEKENDS = 'weekends', WEEKENDS
    WEEKDAYS = 'weekdays', WEEKDAYS
    ALL_DAYS_IN_WEEK = 'all_days', ALL_DAYS_IN_WEEK

    def __new__(cls, value, days):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._days_ = days
        return obj

    @property
    def days(self) -> Tuple[int]:
        return self._days_


class PeriodicConsumptionType(Enum):
    SUMMER_WEEKENDS = 'summer_weekends', WEEKENDS, SUMMER_RANGE
    SUMMER_WEEKDAYS = 'summer_weekdays', WEEKDAYS, SUMMER_RANGE
    WINTER_WEEKENDS = 'winter_weekends', WEEKENDS, WINTER_RANGE
    WINTER_WEEKDAYS = 'winter_weekdays', WEEKDAYS, WINTER_RANGE

    def __new__(cls, value, days, period_range):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._days_ = days
        obj._period_range_ = period_range
        return obj

    @property
    def days(self) -> Tuple[int]:
        return self._days_

    @property
    def period_range(self) -> PeriodRange:
        return self._period_range_
