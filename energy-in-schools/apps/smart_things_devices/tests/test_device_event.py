from apps.main.base_test_case import BaseTestCase
from apps.smart_things_devices.types import ButtonState, Capability, ContactState, DeviceEvent, MotionState


BASE_EVENT = {
    'eventId': 'de7ba9c9-3374-11e9-989e-7f76b81c8261',
    'locationId': 'f20d3414-9bab-469b-bbb3-fc25feb4b840',
    'deviceId': '14e5b1aa-0562-415f-86bc-ac283abb73d3',
    'componentId': 'main',
    'valueType': 'string',
    'stateChange': True,
    'subscriptionName': 'c1a96d94-ad25-4546-9fb7-7718b5c0d5cd'
}

EVENTS = {
    (Capability.CONTACT_SENSOR, ContactState.OPEN): {
        'capability': 'contactSensor',
        'attribute': 'contact',
        'value': 'open',
    },
    (Capability.CONTACT_SENSOR, ContactState.CLOSED): {
        'capability': 'contactSensor',
        'attribute': 'contact',
        'value': 'closed',
    },
    (Capability.BUTTON, ButtonState.PUSHED): {
        'capability': 'button',
        'attribute': 'button',
        'value': 'pushed',
    },
    (Capability.BUTTON, ButtonState.DOUBLE): {
        'capability': 'button',
        'attribute': 'button',
        'value': 'double',
    },
    (Capability.BUTTON, ButtonState.HELD): {
        'capability': 'button',
        'attribute': 'button',
        'value': 'held',
    },
    (Capability.MOTION_SENSOR, MotionState.INACTIVE): {
        'capability': 'motionSensor',
        'attribute': 'motion',
        'value': 'inactive',
    },
    (Capability.MOTION_SENSOR, MotionState.ACTIVE): {
        'capability': 'motionSensor',
        'attribute': 'motion',
        'value': 'active',
    },
}


class TestDeviceEvent(BaseTestCase):
    def test_parse(self):
        for (capability, state), device_event_part in EVENTS.items():
            device_event_body = {**BASE_EVENT, **device_event_part}

            with self.subTest(f'{capability}: {state}'):
                device_event = DeviceEvent.parse(device_event_body)

                self.assertEqual(capability, device_event.capability)
                self.assertEqual(state, device_event.value)
                self.assertEqual(device_event_part['attribute'], device_event.attribute)
                self.assertEqual(BASE_EVENT['subscriptionName'], device_event.subscription_name)
                self.assertEqual(BASE_EVENT['eventId'], device_event.event_id)
                self.assertEqual(BASE_EVENT['locationId'], device_event.location_id)
                self.assertEqual(BASE_EVENT['deviceId'], device_event.device_id)
                self.assertEqual(BASE_EVENT['componentId'], device_event.component_id)
                self.assertEqual(BASE_EVENT['stateChange'], device_event.state_change)
