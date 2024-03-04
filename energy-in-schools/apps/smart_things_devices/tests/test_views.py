import json
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from unittest.mock import MagicMock, patch

from django.test import override_settings

from apps.accounts.permissions import RoleName
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_devices.base_test_case import SmartThingsDevicesBaseTestCase
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.types import DeviceDetail
from utilities.requests_mock import RequestMock


@override_settings(DELETE_DEVICES_ON_REFRESH=True)
class TestSmartThingsDevices(SmartThingsDevicesBaseTestCase):
    URL = '/api/v1/smart-things/devices/'
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN

    @SmartThingsDevicesBaseTestCase.mock_smart_things_list_devices([
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_CONNECTED,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_NEW,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_NEW,
    ])
    def test_refresh_list(self):
        mocked_light_response = SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE
        SmartThingsApp.objects.update(updated_at=datetime.now(timezone.utc) - timedelta(days=1))

        SmartThingsDevice.refresh_devices(self.location)
        response = self.client.get(self.get_url())

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(6, len(response.data))
        light_with_color_temperature = next(
            (device for device in response.data if device['label'] == mocked_light_response['label']), None)
        self.assertIsNotNone(light_with_color_temperature)
        light_copy = light_with_color_temperature.copy()
        self.assertIsNotNone(light_copy.pop('created_at'))
        self.assertIsNotNone(light_copy.pop('id'))
        self.assertDictValuesOnly({
            'name': mocked_light_response['name'],
            'label': mocked_light_response['label'],
            'smart_things_id': mocked_light_response['deviceId'],
            'smart_things_location': mocked_light_response['locationId'],
            'is_connected': False,
        }, dict(light_copy))

        self.assertEqual(6, SmartThingsDevice.objects.count())

        for is_connected, details in (
                (False, self.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE),
                (False, self.SmartThingsDeviceDetailsResponse.MOTION_SENSOR),
                (True, self.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED),
                (True, self.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_CONNECTED),
                (False, self.SmartThingsDeviceDetailsResponse.SWITCH_NEW),
                (False, self.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_NEW),
        ):
            with self.subTest(f'Checking {details["label"]}'):
                device_details = DeviceDetail.from_json(details)
                self.assertEqual(
                    device_details,
                    SmartThingsDevice.objects.get(smart_things_id=device_details.device_id)
                )

    @SmartThingsDevicesBaseTestCase.mock_smart_things_list_devices([
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_CONNECTED,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_NEW,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_NEW,
    ])
    def test_refresh_list_enable_delete_device(self):
        with self.settings(DELETE_DEVICES_ON_REFRESH=False):
            SmartThingsDevice.refresh_devices(self.location)
            response = self.client.get(self.get_url())
            self.assertEqual(10, len(response.data))

        with self.settings(DELETE_DEVICES_ON_REFRESH=True):
            SmartThingsDevice.refresh_devices(self.location)
            response = self.client.get(self.get_url())
            self.assertEqual(6, len(response.data))

    @SmartThingsDevicesBaseTestCase.mock_smart_things_list_devices([
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED,
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_CONNECTED,
        {**SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_NEW, 'locationId': 'XXX'},
        SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_NEW,
    ], False)
    def test_different_smart_things_locations_devices(self):
        SmartThingsDevice.refresh_devices(self.location)
        response = self.client.get(self.get_url())

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(6, len(response.data))

        self.assertGreater(len(set([device['smart_things_id'] for device in response.data])), 1)

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector')
    def test_list_without_app(self, mock: MagicMock):
        self.smart_things_app.delete()
        SmartThingsDevice.objects.all().delete()
        response = self.client.get(self.get_url())
        self.assertEqual(HTTPStatus.OK, response.status_code)
        mock.assert_not_called()

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.update_device_label')
    def test_change(self, mock: MagicMock):
        device_id = SmartThingsDevice.objects.get(
            smart_things_id=DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.MOTION_SENSOR).device_id
        ).id

        with self.subTest('Change label for unconnected'):
            response = self.client.patch(self.get_url(device_id), data=json.dumps({
                'label': 'new'
            }), content_type='application/json')
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)
            mock.assert_not_called()

        with self.subTest('Change is_connected to True'):
            response = self.client.patch(self.get_url(device_id), data=json.dumps({
                'is_connected': True
            }), content_type='application/json')
            self.assertEqual(HTTPStatus.OK, response.status_code)
            mock.assert_not_called()

        with self.subTest('Change label to too short'):
            response = self.client.patch(self.get_url(device_id), data=json.dumps({
                'label': 'n'
            }), content_type='application/json')
            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
            mock.assert_not_called()

        with self.subTest('Change label (wrong format)'):
            response = self.client.patch(self.get_url(device_id), data=json.dumps({
                'label': 'new label'
            }), content_type='application/json')
            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)

        with self.subTest('Change label'):
            response = self.client.patch(self.get_url(device_id), data=json.dumps({
                'label': 'new-label'
            }), content_type='application/json')
            self.assertEqual(HTTPStatus.OK, response.status_code)
            mock.assert_called_once()

        with self.subTest('Change label to the same value'):
            response = self.client.patch(self.get_url(device_id), data=json.dumps({
                'label': 'new-label'
            }), content_type='application/json')
            self.assertEqual(HTTPStatus.OK, response.status_code)
            mock.assert_called_once()

    def test_restore(self):
        with SmartThingsDevicesBaseTestCase.mock_smart_things_list_devices([
            SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
        ]):
            SmartThingsDevice.refresh_devices(self.location)

        device = SmartThingsDevice.objects.get()

        with SmartThingsDevicesBaseTestCase.mock_smart_things_list_devices([
        ]):
            SmartThingsDevice.refresh_devices(self.location)

        self.assertFalse(SmartThingsDevice.objects.exists())

        with SmartThingsDevicesBaseTestCase.mock_smart_things_list_devices([
            SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
        ]):
            SmartThingsDevice.refresh_devices(self.location)

        self.assertEqual(device.id, SmartThingsDevice.objects.get().id)

    @RequestMock.assert_requests([
        RequestMock(
            request_url='https://api.smartthings.com/v1/devices',
            response_json={'_links': {'next': None, 'previous': None}, 'items': [
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR,
                SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_WITH_ROOM
            ]},
            request_headers={'Authorization': 'Bearer auth token'},
        ),
        RequestMock(
            request_url='https://api.smartthings.com/v1/locations/4383b05c-5dda-42f5/rooms/afedba4f-d198-4349',
            response_json=SmartThingsDevicesBaseTestCase.SmartThingsDeviceRoomDetailsResponse.KITCHEN,
            request_headers={'Authorization': 'Bearer auth token'}
        ),
        RequestMock(
            request_url='https://api.smartthings.com/v1/devices/d291e713-b53f-4022-af85-c84e06e3e16a/health',
            response_json={
                "deviceId": "8d975a53-0196-4917-ad59-aacf9d34a592",
                "state": "ONLINE",
                "lastUpdatedDate": "2000-01-01T00:00:42.000+0000"
            },
            request_headers={'Authorization': 'Bearer auth token'}
        ),
    ])
    def test_refresh_list_with_room(self):
        SmartThingsDevice.refresh_devices(self.location)
        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual(2, len(response.data))
        switch_label = SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.SWITCH_WITH_ROOM['label']
        motion_label = SmartThingsDevicesBaseTestCase.SmartThingsDeviceDetailsResponse.MOTION_SENSOR['label']
        room_name = SmartThingsDevicesBaseTestCase.SmartThingsDeviceRoomDetailsResponse.KITCHEN['name']
        switch_with_room = next((device for device in response.data if device['label'] == switch_label), None)
        motion_sensor = next((device for device in response.data if device['label'] == motion_label), None)
        self.assertIsNotNone(switch_with_room)
        self.assertIsNotNone(motion_sensor)
        self.assertIsNone(motion_sensor['room_name'])
        self.assertEqual(switch_with_room['room_name'], room_name)

    def test_get_detailed_smart_things_devices(self):
        DEVICES_BY_LOCATION = f'/api/v1/locations/{self.location.id}/smart-things-devices/'

        # get by SLE admin
        response = self.client.get(DEVICES_BY_LOCATION)
        self.assertResponse(response, HTTPStatus.FORBIDDEN)

        # login as admin
        self.client.force_login(self.get_user(RoleName.ADMIN))

        # get by Admin
        response = self.client.get(DEVICES_BY_LOCATION)
        self.assertResponse(response)
        self.assertEqual(len(response.json()), SmartThingsDevice.objects.filter(sub_location=self.location).count())
