from typing import Dict

from colour import Color

from apps.resources.types import ButtonState, ContactState, MotionState, SwitchState
from apps.smart_things_devices.types import Capability, CapabilityRule
from apps.smart_things_devices.utilities.helpers import enum_to_dict, get_key_of_nearest_value


CAPABILITY_RULES: Dict[Capability, CapabilityRule] = {
    Capability.SWITCH: CapabilityRule(
        capability=Capability.SWITCH,
        encode_value_map=enum_to_dict(SwitchState),
        use_value_as_command=True,
    ),
    Capability.SWITCH_LEVEL: CapabilityRule(
        capability=Capability.SWITCH_LEVEL,
        value_decoder=lambda value, _: int(value),
        field_name='level'
    ),
    Capability.COLOR_TEMPERATURE: CapabilityRule(
        capability=Capability.COLOR_TEMPERATURE,
        encode_value_map={1: 2700, 2: 3120, 3: 3540, 4: 3960, 5: 4380, 6: 4800, 7: 5220, 8: 5640, 9: 6060, 10: 6500},
        auto_make_reversed_map=False,
        value_decoder=lambda value, capability_rule: get_key_of_nearest_value(value, capability_rule.encode_value_map)
    ),
    Capability.MOTION_SENSOR: CapabilityRule(
        capability=Capability.MOTION_SENSOR,
        encode_value_map=enum_to_dict(MotionState),
        is_read_only=True,
        field_name='motion',
    ),
    Capability.TEMPERATURE: CapabilityRule(
        capability=Capability.TEMPERATURE,
        value_decoder=lambda value, _: float(value),
        is_read_only=True,
        field_name='temperature',
    ),
    Capability.COLOR_CONTROL: CapabilityRule(
        capability=Capability.COLOR_CONTROL,
        encode_value_map={key: tuple(dict(hue=int(Color(hex_color).get_hsl()[0] * 100),
                                          saturation=int(Color(hex_color).get_hsl()[1] * 100)).items())
                          for key, hex_color in {
                              0: '#FFFFFF',  # white
                              1: '#FF0000',  # red
                              2: '#FFA500',  # orange
                              3: '#FFFF00',  # yellow
                              4: '#008000',  # green
                              5: '#0000FF',  # blue
                              6: '#4B0082',  # purple
                              7: '#F6358A',  # violet
                          }.items()},  # todo: make reverse map
        value_decoder=lambda value, capability_rule: capability_rule._decode_value_map.get(tuple(dict(
            hue=int(float(value['hue'])),
            saturation=int(float(value['saturation'])),
        ).items()), 0),
        value_encoder=lambda value, capability_rule: dict(capability_rule._encode_value_map[value]),
        command='setColor',
        is_write_only=True,
        fields_names=('hue', 'saturation'),
    ),
    Capability.BUTTON: CapabilityRule(
        capability=Capability.BUTTON,
        encode_value_map=enum_to_dict(ButtonState),
        is_read_only=True,
    ),
    Capability.CONTACT_SENSOR: CapabilityRule(
        capability=Capability.CONTACT_SENSOR,
        encode_value_map=enum_to_dict(ContactState),
        is_read_only=True,
        field_name='contact',
    ),
    Capability.POWER_METER: CapabilityRule(
        capability=Capability.POWER_METER,
        is_read_only=True,
        value_decoder=lambda value, _: float(value),
        field_name='power',
    ),
    Capability.BATTERY: CapabilityRule(
        capability=Capability.BATTERY,
        is_read_only=True,
        field_name='battery',
    ),
}

REFRESH_DEVICES_STATUSES_HOURS = 3
