from datetime import datetime, timedelta, timezone
from http import HTTPStatus

from cacheops import cached
from django.conf import settings
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.accounts.models import User
from apps.cashback.models import OffPeakyPoint
from apps.energy_providers.providers.abstract import MeterType
from apps.resources.models import Resource
from apps.historical_data.utils.aggregations import get_always_on
from apps.leaderboard.serializers import AlwaysOnLeaderboardMemberSerializer, CashbackLeaderboardMemberSerializer
from apps.locations.models import Location
from apps.resources.types import ResourceDataNotAvailable


ALWAYS_ON_PERIOD_DURATION = timedelta(weeks=5)
CACHE_TIMEOUT = int(timedelta(hours=6).total_seconds())


class LeaderboardViewSet(GenericViewSet):

    def get_queryset(self):
        user: User = self.request.user

        if settings.TEST_MODE:
            return Location.objects.filter(parent_location_id=None)
        else:
            return Location.objects.filter(
                (Q(is_test=False) & Q(parent_location_id=None)) |
                Q(id=user.location_id)
            )

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: AlwaysOnLeaderboardMemberSerializer, })
    @action(methods=['get'], detail=False, url_path='always-on')
    def always_on(self, *_, **__):
        locations = self.get_queryset()
        serializer_data = get_always_on_for_locations(locations)

        result_serializer = AlwaysOnLeaderboardMemberSerializer(
            data=sorted(serializer_data, key=lambda value: value['always_on_energy']['value']),
            many=True,
        )
        result_serializer.is_valid(True)
        return Response(result_serializer.data)

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: CashbackLeaderboardMemberSerializer, })
    @action(methods=['get'], detail=False, url_path='cashback')
    def cashback(self, *_, **__):
        locations = self.get_queryset()

        serializer_data = map(lambda location: {
            'cashback': {
                'current': OffPeakyPoint.get_cash_back_for_location(location),
            },
            'location_name': location.name,
            'location_uid': location.uid,
        }, locations)

        result_serializer = CashbackLeaderboardMemberSerializer(
            data=sorted(serializer_data, key=lambda value: value['cashback']['current'], reverse=True),
            many=True,
        )

        result_serializer.is_valid(True)
        return Response(result_serializer.data)


@cached(timeout=CACHE_TIMEOUT)
def _get_always_on_energy_for_location(location):
    always_on_start_date = datetime.now(tz=timezone.utc) - ALWAYS_ON_PERIOD_DURATION
    location_meters = Resource.get_location_energy_meters(location, MeterType.ELECTRICITY)
    try:
        return get_always_on(location_meters, from_=always_on_start_date)
    except ResourceDataNotAvailable:
        return None


def get_always_on_for_locations(locations):
    always_on_data_per_location = []

    for location in locations:
        location_always_on_energy = _get_always_on_energy_for_location(location)

        if not location_always_on_energy:
            continue

        always_on_data_per_location.append({
            'always_on_energy': location_always_on_energy.as_dict(),
            'location_name': location.name,
            'location_uid': location.uid,
        })
    return always_on_data_per_location
