from datetime import datetime, timedelta
from typing import NamedTuple, TYPE_CHECKING, Type, Union

import funcy
from enumfields import Enum
from rest_framework import serializers

from utilities.int_value_enum_mixin import IntValueEnumMixin


if TYPE_CHECKING:
    from apps.resources.models import Resource


class HistoryType(Enum):
    DETAILED = 'detailed'
    LONG_TERM = 'long_term'


class TimeResolution(Enum):
    YEAR = 'year', timedelta(days=366)
    MONTH = 'month', timedelta(days=32)
    WEEK = 'week', timedelta(days=7)
    DAY = 'day', timedelta(days=1)
    HOUR = 'hour', timedelta(hours=1)
    HALF_HOUR = 'half_hour', timedelta(minutes=30)
    MINUTE = 'minute', timedelta(minutes=1)
    FIVE_MINUTES = 'five_minutes', timedelta(minutes=5)
    TWENTY_SECONDS = 'twenty_seconds', timedelta(seconds=20)
    SECOND = 'second', timedelta(seconds=1)

    def __new__(cls, value, duration):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._duration_ = duration
        return obj

    @property
    def duration(self) -> timedelta:
        """
        It is used for cut data set before aggregations
        :return:
        """
        return self._duration_

    @property
    def is_aggregatable(self) -> 'bool':
        return self.duration >= timedelta(hours=1) or self is TimeResolution.MINUTE


class SwitchState(IntValueEnumMixin, Enum):
    ON = 'on', 1
    OFF = 'off', 0


class ButtonState(IntValueEnumMixin, Enum):
    PUSHED = 'pushed', 1
    DOUBLE = 'double', 2
    HELD = 'held', 3


class MotionState(IntValueEnumMixin, Enum):
    ACTIVE = 'active', 1
    INACTIVE = 'inactive', 0


class ContactState(IntValueEnumMixin, Enum):
    OPEN = 'open', 1
    CLOSED = 'closed', 0


class Unit(Enum):
    UNKNOWN = 'unknown', False, None, None,

    WATT = 'watt', True, None, 'W',
    WATT_HOUR = 'watt_hour', False, None, 'Wh',
    POUND_STERLING = 'pound_sterling', False, None, 'GBP',
    CELSIUS = 'celsius', True, None, 'C',

    KILOWATT = 'kilowatt', False, None, 'kW',
    KILOWATT_HOUR = 'kilowatt_hour', False, None, 'kWh',

    BUTTON_STATE = 'button_state', True, ButtonState, None,
    MOTION_STATE = 'motion_state', True, MotionState, None,
    CONTACT_STATE = 'contact_state', True, ContactState, None,

    EVENTS_COUNT = 'events_count', False, None, None,

    PERCENTAGE = 'percentage', False, None, '%',

    def __new__(cls, value, is_base_unit, values_enum, abbreviation):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._is_base_unit_ = is_base_unit
        obj._values_enum_ = values_enum
        obj._abbreviation_ = abbreviation

        return obj

    @property
    def is_base_unit(self) -> timedelta:
        """
        Historical can be aggregated only for base units
        :return:
        """
        return self._is_base_unit_

    @property
    def values_enum(self) -> Union[IntValueEnumMixin, Enum, None]:
        return self._values_enum_

    @property
    def abbreviation(self) -> str:
        return self._abbreviation_ or self.label


class ResourceValue(NamedTuple):
    time: datetime
    value: float
    unit: Unit = Unit.UNKNOWN

    def as_dict(self):
        return self._asdict()


class ResourceState(NamedTuple):
    time: datetime
    state: Union[float, Enum]
    unit: Unit


class AlwaysOnValue(NamedTuple):
    value: float
    unit: str

    def as_dict(self):
        return self._asdict()


class BoundaryValue(NamedTuple):
    resource_id: int
    value: ResourceValue


class DataCollectionMethod(Enum):
    PULL = 'pull'  # send a request for new values
    PUSH = 'push'  # waiting for a new data


class InterpolationType(Enum):
    DISABLED = 'disabled'
    LINEAR = 'linear'


class ResourceException(Exception):
    pass


class ResourceDataNotAvailable(ResourceException):
    pass


class ValidationError(ResourceException):
    pass


class ResourceValidationError(ValidationError):
    pass


class ResourceChildType(Enum):
    ENERGY_METER = 'energy_meter'
    SMART_THINGS_SENSOR = 'smart_things_sensor'
    SMART_THINGS_ENERGY_METER = 'smart_things_energy_meter'
    MICROBIT_HISTORICAL_DATA_SET = 'microbit_historical_data_set'
    WEATHER_TEMPERATURE = 'weather_temperature'

    @funcy.cached_property
    def model(self) -> 'Type[Resource]':
        from apps.energy_meters.models import EnergyMeter
        from apps.smart_things_sensors.models import SmartThingsSensor, SmartThingsEnergyMeter
        from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
        from apps.weather.models import WeatherTemperatureHistory

        return {
            self.ENERGY_METER: EnergyMeter,
            self.SMART_THINGS_SENSOR: SmartThingsSensor,
            self.SMART_THINGS_ENERGY_METER: SmartThingsEnergyMeter,
            self.MICROBIT_HISTORICAL_DATA_SET: MicrobitHistoricalDataSet,
            self.WEATHER_TEMPERATURE: WeatherTemperatureHistory,
        }[self]

    @funcy.cached_property
    def serializer(self) -> 'Type[serializers.Serializer]':
        from apps.energy_meters.serializers import EnergyMeterSerializer
        from apps.smart_things_sensors.serializers import SmartThingsSensorSerializer, SmartThingsEnergyMeterSerializer
        from apps.storage.serializers.historical import MicrobitHistoricalDataSetSerializer
        from apps.weather.serializers import WeatherTemperatureHistorySerializer

        return {
            self.ENERGY_METER: EnergyMeterSerializer,
            self.SMART_THINGS_SENSOR: SmartThingsSensorSerializer,
            self.SMART_THINGS_ENERGY_METER: SmartThingsEnergyMeterSerializer,
            self.MICROBIT_HISTORICAL_DATA_SET: MicrobitHistoricalDataSetSerializer,
            self.WEATHER_TEMPERATURE: WeatherTemperatureHistorySerializer,
        }[self]
