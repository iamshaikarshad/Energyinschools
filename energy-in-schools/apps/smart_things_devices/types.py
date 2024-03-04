import logging
from typing import Any, Callable, Dict, Iterable, List, NamedTuple, Optional, Tuple, Union

import funcy
from enumfields import Enum

from apps.resources.types import ButtonState, ContactState, MotionState, SwitchState, Unit
from apps.smart_things_apps.types import ValidationError
from utilities.int_value_enum_mixin import IntValueEnumMixin
from utilities.types import JsonObject

NOT_FOUND = object()

logger = logging.getLogger(__name__)


class Capability(Enum):
    # docs https://smartthings.developer.samsung.com/docs/api-ref/capabilities.html#Capabilities

    BATTERY = 'battery', Unit.PERCENTAGE, None
    BUTTON = 'button', Unit.BUTTON_STATE, ButtonState
    COLOR_CONTROL = 'colorControl', Unit.UNKNOWN, None
    COLOR_TEMPERATURE = 'colorTemperature', Unit.UNKNOWN, None
    CONTACT_SENSOR = 'contactSensor', Unit.CONTACT_STATE, ContactState
    ENERGY_METER = 'energyMeter', Unit.WATT, None
    MOTION_SENSOR = 'motionSensor', Unit.MOTION_STATE, MotionState
    POWER_METER = 'powerMeter', Unit.WATT, None
    SWITCH = 'switch', Unit.UNKNOWN, SwitchState
    SWITCH_LEVEL = 'switchLevel', Unit.UNKNOWN, None
    TEMPERATURE = 'temperatureMeasurement', Unit.CELSIUS, None
    UNKNOWN = 'unknown', Unit.UNKNOWN, None

    def __new__(cls, value, unit, values_enum):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._unit_ = unit
        obj._values_enum_ = values_enum

        return obj

    @property
    def unit(self) -> Unit:
        return self._unit_

    @property
    def values_enum(self) -> Union[IntValueEnumMixin, Enum]:
        return self._values_enum_


class Attribute(Enum):
    ENERGY = 'energy'


class DeviceStatus(Enum):
    ONLINE = 'ONLINE'
    OFFLINE = 'OFFLINE'
    UNKNOWN = 'UNKNOWN'


class DeviceEvent(NamedTuple):
    subscription_name: str
    event_id: str
    location_id: str
    device_id: str
    component_id: str
    capability: Capability
    attribute: str  # todo: change "str" to "Attribute"?
    value: Any
    state_change: bool

    @classmethod
    def parse(cls, event: JsonObject) -> 'DeviceEvent':
        from apps.smart_things_devices.settings import CAPABILITY_RULES

        try:
            capability = Capability(event['capability'])
            return DeviceEvent(
                subscription_name=event['subscriptionName'],
                event_id=event['eventId'],
                location_id=event['locationId'],
                device_id=event['deviceId'],
                component_id=event['componentId'],
                capability=capability,
                attribute=event['attribute'],
                value=CAPABILITY_RULES[capability].decode_value(event['value']),
                state_change=event['stateChange'],
            )
        except (KeyError, ValueError) as exception:
            raise Exception(f'Parse smart things event error: "{exception}"!') from exception  # todo


class CapabilityRule(NamedTuple):
    capability: Capability
    encode_value_map: Optional[Dict[Any, Any]] = None
    decode_value_map: Optional[Dict[Any, Any]] = None
    auto_make_reversed_map: bool = True
    use_value_as_command: bool = False
    command: str = None
    is_read_only: bool = False
    is_write_only: bool = False
    value_decoder: Callable[[Any, 'CapabilityRule'], Any] = None
    value_encoder: Callable[[Any, 'CapabilityRule'], Any] = None
    field_name: str = None
    fields_names: Tuple[str, ...] = None

    def get_command_body(self, decoded_value: Any) -> JsonObject:
        # todo add is_read_only validation
        encoded_value = self.encode_value(decoded_value)
        return {
            'capability': self.capability.value,
            'command': self._get_command(encoded_value),
            'arguments': self._get_arguments(encoded_value),
        }

    def get_value_from_response(self, response_json: JsonObject) -> Any:
        if self.fields_names is not None:
            return self.decode_value({
                field_name: funcy.get_in(response_json, (field_name, 'value'))
                for field_name in self.fields_names
            })

        return self.decode_value(funcy.get_in(response_json, (self._field_name, 'value')))

    @property
    def _field_name(self):
        return self.field_name or self.capability.value

    @property
    @funcy.memoize(key_func=lambda self: id(self))
    def _decode_value_map(self) -> Optional[Dict[Any, Any]]:
        if self.decode_value_map:
            return self.decode_value_map

        if self.auto_make_reversed_map and self.encode_value_map:
            return {value: key for key, value in self.encode_value_map.items()}

    @property
    @funcy.memoize(key_func=lambda self: id(self))
    def _encode_value_map(self) -> Optional[Dict[Any, Any]]:
        if self.encode_value_map:
            return self.encode_value_map

        if self.auto_make_reversed_map and self.decode_value_map:
            return {value: key for key, value in self.decode_value_map.items()}

    def _get_command(self, encoded_value: Union[str, int, float]) -> str:
        if self.use_value_as_command:
            return encoded_value

        if self.command:
            return self.command

        return 'set' + self._field_name[0].upper() + self._field_name[1:]

    def _get_arguments(self, encoded_value):
        if self.use_value_as_command:
            return []

        return [encoded_value]

    def encode_value(self, decoded_value: Any) -> Union[str, int, float]:
        if self.value_encoder:
            try:
                decoded_value = self.value_encoder(decoded_value, self)
            except Exception as exception:
                raise ValidationError from exception

        elif self._encode_value_map:
            if decoded_value not in self._encode_value_map:
                self.raise_wrong_value(decoded_value, self._encode_value_map)

            decoded_value = self._encode_value_map[decoded_value]

        return decoded_value

    def decode_value(self, encoded_value: Union[str, int, float, Dict[str, Any]]) -> Any:
        if self.value_decoder:
            try:
                encoded_value = self.value_decoder(encoded_value, self)
            except Exception as exception:
                raise ValidationError from exception

        elif self._decode_value_map:
            if encoded_value not in self._decode_value_map:
                self.raise_wrong_value(encoded_value, self._decode_value_map)

            encoded_value = self._decode_value_map[encoded_value]

        return encoded_value

    def raise_wrong_value(self, value, accepted_values: Iterable[Any] = None):
        message = f'Wrong value for the command: "{value}".'
        if accepted_values:
            message += f' You can use only one of that: {list(self._decode_value_map)}'

        raise ValidationError(message)


class DTH(NamedTuple):
    device_network_type: str
    device_type_id: str
    device_type_name: str

    @classmethod
    def from_json(cls, data: JsonObject):
        return DTH(
            device_network_type=data.get('deviceNetworkType'),
            device_type_id=data.get('deviceTypeId'),
            device_type_name=data.get('deviceTypeName'),
        )


class DeviceProfile(NamedTuple):
    id: str

    @classmethod
    def from_json(cls, data: JsonObject):
        return DeviceProfile(
            id=data.get('id')
        )


class App(NamedTuple):
    installed_app_id: str
    external_id: str
    profile: DeviceProfile

    @classmethod
    def from_json(cls, data: JsonObject):
        return App(
            installed_app_id=data.get('installedAppId'),
            external_id=data.get('externalId'),
            profile=DeviceProfile.from_json(data['profile']) if 'profile' in data else None
        )


class SmartThingsRoomDetail(NamedTuple):
    """
    Abstraction around location room entity from SmartThings (MISSING IN DOCS)
    """
    room_id: str
    location_id: str
    name: str

    @classmethod
    def from_json(cls, data: JsonObject) -> 'SmartThingsRoomDetail':
        return cls(
            room_id=data['roomId'],
            location_id=data['locationId'],
            name=data['name'],
        )


class DeviceDetail(NamedTuple):
    device_id: str
    device_manufacturer_code: Optional[str]
    dth: DTH
    app: App
    label: str
    location_id: str
    room_id: Optional[str]
    name: str
    type_: str
    components: Dict[str, List[str]]  # {<component id>: [capability id]}
    room: Optional[SmartThingsRoomDetail] = None

    @classmethod
    def from_json(cls, data: JsonObject) -> 'DeviceDetail':
        return DeviceDetail(
            device_id=data['deviceId'],
            device_manufacturer_code=data.get('deviceManufacturerCode'),
            dth=DTH.from_json(data.get('dth', data)),  # in the old version the dth fields are in root,
            app=App.from_json(data['app']) if 'app' in data else None,
            label=data.get('label'),
            location_id=data.get('locationId'),
            room_id=data.get('roomId'),
            name=data.get('name'),
            type_=data.get('type'),
            components={
                component['id']: [capability['id'] for capability in component['capabilities']]
                for component in data.get('components', ())
            },
        )

    def get_raw_capabilities(self, component: str = 'main') -> List[str]:
        """Get Capabilities for specified component from DeviceDetails object

            Return list of capabilities.

            Example <class 'list'>: [
                'switch',
                'configuration',
                'refresh',
                'powerMeter',
                'sensor',
                'actuator',
                'healthCheck',
                'outlet'
            ]
        """
        return self.components.get(component, [])

    def get_room_name(self):
        return self.room.name if self.room else None
