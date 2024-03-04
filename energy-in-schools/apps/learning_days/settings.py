from datetime import date
from typing import NamedTuple


class Vacation(NamedTuple):
    from_: date
    to: date = None

    def is_vacation(self, a_date: date) -> bool:
        if self.to:
            return self.from_ <= a_date <= self.to
        else:
            return self.from_ == a_date


DEFAULT_VACATIONS = (
    # 2018-2019
    Vacation(date(2018, 10, 22), date(2018, 10, 26)),
    Vacation(date(2018, 11, 30)),
    Vacation(date(2018, 12, 3)),
    Vacation(date(2018, 12, 22), date(2019, 1, 7)),
    Vacation(date(2019, 1, 18), date(2019, 1, 22)),
    Vacation(date(2019, 4, 5), date(2019, 4, 23)),
    Vacation(date(2019, 5, 27), date(2019, 5, 31)),
    Vacation(date(2019, 6, 20), date(2019, 9, 2)),

    # 2019-2020
    Vacation(date(2019, 10, 21), date(2019, 10, 25)),
    Vacation(date(2019, 12, 20), date(2020, 1, 3)),
    Vacation(date(2020, 2, 17), date(2020, 2, 21)),
    Vacation(date(2020, 4, 6), date(2020, 4, 17)),
    Vacation(date(2020, 5, 8)),
    Vacation(date(2020, 5, 25), date(2020, 5, 29)),
    Vacation(date(2020, 6, 22), date(2020, 9, 2)),

    # todo add next values
    # 2020-2021
    # ...

)

"""
AUTUMN TERM 2018

INSET DAY - Monday 3rd September
RE-OPEN: Tuesday 4th September 2018
Half term: Monday 22 October - Friday 26 October 2018
INSET DAY - Friday 30th November
Holiday (school closed) - Monday 3rd December
Closure after school: Friday 21 December 2018


SPRING TERM 2019
Re-open    Monday 7 January 2019
Half term   Monday 18 February - Friday 22 February 2019
Closure after school   Friday 5 April 2019


EASTER 2019
Good Friday       19th April
Easter Monday   22nd April


SUMMER TERM 2019
Re-Open Tuesday 23 April 2019
May Day Holiday Monday 6 May 2019
Half Term  Monday 27 May- Friday 31 May 2019
Closure after school  Friday 19th July 2019
"""
