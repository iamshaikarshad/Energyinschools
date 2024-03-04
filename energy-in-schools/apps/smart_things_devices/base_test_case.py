from contextlib import contextmanager
from typing import Any, Dict, List
from unittest.mock import patch

from responses import RequestsMock

from apps.smart_things_apps.base_test_case import SmartThingsAppBaseTestCase
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.types import DeviceDetail
from apps.smart_things_devices.utilities.connectors import SmartThingsApiConnector


class SmartThingsDevicesBaseTestCase(SmartThingsAppBaseTestCase):
    class SmartThingsDeviceDetailsResponse:
        SWITCH = {'components': [{'capabilities': [{'id': 'switch'},
                                                   {'id': 'configuration'},
                                                   {'id': 'refresh'},
                                                   {'id': 'powerMeter'},
                                                   {'id': 'sensor'},
                                                   {'id': 'actuator'},
                                                   {'id': 'healthCheck'},
                                                   {'id': 'outlet'}],
                                  'id': 'main'}],
                  'deviceId': '8d975a53-0196-4917-ad59-aacf9d34a592',
                  'deviceManufacturerCode': None,
                  'deviceNetworkType': 'ZIGBEE',
                  'deviceTypeId': '575cca07-1d9f-4b3d-9fda-c663d8d53051',
                  'deviceTypeName': 'SmartPower Outlet',
                  'dth': {'deviceNetworkType': 'ZIGBEE',
                          'deviceTypeId': '575cca07-1d9f-4b3d-9fda-c663d8d53051',
                          'deviceTypeName': 'SmartPower Outlet'},
                  'label': 'switch',
                  'locationId': SmartThingsAppBaseTestCase.smart_things_location_id,
                  'name': 'Outlet',
                  'type': 'DTH'}
        LIGHT_SIMPLE = {'components': [{'capabilities': [{'id': 'switch'},
                                                         {'id': 'configuration'},
                                                         {'id': 'switchLevel'},
                                                         {'id': 'refresh'},
                                                         {'id': 'actuator'},
                                                         {'id': 'healthCheck'},
                                                         {'id': 'light'}],
                                        'id': 'main'}],
                        'deviceId': '1439773a-c144-41cd-9c5d-d1b03d3fe0a1',
                        'deviceManufacturerCode': None,
                        'deviceNetworkType': 'ZIGBEE',
                        'deviceTypeId': '52969956-9ba8-46ba-873e-1bb46cfef033',
                        'deviceTypeName': 'ZigBee Dimmer',
                        'dth': {'deviceNetworkType': 'ZIGBEE',
                                'deviceTypeId': '52969956-9ba8-46ba-873e-1bb46cfef033',
                                'deviceTypeName': 'ZigBee Dimmer'},
                        'label': 'light-simple',
                        'locationId': SmartThingsAppBaseTestCase.smart_things_location_id,
                        'name': 'Sengled Element Classic',
                        'type': 'DTH'}
        LIGHT_WITH_COLOR_TEMPERATURE = {'components': [{'capabilities': [{'id': 'switch'},
                                                                         {'id': 'configuration'},
                                                                         {'id': 'switchLevel'},
                                                                         {'id': 'refresh'},
                                                                         {'id': 'actuator'},
                                                                         {'id': 'colorTemperature'},
                                                                         {'id': 'healthCheck'},
                                                                         {'id': 'light'}],
                                                        'id': 'main'}],
                                        'deviceId': '153f19dd-b612-4694-a1f6-227795cff7ed',
                                        'deviceManufacturerCode': None,
                                        'deviceNetworkType': 'ZIGBEE',
                                        'deviceTypeId': '5bdc8578-2f15-4c5b-9e1d-5d9c9f718c72',
                                        'deviceTypeName': 'ZigBee White Color Temperature Bulb',
                                        'dth': {'deviceNetworkType': 'ZIGBEE',
                                                'deviceTypeId': '5bdc8578-2f15-4c5b-9e1d-5d9c9f718c72',
                                                'deviceTypeName': 'ZigBee White Color Temperature Bulb'},
                                        'label': 'light-with-color-temperature',
                                        'locationId': SmartThingsAppBaseTestCase.smart_things_location_id,
                                        'name': 'Sengled Element Plus',
                                        'type': 'DTH'}
        MOTION_SENSOR = {'components': [{'capabilities': [{'id': 'temperatureMeasurement'},
                                                          {'id': 'battery'},
                                                          {'id': 'motionSensor'},
                                                          {'id': 'configuration'},
                                                          {'id': 'refresh'},
                                                          {'id': 'sensor'},
                                                          {'id': 'healthCheck'}],
                                         'id': 'main'}],
                         'deviceId': 'd291e713-b53f-4022-af85-c84e06e3e16a',
                         'deviceManufacturerCode': None,
                         'deviceNetworkType': 'ZIGBEE',
                         'deviceTypeId': '821425e6-b305-468a-9a27-db0e4852ce3a',
                         'deviceTypeName': 'SmartSense Motion Sensor',
                         'dth': {'deviceNetworkType': 'ZIGBEE',
                                 'deviceTypeId': '821425e6-b305-468a-9a27-db0e4852ce3a',
                                 'deviceTypeName': 'SmartSense Motion Sensor'},
                         'label': 'motion-sensor',
                         'locationId': SmartThingsAppBaseTestCase.smart_things_location_id,
                         'name': 'Motion Sensor',
                         'type': 'DTH'}
        SWITCH_CONNECTED = {**SWITCH, 'deviceId': SWITCH['deviceId'][:4] + '1111', 'label': 'switch-connected'}
        LIGHT_SIMPLE_CONNECTED = {**LIGHT_SIMPLE, 'deviceId': LIGHT_SIMPLE['deviceId'][:4] + '1111',
                                  'label': 'light-simple-connected'}
        LIGHT_WITH_COLOR_TEMPERATURE_CONNECTED = {**LIGHT_WITH_COLOR_TEMPERATURE,
                                                  'deviceId': LIGHT_WITH_COLOR_TEMPERATURE['deviceId'][:4] + '1111',
                                                  'label': 'light-with-color-temperature-connected'}
        MOTION_SENSOR_CONNECTED = {**MOTION_SENSOR, 'deviceId': MOTION_SENSOR['deviceId'][:4] + '1111',
                                   'label': 'motion-sensor-connected'}
        SWITCH_NEW = {**SWITCH, 'deviceId': SWITCH['deviceId'][:4] + '2222', 'label': 'switch-new'}
        LIGHT_SIMPLE_NEW = {**LIGHT_SIMPLE, 'deviceId': LIGHT_SIMPLE['deviceId'][:4] + '2222',
                            'label': 'light-simple-new'}
        LIGHT_WITH_COLOR_TEMPERATURE_NEW = {**LIGHT_WITH_COLOR_TEMPERATURE,
                                            'deviceId': LIGHT_WITH_COLOR_TEMPERATURE['deviceId'][:4] + '2222',
                                            'label': 'light-with-color-temperature-new'}
        MOTION_SENSOR_NEW = {**MOTION_SENSOR, 'deviceId': MOTION_SENSOR['deviceId'][:4] + '2222',
                             'label': 'motion-sensor-new'}
        SWITCH_WITH_ROOM = {**SWITCH, 'locationId': '4383b05c-5dda-42f5',
                            'roomId': 'afedba4f-d198-4349'}
        MOBILE_PRESENCE = {'components': [{'capabilities': [{'id': 'presenceSensor'},
                                                            {'id': 'sensor'}],
                                           'id': 'main'}],
                           'deviceId': '15c52630-970c-4fc9-b520-22a352e26976',
                           'deviceManufacturerCode': None,
                           'deviceNetworkType': 'UNKNOWN',
                           'deviceTypeId': '8a9d4b1e3bfce38a013bfce42d360015',
                           'deviceTypeName': 'Mobile Presence',
                           'dth': {'deviceNetworkType': 'UNKNOWN',
                                   'deviceTypeId': '8a9d4b1e3bfce38a013bfce42d360015',
                                   'deviceTypeName': 'Mobile Presence'},
                           'label': 'mobile-presence',
                           'locationId': SmartThingsAppBaseTestCase.smart_things_location_id,
                           'name': "samsung camera's Galaxy S9",
                           'type': 'DTH'}


    class SmartThingsDeviceRoomDetailsResponse:
        KITCHEN = {
            "roomId": "afedba4f-d198-4349",
            "locationId": "4383b05c-5dda-42f5",
            "name": "Kitchen",
        }


    class SmartThingsDeviceFetchStateResponse:
        BATTERY = {
            'battery': {
                'value': 99,
                'unit': '%'
            }
        }


    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        with patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.update_device_label'):
            for is_connected, device_details_json in (
                    (False, cls.SmartThingsDeviceDetailsResponse.SWITCH),
                    (False, cls.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE),
                    (False, cls.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE),
                    (False, cls.SmartThingsDeviceDetailsResponse.MOTION_SENSOR),
                    (True, cls.SmartThingsDeviceDetailsResponse.SWITCH_CONNECTED),
                    (True, cls.SmartThingsDeviceDetailsResponse.LIGHT_SIMPLE_CONNECTED),
                    (True, cls.SmartThingsDeviceDetailsResponse.LIGHT_WITH_COLOR_TEMPERATURE_CONNECTED),
                    (True, cls.SmartThingsDeviceDetailsResponse.MOTION_SENSOR_CONNECTED),
            ):
                SmartThingsDevice(sub_location=cls.get_user().location, is_connected=is_connected) \
                    .update_from_details(DeviceDetail.from_json(device_details_json))

    @classmethod
    def get_smart_things_device(cls, details: Dict[str, Any]) -> SmartThingsDevice:
        return SmartThingsDevice.objects.get(smart_things_id=DeviceDetail.from_json(details).device_id)

    @classmethod
    @contextmanager
    def mock_smart_things_list_devices(cls, devices_details: List[Dict[str, Any]],
                                       assert_requests_are_fired: bool = True):
        with RequestsMock(assert_all_requests_are_fired=assert_requests_are_fired) as response:
            response.add(
                method=response.GET,
                url='https://api.smartthings.com/v1/devices',
                json={'_links': {'next': None, 'previous': None}, 'items': devices_details},
            )
            for device_details in devices_details:
                device_id = device_details['deviceId']
                response.add(
                    method=response.GET,
                    url=f"https://api.smartthings.com/v1/devices/{device_id}/health",
                    json={'deviceId': device_id, "state": "ONLINE", "lastUpdatedDate": "2000-01-01T00:00:42.000+0000"}
                )
            yield

    @property
    def smart_things_devices_connector(self):
        return SmartThingsApiConnector(self.smart_things_app)
