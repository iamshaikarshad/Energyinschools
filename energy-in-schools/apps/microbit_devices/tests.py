from datetime import datetime, timezone
from http import HTTPStatus
from unittest.mock import MagicMock, patch

from apps.hubs.base_test_case import HubBaseTestCase
from apps.resources.types import MotionState, ResourceValue, SwitchState
from apps.smart_things_devices.base_test_case import SmartThingsDevicesBaseTestCase
from apps.smart_things_devices.exceptions import CapabilitiesMismatchException
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.types import Capability, DeviceDetail
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from utilities.url_tools import get_converter_by_enum


class TestMicrobitDevices(SmartThingsDevicesBaseTestCase, SmartThingsSensorsBaseTestCase, HubBaseTestCase):
    URL = '/api/v1/micro-bit/devices/'

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.get_device_states',
           return_value=SwitchState.OFF)
    def test_get_state(self, mock: MagicMock):
        device = DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED)
        response = self.client.get(self.get_url(device.label, 'switch'), **self.get_hub_headers(
            hub_uid=self.hub.uid,
            location_uid=self.location.uid
        ))
        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual('off', response.data['value'])
        mock.assert_called_with(device.device_id, Capability.SWITCH)

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.get_device_states')
    def test_get_from_database(self, mock: MagicMock):
        SmartThingsDevice.objects.update(is_connected=True)
        self._set_capabilities(self.smart_things_device, [Capability.MOTION_SENSOR])

        value = ResourceValue(
            time=datetime.now(tz=timezone.utc),
            value=1
        )
        self.smart_things_sensor.add_value(value)

        response = self.client.get(self.get_url(
            self.smart_things_device.label,
            'motion-sensor'
        ), **self.get_hub_headers(
            hub_uid=self.hub.uid,
            location_uid=self.location.uid
        ))

        self.assertResponse(response)
        mock.assert_not_called()
        self.assertEqual(dict(
            time=self.format_datetime(value.time.replace(microsecond=0)),
            value=MotionState.ACTIVE.value,
        ), response.data)

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.execute_command')
    def test_send_command(self, mock: MagicMock):
        device = DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED)
        response = self.client.post(self.get_url(device.label, 'switch'), {
            'value': 'off'
        }, **self.get_hub_headers(
            hub_uid=self.hub.uid,
            location_uid=self.location.uid
        ))
        self.assertEqual(HTTPStatus.OK, response.status_code)
        mock.assert_called_with(device.device_id, Capability.SWITCH, SwitchState.OFF)

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.execute_command')
    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.get_device_states')
    def test_send_command_mismatch_capabilities(self, _, __):
        '''Request to execture capability that is not in device capabilities list'''

        converter = get_converter_by_enum(Capability)

        capability_not_in_device_capabilities_list: Capability = Capability.COLOR_CONTROL
        capability_not_in_microbit_capabilities_list: Capability = Capability.POWER_METER

        device = DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED)

        with self.subTest('Capability in supported list of capabilities for microbit'):
            response = self.client.post(
                self.get_url(device.label, converter.to_url(capability_not_in_device_capabilities_list)), {
                    'value': 1
                }, **self.get_hub_headers(
                    hub_uid=self.hub.uid,
                    location_uid=self.location.uid
                ))
            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
            self.assertEqual(response.json(),
                             CapabilitiesMismatchException.get_error_message(
                                 capability_not_in_device_capabilities_list))

            response = self.client.get(
                self.get_url(device.label, converter.to_url(capability_not_in_device_capabilities_list)),
                **self.get_hub_headers(
                hub_uid=self.hub.uid,
                location_uid=self.location.uid
            ))
            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)

        with self.subTest('Capability not in supported list of capabilities for microbit'):
            response = self.client.post(
                self.get_url(device.label, converter.to_url(capability_not_in_microbit_capabilities_list)), {
                    'value': 1
                }, **self.get_hub_headers(
                    hub_uid=self.hub.uid,
                    location_uid=self.location.uid
                ))
            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
            self.assertEqual(response.json(), {'non_field_errors': ['The capability is not acceptable!']})

        with self.subTest('Legacy capability names should be accepted'):
            motion_sensor = DeviceDetail.from_json(self.SmartThingsDeviceDetailsResponse.MOTION_SENSOR_CONNECTED)
            for legacy_name, value in {'motion': 'active', 'temperature': 1}.items():
                response = self.client.post(
                    self.get_url(motion_sensor.label, legacy_name), {
                        'value': value,
                    }, **self.get_hub_headers(
                        hub_uid=self.hub.uid,
                        location_uid=self.location.uid
                    ))
                self.assertResponse(response)
