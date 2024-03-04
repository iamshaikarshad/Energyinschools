import random
from datetime import datetime, timedelta, timezone
from functools import partial
from http import HTTPStatus
from unittest.mock import patch, Mock

import factory
from faker import Factory

from apps.resources.types import ButtonState, ContactState, MotionState, SwitchState
from apps.smart_things_apps.base_test_case import SmartThingsAppBaseTestCase
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.types import BadGateway, SmartThingsError
from apps.smart_things_devices.base_test_case import SmartThingsDevicesBaseTestCase
from apps.smart_things_devices.models import SmartThingsDevice, SmartThingsCapability
from apps.smart_things_devices.types import Attribute, Capability, DeviceDetail, SmartThingsRoomDetail, DeviceStatus
from apps.smart_things_devices.utilities.connectors import SmartThingsApiConnector
from utilities.requests_mock import RequestMock


faker = Factory.create()


class SmartThingsDeviceFactory(factory.DjangoModelFactory):
    class Meta:
        model = SmartThingsDevice

    name = factory.LazyFunction(faker.word)
    label = factory.LazyFunction(faker.word)
    room_name = factory.LazyFunction(faker.word)

    is_connected = True

    # smart_thing_app = models
    smart_things_id = factory.LazyFunction(faker.pystr)
    smart_things_location = factory.LazyFunction(faker.pystr)

    status = factory.LazyFunction(lambda: random.choice(list(DeviceStatus)))
    status_updated_at = faker.date()


request_mock_get_device_status = partial(
    RequestMock,
    request_method=RequestMock.Method.GET,
    request_url="https://api.smartthings.com/v1/devices/8d975a53-0196-4917-ad59-aacf9d34a592/health",
    request_headers={'Authorization': 'Bearer auth token'},
)


class TestSmartThingsDevicesConnector(SmartThingsDevicesBaseTestCase):
    @RequestMock.assert_requests([
        RequestMock(
            request_url='https://api.smartthings.com/v1/devices',
            response_json={'_links': {'next': {'href': 'https://aa.bb/next-page'}, 'previous': None}, 'items': [
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE,
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOBILE_PRESENCE,
            ]},
            request_headers={'Authorization': 'Bearer auth token'}
        ),
        RequestMock(
            request_url='https://aa.bb/next-page',
            response_json={'_links': {'next': None, 'previous': None}, 'items': [
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE,
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH,
            ]},
            request_headers={'Authorization': 'Bearer auth token'}
        )
    ])
    def test_list_devices_details(self):
        devices_details = SmartThingsApiConnector(self.smart_things_app).list_devices_details()

        self.assertEqual(
            sorted(map(DeviceDetail.from_json, (
                self.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
                self.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE,
                self.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE,
                self.SmartThingsDeviceDetailsResponse.SWITCH,
            ))),
            sorted(devices_details)
        )

    @RequestMock.assert_requests([
        RequestMock(
            request_url='https://api.smartthings.com/v1/devices/the_id',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
            request_headers={'Authorization': 'Bearer auth token'}
        )
    ])
    def test_get_device_detail(self):
        devices_detail = self.smart_things_devices_connector.get_device_detail('the_id')
        self.assertEqual(
            DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.MOTION_SENSOR),
            devices_detail
        )

    @RequestMock.assert_requests([
        RequestMock(
            request_url='https://api.smartthings.com/v1/devices/the_id/components/main/capabilities/switch/status',
            response_json={'switch': {'value': 'double'}},
            request_headers={'Authorization': 'Bearer auth token'}
        )
    ])
    def test_get_device_states__no_data(self):
        with self.assertRaises(BadGateway):
            self.smart_things_devices_connector.get_device_states('the_id', Capability.SWITCH)

    def test_get_device_states(self):
        for capability, excepted_value, response in (
                (
                        Capability.SWITCH,
                        SwitchState.OFF,
                        {'switch': {'value': 'off'}},
                ),
                (
                        Capability.SWITCH,
                        SwitchState.ON,
                        {'switch': {'value': 'on'}},
                ),
                (
                        Capability.MOTION_SENSOR,
                        MotionState.ACTIVE,
                        {'motion': {'value': 'active'}},
                ),
                (
                        Capability.MOTION_SENSOR,
                        MotionState.INACTIVE,
                        {"motion": {"value": "inactive"}},
                ),
                (
                        Capability.TEMPERATURE,
                        20,
                        {'temperature': {'value': 20, 'unit': 'C'}},
                ),
                (
                        Capability.SWITCH_LEVEL,
                        5,
                        {'level': {'value': 5, 'unit': '%'}},
                ),
                (
                        Capability.COLOR_TEMPERATURE,
                        2,
                        {'colorTemperature': {'value': 3115, 'unit': 'K'}},
                ),
                (
                        Capability.COLOR_CONTROL,
                        6,
                        {'saturation': {'value': 100}, 'color': {'value': None}, 'hue': {'value': 76}},
                ),
                # this case is hard to reproduce, but occurs occasionally on stage/prod
                (
                        Capability.COLOR_CONTROL,
                        0,
                        {'saturation': {'value': 76.78}, 'color': {'value': None}, 'hue': {'value': '76.56'}},
                ),
                (
                        Capability.POWER_METER,
                        20,
                        {'power': {'unit': 'W', 'value': 20}},

                ),
                (
                        Capability.BUTTON,
                        ButtonState.DOUBLE,
                        {'button': {'value': 'double'},
                         'numberOfButtons': {'value': 1},
                         'supportedButtonValues': {'value': ['pushed', 'held', 'double']}},
                ),
                (
                        Capability.BUTTON,
                        ButtonState.PUSHED,
                        {"button": {"value": "pushed"},
                         "numberOfButtons": {"value": 1},
                         "supportedButtonValues": {"value": ["pushed", "held", "double"]}},
                ),
                (
                        Capability.BUTTON,
                        ButtonState.HELD,
                        {"button": {"value": "held"}, "numberOfButtons": {"value": 1},
                         "supportedButtonValues": {"value": ["pushed", "held", "double"]}},
                ),
                (
                        Capability.CONTACT_SENSOR,
                        ContactState.CLOSED,
                        {'contact': {'value': 'closed'}},
                ),
                (
                        Capability.CONTACT_SENSOR,
                        ContactState.OPEN,
                        {"contact": {"value": "open"}},
                ),
        ):
            with self.subTest(capability.value), \
                 RequestMock.assert_requests([RequestMock(
                     request_url=(f'https://api.smartthings.com/v1/devices/the_id/components/main'
                                  f'/capabilities/{capability.value}/status'),
                     response_json=response,
                     request_headers={'Authorization': 'Bearer auth token'}
                 )], self):
                self.assertEqual(
                    excepted_value,
                    self.smart_things_devices_connector.get_device_states('the_id', capability)
                )

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.PUT,
            request_url='https://api.smartthings.com/v1/devices/the_id',
            request_json={'label': 'the label'},
            request_headers={'Authorization': 'Bearer auth token'}
        )
    ])
    def test_update_device_label(self):
        self.smart_things_devices_connector.update_device_label('the_id', 'the label')

    def test_execute_command(self):
        for capability, value, request_data in (
                (Capability.SWITCH, SwitchState.ON, {"commands": [{
                    'capability': 'switch',
                    'command': 'on',
                    'arguments': [],
                }]}),
                (Capability.SWITCH, SwitchState.ON, {"commands": [{
                    'capability': 'switch',
                    'command': 'on',
                    'arguments': [],
                }]}),
                (Capability.SWITCH_LEVEL, 42, {"commands": [{
                    'capability': 'switchLevel',
                    'command': 'setLevel',
                    'arguments': [42],
                }]}),
                (Capability.COLOR_CONTROL, 6, {"commands": [{
                    "capability": "colorControl",
                    "command": "setColor",
                    "arguments": [{"hue": 76, "saturation": 100}]
                }]}),
        ):
            with self.subTest(capability.value), \
                 RequestMock.assert_requests([RequestMock(
                     request_method=RequestMock.Method.POST,
                     request_url='https://api.smartthings.com/v1/devices/the_id/commands',
                     request_json=request_data,
                     request_headers={'Authorization': 'Bearer auth token'}
                 )], self):
                self.smart_things_devices_connector.execute_command('the_id', capability, value)

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.POST,
            request_url='https://api.smartthings.com/v1/devices',
            request_json={'label': 'lab', 'locationId': SmartThingsAppBaseTestCase.smart_things_location_id,
                          'app': {'profileId': 'prof id', 'installedAppId': 'the app id', 'externalId': 'ext id'}},
            request_headers={'Authorization': 'Bearer auth token'},
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR
        )
    ])
    def test_create_device(self):
        device_detail = self.smart_things_devices_connector.create_device('lab', 'prof id', 'ext id')
        self.assertEqual(
            SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR['label'],
            device_detail.label,
        )

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.POST,
            request_url='https://api.smartthings.com/v1/devices/theid/events',
            request_json={
                'deviceEvents': [
                    {
                        'component': "main",
                        'capability': Capability.ENERGY_METER.value,
                        'attribute': Attribute.ENERGY.value,
                        'value': 42
                    }
                ]
            },
            request_headers={'Authorization': 'Bearer auth token'},
        )
    ])
    def test_send_event(self):
        self.smart_things_devices_connector.send_event('theid', Capability.ENERGY_METER, Attribute.ENERGY, 42)

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.POST,
            request_url='https://api.smartthings.com/v1/installedapps/the%20app%20id/subscriptions',
            request_json={
                "sourceType": "DEVICE",
                "device": {
                    "deviceId": "device-id",
                    "componentId": "*",
                    "capability": Capability.MOTION_SENSOR.value,
                    "attribute": "*",
                    "stateChangeOnly": True
                }
            },
            request_headers={'Authorization': 'Bearer auth token'},
            response_json={
                "id": "subscription id",
                "installedAppId": "fb05c874-cf1d-406a-930c-69a081e0eaee",
                "sourceType": "DEVICE",
                "device": {
                    "componentId": "main",
                    "deviceId": "e457978e-5e37-43e6-979d-18112e12c961,",
                    "capability": "contactSensor,",
                    "attribute": "contact,",
                    "stateChangeOnly": "true,",
                    "subscriptionName": "contact_subscription',",
                    "value": "*"
                }
            }
        )
    ])
    def test_subscribe_for_device_events(self):
        self.assertEqual(
            "subscription id",
            self.smart_things_devices_connector.subscribe_for_device_events(
                device_id="device-id",
                capability=Capability.MOTION_SENSOR,
            )
        )

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.DELETE,
            request_url='https://api.smartthings.com/v1/installedapps/the%20app%20id/subscriptions/sub-id',
            request_headers={'Authorization': 'Bearer auth token'},
        )
    ])
    def test_unsubscribe_for_device_events(self):
        self.smart_things_devices_connector.unsubscribe_for_device_events('sub-id')

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.GET,
            request_url='https://api.smartthings.com/v1/installedapps/the%20app%20id/subscriptions',
            request_headers={'Authorization': 'Bearer auth token'},
            response_json={
                "items": [
                    {
                        "id": "first",
                        "installedAppId": "fb05c874-cf1d-406a-930c-69a081e0eaee",
                        "sourceType": "DEVICE",
                        "device": {
                            "componentId": "main",
                            "deviceId": "e457978e-5e37-43e6-979d-18112e12c961,",
                            "capability": "contactSensor,",
                            "attribute": "contact,",
                            "stateChangeOnly": "true,",
                            "subscriptionName": "contact_subscription',",
                            "value": "*"
                        }
                    },
                    {
                        "id": "wrong",
                        "sourceType": "CAPABILITY",
                        # any other field is not used
                    },
                    {
                        "id": "second",
                        "sourceType": "DEVICE",
                        # any other field is not used
                    },
                ],
                "_links": {
                    "next": {
                        "href": None
                    },
                    "previous": {
                        "href": None
                    }
                }
            }
        )
    ])
    def test_get_all_subscriptions_ids(self):
        self.assertListEqual(
            ['first', 'second'],
            list(self.smart_things_devices_connector.get_all_subscriptions_ids())
        )

    @RequestMock.assert_requests([
        RequestMock(
            request_url=f'{SmartThingsApiConnector.Endpoint.LOCATIONS}/4383b05c-5dda-42f5/rooms/afedba4f-d198-4349',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceRoomDetailsResponse.KITCHEN,
            request_headers={'Authorization': 'Bearer auth token'}
        )
    ])
    def test_get_room_detail(self):
        room_details = SmartThingsApiConnector(self.smart_things_app).get_room_detail('4383b05c-5dda-42f5',
                                                                                      'afedba4f-d198-4349')
        self.assertEqual(
            SmartThingsRoomDetail.from_json(self.SmartThingsDeviceRoomDetailsResponse.KITCHEN),
            room_details
        )

    @RequestMock.assert_requests([
        RequestMock(
            request_url=f'{SmartThingsApiConnector.Endpoint.DEVICES}/the_id',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_WITH_ROOM,
            request_headers={'Authorization': 'Bearer auth token'}
        ),
        RequestMock(
            request_url=f'{SmartThingsApiConnector.Endpoint.LOCATIONS}/4383b05c-5dda-42f5/rooms/afedba4f-d198-4349',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceRoomDetailsResponse.KITCHEN,
            request_headers={'Authorization': 'Bearer auth token'}
        )
    ])
    def test_get_device_detail_with_room(self):
        devices_detail = self.smart_things_devices_connector.get_device_detail('the_id')
        room_details = SmartThingsRoomDetail.from_json(self.SmartThingsDeviceRoomDetailsResponse.KITCHEN)
        expected_device_details = DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.SWITCH_WITH_ROOM)
        expected_device_details = expected_device_details._replace(room=room_details)
        self.assertEqual(
            devices_detail,
            expected_device_details
        )

    @RequestMock.assert_requests([
        request_mock_get_device_status(
            response_json={
                "deviceId": "8d975a53-0196-4917-ad59-aacf9d34a592",
                "state": "ONLINE",
                "lastUpdatedDate": "2000-01-01T00:00:42.000+0000"
            }
        ),
        request_mock_get_device_status(
            response_json={
                "deviceId": "8d975a53-0196-4917-ad59-aacf9d34a592",
                "state": "OFFLINE",
                "lastUpdatedDate": "2001-02-02T00:42:00.000+0000"
            }
        ),
        request_mock_get_device_status(
            response_json={
                "deviceId": "8d975a53-0196-4917-ad59-aacf9d34a592",
                "state": "UNEXISTED_STATUS",
                "lastUpdatedDate": "2002-03-03T12:00:00.000+0000"
            },
        ),
        request_mock_get_device_status(
            response_json={
                "deviceId": "8d975a53-0196-4917-ad59-aacf9d34a592",
                "state": "OFFLINE",
                "lastUpdatedDate": "unsupported_date_format"
            },
        ),
        request_mock_get_device_status(
            response_status_code=HTTPStatus.NOT_FOUND
        ),
    ])
    def test_update_device_status(self):
        device = self.get_smart_things_device(self.SmartThingsDeviceDetailsResponse.SWITCH)
        device.status = device.Status.UNKNOWN
        device.status_updated_at = datetime.now(tz=timezone.utc)
        device.save()

        with self.subTest("ONLINE"):
            device.update_status()
            device.refresh_from_db()
            self.assertEqual(device.status, device.Status.ONLINE)
            self.assertEqual(
                device.status_updated_at,
                datetime(2000, 1, 1, 0, 0, 42, tzinfo=timezone.utc)
            )
        with self.subTest("OFFLINE"):
            device.update_status()
            device.refresh_from_db()
            self.assertEqual(device.status, device.Status.OFFLINE)
            self.assertEqual(
                device.status_updated_at,
                datetime(2001, 2, 2, 0, 42, 0, tzinfo=timezone.utc)
            )
        with self.subTest("Bad status"):
            device.update_status()
            device.refresh_from_db()
            self.assertEqual(device.status, device.Status.UNKNOWN)
            self.assertEqual(
                device.status_updated_at,
                datetime(2002, 3, 3, 12, 0, 0, tzinfo=timezone.utc)
            )
        with self.subTest("Bad date"):
            device.update_status()
            device.refresh_from_db()
            self.assertEqual(device.status, device.Status.OFFLINE)
            self.assertEqual(
                None,
                device.status_updated_at,
            )
        with self.subTest("Not found"):
            device.update_status()
            device.refresh_from_db()
            self.assertEqual(device.status, device.Status.UNKNOWN)
            self.assertGreater(
                device.status_updated_at + timedelta(seconds=2),
                datetime.now(tz=timezone.utc)
            )

    @patch('apps.smart_things_devices.models.SmartThingsDevice.update_status')
    @patch('apps.smart_things_apps.models.SmartThingsApp.refresh_auth_token')
    def test_refresh_token_when_device_update_fails(self, auth_token_mock: Mock, update_status_mock: Mock):
        # prepare device for update
        device = self.get_smart_things_device(self.SmartThingsDeviceDetailsResponse.SWITCH)
        device.status_updated_at = datetime.now(tz=timezone.utc) - timedelta(hours=6)
        device.save()

        def raise_smart_things_error():
            """side effect for update device status"""
            _ = self.smart_things_app.auth_token # trigger getter
            raise SmartThingsError("401")

        new_auth = 'token'
        new_refresh = 'refresh_token'

        def set_new_token(_id):
            SmartThingsApp.objects.filter(id=_id).update(_auth_token=new_auth, refresh_token=new_refresh)

        update_status_mock.side_effect = raise_smart_things_error
        auth_token_mock.side_effect = set_new_token

        with patch('apps.smart_things_apps.models.SmartThingsApp.is_token_expired', Mock(return_value=True)):
            self.assertRaises(SmartThingsError, SmartThingsDevice.update_status)

        self.assertEqual(auth_token_mock.call_count, 1)
        self.assertEqual(update_status_mock.call_count, 1)

        self.assertEqual(self.smart_things_app.auth_token, new_auth)
        self.assertEqual(self.smart_things_app.refresh_token, new_refresh)

    @RequestMock.assert_requests([
        RequestMock(
            request_method=RequestMock.Method.GET,
            request_url='https://api.smartthings.com/v1/devices/d291e713-b53f-4022-af85-c84e06e3e16a/'
                        'components/main/capabilities/battery/status',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceFetchStateResponse.BATTERY,
            request_headers={'Authorization': 'Bearer auth token'}
        ),
        RequestMock(
            request_method=RequestMock.Method.GET,
            request_url='https://api.smartthings.com/v1/devices/d2911111/'
                        'components/main/capabilities/battery/status',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceFetchStateResponse.BATTERY,
            request_headers={'Authorization': 'Bearer auth token'} 
        ),
    ])
    def test_smart_things_devices_refresh_battery_health(self):
        smart_things_devices_with_battery_capability = \
            list(SmartThingsDevice.get_devices_for_updating_battery_health())

        self.assertEqual(2, len(smart_things_devices_with_battery_capability))
        self.assertTrue(all(smart_things_device.battery_health is None \
            for smart_things_device in smart_things_devices_with_battery_capability))
        
        for smart_things_device in smart_things_devices_with_battery_capability:
            smart_things_device.update_battery_health()
            self.assertEqual(smart_things_device.battery_health,
                             self.SmartThingsDeviceFetchStateResponse.BATTERY['battery']['value'])
