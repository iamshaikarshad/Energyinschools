from datetime import datetime, timedelta
from typing import Callable, List, Optional, Union

from cacheops import cached
from django.db.models import QuerySet

from apps.locations.models import Location
from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.utils.aggregations import aggregate_latest_value, aggregate_to_one
from apps.leaderboard.views.leaderboard import get_always_on_for_locations
from apps.leaderboard.serializers import LeaguePointsUnit
from apps.resources.models import Resource, Unit
from apps.resources.types import ResourceDataNotAvailable

LIVE_VALUE_LEAGUE_CACHE_TIMEOUT = int(timedelta(minutes=30).total_seconds())
YESTERDAY_VALUE_LEAGUE_CACHE_TIMEOUT = int(timedelta(hours=1).total_seconds())


@cached(timeout=LIVE_VALUE_LEAGUE_CACHE_TIMEOUT)
def _get_live_electricity_usage_for_location(location: Location) -> Optional[float]:
    location_meters = Resource.get_location_energy_meters(location, MeterType.ELECTRICITY)
    try:
        return aggregate_latest_value(location_meters, unit=Unit.WATT).value
    except ResourceDataNotAvailable:
        return None


@cached(timeout=YESTERDAY_VALUE_LEAGUE_CACHE_TIMEOUT)
def _get_yesterday_electricity_usage_for_location(location: Location) -> Optional[float]:
    location_meters = Resource.get_location_energy_meters(location, MeterType.ELECTRICITY)
    try:
        yesterday_start = datetime.combine((datetime.today().date() - timedelta(days=1)), datetime.min.time())
        yesterday_end = yesterday_start + timedelta(days=1, seconds=-1)
        return aggregate_to_one(location_meters, unit=Unit.WATT_HOUR, from_=yesterday_start, to=yesterday_end).value
    except ResourceDataNotAvailable:
        return None


@cached(timeout=YESTERDAY_VALUE_LEAGUE_CACHE_TIMEOUT)
def _get_yesterday_gas_usage_for_location(location: Location) -> Optional[float]:
    location_meters = Resource.get_location_energy_meters(location, MeterType.GAS)
    try:
        yesterday_start = datetime.combine((datetime.today().date() - timedelta(days=1)), datetime.min.time())
        yesterday_end = yesterday_start + timedelta(days=1, seconds=-1)
        return aggregate_to_one(location_meters, unit=Unit.WATT_HOUR, from_=yesterday_start, to=yesterday_end).value
    except ResourceDataNotAvailable:
        return None


def _get_all_leaderboard_members(locations: Union[QuerySet, List[Location]],
                                 league_points_callable: Callable[[Location], float],
                                 units: LeaguePointsUnit):
    per_pupil_units = (
        LeaguePointsUnit.WATT_HOUR_PER_PUPIL,
        LeaguePointsUnit.WATT_PER_PUPIL,
        LeaguePointsUnit.POINT_PER_PUPIL,
    )

    for location in locations:
        points = league_points_callable(location) or 0
        if units in per_pupil_units:
            points /= location.pupils_count
        yield {
            'location_name': location.name,
            'location_uid': location.uid,
            'league_points': round(points, 2)
        }


def _get_members_to_display_and_own_rank(all_members: list, own_location_uid: str, sort_field: str, sort_desc=False):
    if sort_field == 'always_on_energy':
        sorted_members = sorted(all_members, key=lambda m: m[sort_field]['value'], reverse=sort_desc)
    else:
        sorted_members = sorted(all_members, key=lambda m: m[sort_field], reverse=sort_desc)
    own_rank = next((idx for (idx, m) in enumerate(sorted_members) if m['location_uid'] == own_location_uid))
    positions_to_return = sorted(
        {
            0,
            own_rank if 0 < own_rank < len(sorted_members) - 1 else len(sorted_members) // 2,
            len(sorted_members) - 1
        }
    )  # first, last and own rank
    displayed_members = [
        sorted_members[idx].update({'rank': idx + 1}) or sorted_members[idx] for idx in positions_to_return
    ]

    return displayed_members, own_rank + 1


def get_always_on_leagues(location: Location):
    locations = Location.get_locations_by_request_status(location)
    always_on_data_members = get_always_on_for_locations(locations)
    if always_on_data_members:
        try:
            display_members, own_rank = _get_members_to_display_and_own_rank(always_on_data_members,
                                                                             location.uid,
                                                                             'always_on_energy')
            own_points_obj = next(filter(lambda member: member['rank'] == own_rank, display_members))['always_on_energy']

            serializer_data = {
                'points_unit': own_points_obj['unit'],
                'total_members': len(always_on_data_members),
                'own_rank': own_rank,
                'own_points': own_points_obj['value'],
            }
            return serializer_data
        except StopIteration:
            return None
    else:
        return None
