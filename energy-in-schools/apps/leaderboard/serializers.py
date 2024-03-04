from enum import Enum

from enumfields.drf import EnumField
from rest_framework import serializers

from apps.cashback.serializers import EnergyCashbackSerializer
from apps.historical_data.serializers import AlwaysOnValueSerializer, BaseSerializer
from apps.resources.types import Unit


class LeaguePointsUnit(Enum):
    WATT_PER_PUPIL = 'watt_per_pupil'
    WATT_HOUR_PER_PUPIL = 'watt_hour_per_pupil'
    POINT = 'point'
    POINT_PER_PUPIL = 'point_per_pupil'


class LeaderboardMemberSerializerMixin(BaseSerializer):
    location_name = serializers.CharField()
    location_uid = serializers.CharField()


class AlwaysOnLeaderboardMemberSerializer(LeaderboardMemberSerializerMixin):
    always_on_energy = AlwaysOnValueSerializer()


class CashbackLeaderboardMemberSerializer(LeaderboardMemberSerializerMixin):
    cashback = EnergyCashbackSerializer()


class LeagueMemberSerializer(LeaderboardMemberSerializerMixin):
    rank = serializers.IntegerField(min_value=0)
    league_points = serializers.FloatField(min_value=0)


class BaseLeagueSerializer(BaseSerializer):
    points_unit = EnumField(LeaguePointsUnit, lenient=True)
    own_rank = serializers.IntegerField(min_value=0)
    own_points = serializers.FloatField(min_value=0)
    total_members = serializers.IntegerField(min_value=0)


class LeagueSerializer(BaseLeagueSerializer):
    own_location_uid = serializers.CharField()
    members = LeagueMemberSerializer(many=True)


class AlwaysOnLeagueSerializer(BaseLeagueSerializer):
    points_unit = EnumField(Unit)
