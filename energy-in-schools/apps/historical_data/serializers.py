import keyword
import re
from typing import Any, Dict, Type, TypeVar, cast

import funcy
from django.utils import timezone
from drf_serializer_cache import SerializerCacheMixin
from enumfields import Enum
from enumfields.drf import EnumField, EnumSupportSerializerMixin
from rest_framework import serializers

from apps.historical_data.types import PeriodicConsumptionType
from apps.resources.types import ButtonState, ContactState, MotionState, TimeResolution, Unit
from utilities.custom_serializer_fields import UnitAbbreviationEnumField


class BaseSerializer(EnumSupportSerializerMixin, serializers.Serializer):  # todo: move it
    """
    Implement empty update and create methods
    """

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass


class BaseQuerySerializer(BaseSerializer):  # todo: move it
    def to_internal_value(self, data: Dict[str, Any]):
        return super().to_internal_value({
            key + '_' if key in keyword.kwlist else key: value[0] if isinstance(value, list) else value
            for key, value in data.items()
        })


class TimeValueSerializer(serializers.Serializer):
    """Serializer for resource value"""
    time = serializers.DateTimeField()
    value = serializers.FloatField(allow_null=True)


class TimeValueWithUnitAbbreviationSerializer(TimeValueSerializer):
    """Serializer for historical data export option with unit abbreviation"""
    value_unit = UnitAbbreviationEnumField(Unit, required=False)
    

class ResourceHistoricalDataWithUnitAbbreviationSerializer(serializers.Serializer, SerializerCacheMixin):
    values = TimeValueWithUnitAbbreviationSerializer(many=True)


class ResourceHistoricalDataSerializer(SerializerCacheMixin, BaseSerializer):
    values = TimeValueSerializer(many=True)
    unit = EnumField(Unit)


class ResourceHistoryValueItemSerializer(TimeValueSerializer):
    cmp_value = serializers.FloatField(required=False, allow_null=True)


class ResourceHistoryValueSerializer(ResourceHistoricalDataSerializer):
    values = ResourceHistoryValueItemSerializer(many=True)


class ResourceValueSerializer(SerializerCacheMixin, BaseSerializer):
    time = serializers.DateTimeField()
    value = serializers.FloatField()
    unit = EnumField(Unit)


class ResourceStateSerializer(SerializerCacheMixin, BaseSerializer):
    UNIT_TO_FIELD_TYPE_MAP = {
        Unit.MOTION_STATE: EnumField(MotionState, required=True),
        Unit.CONTACT_STATE: EnumField(ContactState, required=True),
        Unit.BUTTON_STATE: EnumField(ButtonState, required=True),
        Unit.WATT: serializers.FloatField(required=True),
        Unit.CELSIUS: serializers.FloatField(required=True),
    }
    time = serializers.DateTimeField()
    state = serializers.CharField()
    unit = EnumField(Unit)

    @property
    def fields(self):
        fields = super().fields

        state_field = self.UNIT_TO_FIELD_TYPE_MAP.get(self.instance and self.instance.unit, fields['state'])

        if not state_field.field_name:
            state_field.bind('state', None)

        return {
            **fields,
            'state': state_field
        }


class AlwaysOnValueSerializer(BaseSerializer):
    value = serializers.FloatField()
    unit = EnumField(Unit)


class BoundaryValueSerializer(BaseSerializer):
    resource = serializers.SerializerMethodField()
    value = ResourceValueSerializer()

    # TODO: used SerializerMethodField to avoid circular imports; resource data is required on frontend
    def get_resource(self, obj):
        from apps.resources.serializers import ResourceSerializer
        from apps.resources.models import Resource
        return ResourceSerializer(Resource.objects.get(id=obj.resource_id)).data


class BoundaryLiveValueSerializer(BaseSerializer):
    min = BoundaryValueSerializer()
    max = BoundaryValueSerializer()


class HourValueSerializer(BaseSerializer):
    hour = serializers.IntegerField(min_value=0, max_value=23)
    value = serializers.FloatField(allow_null=True)


class PeriodicConsumptionSerializer(BaseSerializer):
    values = HourValueSerializer(many=True)
    unit = EnumField(Unit)


class DateTimeFieldWithOffset(serializers.DateTimeField):
    default_error_messages = {
        'naive': 'Datetime value is missing a timezone offset.'
    }

    def enforce_timezone(self, value):
        if timezone.is_naive(value):
            self.fail('naive')

        return value


class PeriodType(Enum):
    HOURS = 'hours'
    DAYS = 'days'
    WEEKS = 'weeks'
    MONTHS = 'months'


class HistoricalDataQuerySerializerSet:
    SerializerType = TypeVar('SerializerType', bound=serializers.Serializer)

    class _LiveQueryParamsSerializer(BaseQuerySerializer):
        unit = EnumField(Unit, required=False, default=None, allow_null=True)

    class _StateQueryParamsSerializer(BaseQuerySerializer):
        pass

    class _TotalQueryParamsSerializer(BaseQuerySerializer):
        unit = EnumField(Unit, required=False, default=None, allow_null=True)
        from_ = DateTimeFieldWithOffset(required=False)
        to = DateTimeFieldWithOffset(required=False)
        period_type = EnumField(PeriodType, required=False, default=None, allow_null=True)
        periods_ago = serializers.IntegerField(required=False, default=None, allow_null=True)

    class _AlwaysOnQueryParamsSerializer(BaseQuerySerializer):
        from_ = DateTimeFieldWithOffset(required=False)
        to = DateTimeFieldWithOffset(required=False)

    class _SequenceQueryParamsSerializer(BaseQuerySerializer):
        from_ = DateTimeFieldWithOffset(required=False)
        to = DateTimeFieldWithOffset(required=False)
        compare_from = DateTimeFieldWithOffset(required=False)
        compare_to = DateTimeFieldWithOffset(required=False)
        time_resolution = EnumField(TimeResolution, required=False, default=TimeResolution.DAY, allow_blank=True)
        unit = EnumField(Unit, required=False, default=None)
        fill_gaps = serializers.BooleanField(default=False)

    class _PeriodicConsumptionQueryParamsSerializer(BaseQuerySerializer):
        period = EnumField(PeriodicConsumptionType)
        unit = EnumField(Unit, required=False, default=None, allow_null=True)
        fill_gaps = serializers.BooleanField(default=False)

    def __init__(
            self,
            label: str,
            extra_fields: Dict[str, serializers.Field] = None,
            live_extra_fields: Dict[str, serializers.Field] = None,
            state_extra_fields: Dict[str, serializers.Field] = None,
            total_extra_fields: Dict[str, serializers.Field] = None,
            always_on_extra_fields: Dict[str, serializers.Field] = None,
            sequence_extra_fields: Dict[str, serializers.Field] = None,
            periodic_extra_fields: Dict[str, serializers.Field] = None,
    ):
        self._label = label
        self._replaced_fields = extra_fields or {}
        self._live_extra_fields = live_extra_fields or {}
        self._state_extra_fields = state_extra_fields or {}
        self._total_extra_fields = total_extra_fields or {}
        self._always_on_extra_fields = always_on_extra_fields or {}
        self.sequence_extra_fields = sequence_extra_fields or {}
        self._periodic_extra_fields = periodic_extra_fields or {}

    @funcy.cached_property
    def live(self):
        return self._make_query_serializer(self, self._LiveQueryParamsSerializer, self._live_extra_fields)

    @funcy.cached_property
    def state(self):
        return self._make_query_serializer(self, self._StateQueryParamsSerializer, self._state_extra_fields)

    @funcy.cached_property
    def total(self):
        return self._make_query_serializer(self, self._TotalQueryParamsSerializer, self._total_extra_fields)

    @funcy.cached_property
    def always_on(self):
        return self._make_query_serializer(self, self._AlwaysOnQueryParamsSerializer, self._always_on_extra_fields)

    @funcy.cached_property
    def sequence(self):
        return self._make_query_serializer(self, self._SequenceQueryParamsSerializer, self.sequence_extra_fields)

    @funcy.cached_property
    def periodic(self):
        return self._make_query_serializer(self, self._PeriodicConsumptionQueryParamsSerializer, self._periodic_extra_fields)

    def _make_query_serializer(
            self,
            historical_data_serializer_set: 'HistoricalDataQuerySerializerSet',
            serializer: Type['HistoricalDataQuerySerializerSet.SerializerType'],
            extra_fields: Dict[str, serializers.Field],
    ) -> Type['HistoricalDataQuerySerializerSet.SerializerType']:
        print(historical_data_serializer_set)
        print(serializer,'Serailizer')
        print(extra_fields, 'extra-fields')
        return cast(
            Type['HistoricalDataQuerySerializerSet.SerializerType'],
            type(
                self._get_serializer_name(
                    historical_data_serializer_set,
                    serializer,
                ),
                (serializer,),
                {
                    **historical_data_serializer_set._replaced_fields,
                    **extra_fields
                }
            )
        )

    @staticmethod
    def _get_serializer_name(
            historical_data_serializer_set: 'HistoricalDataQuerySerializerSet',
            serializer: Type['HistoricalDataQuerySerializerSet.SerializerType'],
    ) -> str:
        return \
            historical_data_serializer_set._label + \
            re.findall('_(.*)QueryParamsSerializer', serializer.__name__)[0] + \
            'HistoryQuerySerializer'
