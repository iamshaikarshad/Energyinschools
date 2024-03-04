from datetime import time, timezone
from typing import NamedTuple, List, Optional

from apps.historical_data.types import Week


class TariffRateActiveHours(NamedTuple):
    start: time
    end: time
    days_in_week: Week


class TariffRate(NamedTuple):
    name: str
    active_periods: List[TariffRateActiveHours]


class EnergyTariff(NamedTuple):
    DAY: TariffRate
    NIGHT: Optional[TariffRate] = None
    EVENING_AND_WEEKEND: Optional[TariffRate] = None
    PEAK: Optional[TariffRate] = None

    def getattr(self, attr_name):
        return self.__getattribute__(attr_name)


def get_24_hours_rate(active_days):
    return TariffRateActiveHours(
        start=time(0, 0, 0, 0, timezone.utc),
        end=time(23, 59, 0, 0, timezone.utc),
        days_in_week=active_days
    )


def get_standard_day_rate_hours(active_days):
    return TariffRateActiveHours(
        start=time(7, 0, 0, 0, timezone.utc),
        end=time(0, 0, 0, 0, timezone.utc),
        days_in_week=active_days
    )


def get_standard_night_rate_hours(active_days):
    return TariffRateActiveHours(
        start=time(0, 0, 0, 0, timezone.utc),
        end=time(7, 0, 0, 0, timezone.utc),
        days_in_week=active_days
    )


SingleTariff = EnergyTariff(
    DAY=TariffRate(
        name='Day',
        active_periods=[get_24_hours_rate(Week.ALL_DAYS_IN_WEEK)]
    )
)

DayNightTariff = EnergyTariff(
    DAY=TariffRate(
        name='Day',
        active_periods=[get_standard_day_rate_hours(Week.ALL_DAYS_IN_WEEK)]
    ),
    NIGHT=TariffRate(
        name='Night',
        active_periods=[get_standard_night_rate_hours(Week.ALL_DAYS_IN_WEEK)]
    )
)

DayEveningWeekendTariff = EnergyTariff(
    DAY=TariffRate(
        name='Day',
        active_periods=[
            TariffRateActiveHours(
                start=time(7, 0, 0, 0, timezone.utc),
                end=time(19, 0, 0, 0, timezone.utc),
                days_in_week=Week.WEEKDAYS
            )
        ],
    ),
    EVENING_AND_WEEKEND=TariffRate(
        name='Evening/Weekend',
        active_periods=[
            TariffRateActiveHours(
                start=time(19, 0, 0, 0, timezone.utc),
                end=time(7, 0, 0, 0, timezone.utc),
                days_in_week=Week.WEEKDAYS
            ), TariffRateActiveHours(
                start=time(0, 0, 0, 0, timezone.utc),
                end=time(0, 0, 0, 0, timezone.utc),
                days_in_week=Week.WEEKENDS
            )
        ],
    )
)

DayNightEveningWeekendTariff = EnergyTariff(
    DAY=TariffRate(
        name='Day',
        active_periods=[
            TariffRateActiveHours(
                start=time(7, 0, 0, 0, timezone.utc),
                end=time(19, 0, 0, 0, timezone.utc),
                days_in_week=Week.WEEKDAYS
            )
        ],
    ),
    NIGHT=TariffRate(
        name='Night',
        active_periods=[get_standard_night_rate_hours(Week.ALL_DAYS_IN_WEEK)],
    ),
    EVENING_AND_WEEKEND=TariffRate(
        name='Evening/Weekend',
        active_periods=[
            TariffRateActiveHours(
                start=time(19, 0, 0, 0, timezone.utc),
                end=time(0, 0, 0, 0, timezone.utc),
                days_in_week=Week.WEEKDAYS
            ),
            TariffRateActiveHours(
                start=time(7, 0, 0, 0, timezone.utc),
                end=time(0, 0, 0, 0, timezone.utc),
                days_in_week=Week.WEEKENDS
            )
        ],
    )
)

SchoolTOUTariff = EnergyTariff(
    DAY=TariffRate(
        name='Day',
        active_periods=[
            TariffRateActiveHours(
                start=time(7, 0, 0, 0, timezone.utc),
                end=time(16, 0, 0, 0, timezone.utc),
                days_in_week=Week.ALL_DAYS_IN_WEEK
            ),
            TariffRateActiveHours(
                start=time(19, 0, 0, 0, timezone.utc),
                end=time(23, 59, 0, 0, timezone.utc),
                days_in_week=Week.ALL_DAYS_IN_WEEK
            )
        ],
    ),
    NIGHT=TariffRate(
        name='Night',
        active_periods=[get_standard_night_rate_hours(Week.ALL_DAYS_IN_WEEK)],
    ),
    PEAK=TariffRate(
        name='Peak',
        active_periods=[
            TariffRateActiveHours(
                start=time(16, 0, 0, 0, timezone.utc),
                end=time(19, 0, 0, 0, timezone.utc),
                days_in_week=Week.ALL_DAYS_IN_WEEK
            )
        ]
    )
)
