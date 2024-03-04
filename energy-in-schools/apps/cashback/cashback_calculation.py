from datetime import datetime, timedelta, time
from typing import Tuple, Union, List

import pytz
from django.db.models import QuerySet
from django.db.transaction import atomic

from apps.learning_days.models import LearningDay
from apps.resources.models import Resource
from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.utils import aggregations
from apps.locations.models import Location
from apps.resources.types import ResourceDataNotAvailable, Unit

CASH_BACK_CACHE_TIME = timedelta(hours=6)


class _AvgConsumption:
    SCHOOL_DAY = 374.46
    NON_SCHOOL_DAY = 116.89


class _AdjustmentFactor:
    SCHOOL_DAY: float = 6.5
    NON_SCHOOL_DAY: float = 2.5


class FlatCashBackTariff:
    UNIT_RATE: float = 0.1321  # UNIT - pounds/kWh


class TOUCashBackTariffUnitRate:
    GREEN_UNIT_RATE: float = 0.08  # UNIT - pounds/kWh
    AMBER_UNIT_RATE: float = 0.115  # UNIT - pounds/kWh
    RED_UNIT_RATE: float = 0.3  # UNIT - pounds/kWh


class TOUCashBackTariffTimeRanges:
    GREEN_TIME_RANGES: Tuple[Tuple[time, time]] = (
        (time(0, 0, 0), time(7, 0, 0)),
    )

    AMBER_TIME_RANGES: Tuple[Tuple[time, time]] = (
        (time(7, 0, 0), time(16, 0, 0)),
        (time(19, 0, 0), time(23, 59, 59)),
    )

    RED_TIME_RANGES: Tuple[Tuple[time, time]] = (
        (time(16, 0, 0), time(19, 0, 0)),
    )


def _calculate_consumption_for_time_ranges(
        time_ranges: Tuple[Tuple[time, time]],
        resources: Union[QuerySet, List[Resource]],
        day: datetime.date,
        location_tz: datetime.tzinfo,
):
    resource_value = 0.0

    for time_range in time_ranges:
        try:
            resource_value += aggregations.aggregate_to_one(
                resources=resources,
                unit=Unit.KILOWATT_HOUR,
                from_=location_tz.localize(datetime.combine(day, time_range[0])),
                to=location_tz.localize(datetime.combine(day, time_range[1])),
            ).value

        except ResourceDataNotAvailable:
            pass

    return resource_value


@atomic
def calculate_daily_cash_back_for_location(
        location: Location,
        day: datetime.date,
):
    location_tz = pytz.timezone(location.timezone)
    from_ = location_tz.localize(datetime.combine(day, time()))
    to = location_tz.localize(datetime.combine(day + timedelta(days=1), time()))
    energy_meters = Resource.get_location_energy_meters(location, MeterType.ELECTRICITY)
    is_school_day = LearningDay.is_learning_day_by_default(from_.date())
    avg_consumption = _AvgConsumption.SCHOOL_DAY if is_school_day else _AvgConsumption.NON_SCHOOL_DAY
    adjustment_factor = _AdjustmentFactor.SCHOOL_DAY if is_school_day else _AdjustmentFactor.NON_SCHOOL_DAY

    try:
        day_total_consumption = aggregations.aggregate_to_one(
            resources=energy_meters,
            unit=Unit.KILOWATT_HOUR,
            from_=from_,
            to=to,
        ).value

    except ResourceDataNotAvailable:
        return 0.0

    if not day_total_consumption:  # if total 0
        return 0.0

    day_green_percent = \
        _calculate_consumption_for_time_ranges(
            TOUCashBackTariffTimeRanges.GREEN_TIME_RANGES, energy_meters, from_.date(), location_tz,
        ) / day_total_consumption

    day_amber_percent = \
        _calculate_consumption_for_time_ranges(
            TOUCashBackTariffTimeRanges.AMBER_TIME_RANGES, energy_meters, from_.date(), location_tz,
        ) / day_total_consumption

    day_red_percent = \
        _calculate_consumption_for_time_ranges(
            TOUCashBackTariffTimeRanges.RED_TIME_RANGES, energy_meters, from_.date(), location_tz,
        ) / day_total_consumption

    total = (avg_consumption * FlatCashBackTariff.UNIT_RATE) - (
            day_green_percent * TOUCashBackTariffUnitRate.GREEN_UNIT_RATE * avg_consumption
            + day_amber_percent * TOUCashBackTariffUnitRate.AMBER_UNIT_RATE * avg_consumption
            + day_red_percent * TOUCashBackTariffUnitRate.RED_UNIT_RATE * avg_consumption
    ) + adjustment_factor

    return total if total > 0.0 else 0.0
