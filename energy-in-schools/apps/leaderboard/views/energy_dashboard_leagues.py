from http import HTTPStatus
from typing import Callable

from django.contrib.auth.models import AnonymousUser
from django.db.models import Q, QuerySet
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.accounts.models import User
from apps.cashback.models import OffPeakyPoint
from apps.leaderboard.serializers import LeaguePointsUnit, LeagueSerializer
from apps.locations.models import Location
from apps.leaderboard.utils import _get_live_electricity_usage_for_location,\
    _get_yesterday_electricity_usage_for_location, _get_yesterday_gas_usage_for_location,\
    _get_all_leaderboard_members, _get_members_to_display_and_own_rank


class DashboardLeaguesViewSet(GenericViewSet):

    def get_queryset(self):
        if isinstance(self.request.user, AnonymousUser):
            return Location.objects.none()
        user: User = self.request.user
        return Location.get_locations_by_request_status(user.location)

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: LeagueSerializer, })
    @action(methods=['get'], detail=False, url_path='electricity-live')
    def live_electricity_usage_league(self, *_, **__):
        return self._common_league_action(
            LeaguePointsUnit.WATT_PER_PUPIL, _get_live_electricity_usage_for_location
        )

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: LeagueSerializer, })
    @action(methods=['get'], detail=False, url_path='electricity-yesterday')
    def yesterday_electricity_usage_league(self, *_, **__):
        return self._common_league_action(
            LeaguePointsUnit.WATT_HOUR_PER_PUPIL, _get_yesterday_electricity_usage_for_location
        )

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: LeagueSerializer, })
    @action(methods=['get'], detail=False, url_path='gas')
    def yesterday_gas_usage_league(self, *_, **__):
        return self._common_league_action(
            LeaguePointsUnit.WATT_HOUR_PER_PUPIL, _get_yesterday_gas_usage_for_location
        )

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: LeagueSerializer, })
    @action(methods=['get'], detail=False, url_path='off-peak-points')
    def off_peak_points_league(self, *_, **__):
        return self._common_league_action(
            LeaguePointsUnit.POINT, OffPeakyPoint.get_cash_back_for_location, sort_desc=True
        )

    def _common_league_action(
            self,
            league_points_unit: LeaguePointsUnit,
            league_points_callable: Callable[[Location], float],
            sort_desc=False):

        locations = self.get_queryset()

        serializer_data = self.get_league_information(
            self.request.user.location.uid,
            locations,
            league_points_unit,
            league_points_callable,
            sort_desc
        )

        result_serializer = LeagueSerializer(data=serializer_data)
        result_serializer.is_valid(True)
        return Response(result_serializer.data)

    @staticmethod
    def get_league_information(
            location_uid,
            locations: QuerySet,
            league_points_unit: LeaguePointsUnit,
            league_points_callable: Callable[[Location], float],
            sort_desc):

        total_members = len(locations)
        members = _get_all_leaderboard_members(locations, league_points_callable, league_points_unit)

        display_members, own_rank, own_points = [], 0, 0
        if total_members > 0:
            display_members, own_rank = _get_members_to_display_and_own_rank(members,
                                                                             location_uid,
                                                                             'league_points',
                                                                             sort_desc)
            own_points = next(filter(lambda member: member['rank'] == own_rank, display_members))['league_points']

        serializer_data = {
            'own_location_uid': location_uid,
            'points_unit': league_points_unit,
            'total_members': total_members,
            'own_rank': own_rank,
            'own_points': own_points,
            'members': display_members
        }
        return serializer_data
