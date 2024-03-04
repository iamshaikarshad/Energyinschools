import json
from unittest.mock import MagicMock, patch

from rest_framework import status

from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from apps.smart_things_web_hooks.handlers import SmartAppWebHookHandler
from apps.smart_things_web_hooks.settings import get_config_page_data, get_initialize_page_data


header_verifier_mock = MagicMock(name='header_verifier_mock')
header_verifier_mock.verify.return_value = True
header_verifier_class_mock = MagicMock(name='header_verifier_class_mock')
header_verifier_class_mock.return_value = header_verifier_mock


class TestSmartThingsClientApi(SmartThingsSensorsBaseTestCase):
    URL = '/api/v1/smart-things/web-hooks/automations/'

    def test_ping(self):
        response = self.client.post(
            self.get_url(self.smart_things_connector.connector_name),
            json.dumps(self._get_ping_request()),
            content_type="application/json"
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertDictEqual({'pingData': self._get_ping_request()['pingData']}, response.json())

    # @patch('apps.smart_things_web_hooks.handlers.HeaderVerifier', new=header_verifier_class_mock)
    def test_initialize_phase(self):
        response = self.client.post(
            self.get_url(self.smart_things_connector.connector_name),
            json.dumps(self._get_initialize_request()),
            content_type="application/json"
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertDictEqual({'configurationData': get_initialize_page_data(SmartAppWebHookHandler.smart_app_info)},
                             response.json())

    # @patch('apps.smart_things_web_hooks.handlers.HeaderVerifier', new=header_verifier_class_mock)
    def test_page_phase(self):
        response = self.client.post(
            self.get_url(self.smart_things_connector.connector_name),
            json.dumps(self._get_page_request()),
            content_type="application/json"
        )
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertDictEqual({'configurationData': get_config_page_data()}, response.json())

    # @patch('apps.smart_things_web_hooks.handlers.HeaderVerifier', new=header_verifier_class_mock)
    def test_install(self):
        SmartThingsApp.objects.all().delete()

        with self.subTest('Install Phase'):
            user = self.get_user()
            install_request = self._get_install_request(user.username, self.USER_PASSWORD, user.location.uid)
            response = self.client.post(
                self.get_url(self.smart_things_connector.connector_name),
                json.dumps(install_request),
                content_type="application/json"
            )
            self.assertEqual(status.HTTP_200_OK, response.status_code)

            smart_apps = SmartThingsApp.objects.all()
            self.assertEqual(1, len(smart_apps))
            self.assertEqual(smart_apps.first().auth_token, install_request['installData']['authToken'])
            self.assertEqual(smart_apps.first().refresh_token, install_request['installData']['refreshToken'])

            self.assertDictEqual({"installData": {}}, response.json())

        with self.subTest('Uninstall Phase'):
            uninstall_request = self._get_uninstall_request(user.username, self.USER_PASSWORD, user.location.uid)
            response = self.client.post(
                self.get_url(self.smart_things_connector.connector_name),
                json.dumps(uninstall_request),
                content_type="application/json"
            )
            self.assertEqual(status.HTTP_200_OK, response.status_code)

            smart_apps = SmartThingsApp.objects.all()
            self.assertEqual(0, len(smart_apps))

            self.assertDictEqual({"uninstallData": {}}, response.json())

    # @patch('apps.smart_things_web_hooks.handlers.HeaderVerifier', new=header_verifier_class_mock)
    def test_handle_device_events(self):
        response = self.client.post(
            self.get_url(self.smart_things_connector.connector_name),
            json.dumps(self._get_device_event_request()),
            content_type="application/json"
        )
        self.assertResponse(response)
        self.assertDictEqual({'eventData': {}}, response.json())

    @staticmethod
    def _get_ping_request():
        return \
            {
                "lifecycle": "PING",
                "executionId": "b328f242-c602-4204-8d73-33c48ae180af",
                "locale": "en",
                "version": "1.0.0",
                "pingData": {
                    "challenge": "1a904d57-4fab-4b15-a11e-1c4bfe7cb502"
                }
            }

    @staticmethod
    def _get_initialize_request():
        return \
            {
                "lifecycle": "CONFIGURATION",
                "executionId": "85f0047b-bb24-8eeb-da11-cb6e2f767322",
                "locale": "en",
                "version": "0.1.0",
                "configurationData": {
                    "installedAppId": "8a0dcdc9-1ab4-4c60-9de7-cb78f59a1121",
                    "phase": "INITIALIZE",
                    "pageId": "",
                    "previousPageId": "",
                    "config": {

                    }
                },
                "settings": {

                }
            }

    @staticmethod
    def _get_page_request():
        return \
            {
                "lifecycle": "CONFIGURATION",
                "executionId": "85f0047b-bb24-8eeb-da11-cb6e2f767322",
                "locale": "en",
                "version": "0.1.0",
                "configurationData": {
                    "installedAppId": "8a0dcdc9-1ab4-4c60-9de7-cb78f59a1121",
                    "phase": "PAGE",
                    "pageId": "1",
                    "previousPageId": "",
                    "config": {
                        "app": [
                            {

                            }
                        ]
                    }
                },
                "settings": {

                }
            }

    @staticmethod
    def _get_install_request(username, password, location_id):
        return \
            {
                "lifecycle": "INSTALL",
                "executionId": "85f0047b-bb24-8eeb-da11-cb6e2f767322",
                "locale": "en",
                "version": "0.1.0",
                "installData": {
                    "authToken": "9243b712-7107-4c9f-83d7-e7008c904274",
                    "refreshToken": "84c2bc86-1706-4b39-a2b8-11d5077f3c06",
                    "installedApp": {
                        "installedAppId": "8a0dcdc9-1ab4-4c60-9de7-cb78f59a1121",
                        "locationId": "31efb1f7-a72f-488b-8328-8dd5a4332934",
                        "config": {
                            "app": [
                                {

                                }
                            ],
                            "sle_username": [
                                {
                                    "valueType": "STRING",
                                    "stringConfig": {
                                        "value": username
                                    }
                                }
                            ],
                            "sle_password": [
                                {
                                    "valueType": "STRING",
                                    "stringConfig": {
                                        "value": password
                                    }
                                }
                            ]
                        },
                        "permissions": [
                            "x:devices:*",
                            "l:devices",
                            "r:devices:*",
                            "w:devices:*"
                        ]
                    }
                },
                "settings": {

                }
            }

    @staticmethod
    def _get_uninstall_request(username, password, location_id):
        return \
            {
                "lifecycle": "UNINSTALL",
                "executionId": "85f0047b-bb24-8eeb-da11-cb6e2f767322",
                "locale": "en",
                "version": "0.1.0",
                "uninstallData": {
                    "authToken": "9243b712-7107-4c9f-83d7-e7008c904274",
                    "refreshToken": "84c2bc86-1706-4b39-a2b8-11d5077f3c06",
                    "installedApp": {
                        "installedAppId": "8a0dcdc9-1ab4-4c60-9de7-cb78f59a1121",
                        "locationId": "31efb1f7-a72f-488b-8328-8dd5a4332934",
                        "config": {
                            "app": [
                                {

                                }
                            ],
                            "sle_username": [
                                {
                                    "valueType": "STRING",
                                    "stringConfig": {
                                        "value": username
                                    }
                                }
                            ],
                            "sle_password": [
                                {
                                    "valueType": "STRING",
                                    "stringConfig": {
                                        "value": password
                                    }
                                }
                            ]
                        },
                        "permissions": [
                            "x:devices:*",
                            "l:devices",
                            "r:devices:*",
                            "w:devices:*"
                        ]
                    }
                },
                "settings": {

                }
            }

    def _get_device_event_request(self):
        return {
            "lifecycle": "EVENT",
            "executionId": "b328f242-c602-4204-8d73-33c48ae180af",
            "locale": "en",
            "version": "1.0.0",
            "eventData": {
                "authToken": "f01894ce-013a-434a-b51e-f82126fd72e4",
                "installedApp": {
                    "installedAppId": "d692699d-e7a6-400d-a0b7-d5be96e7a564",
                    "locationId": "e675a3d9-2499-406c-86dc-8a492a886494",
                    "config": {
                        "contactSensor": [
                            {
                                "valueType": "DEVICE",
                                "deviceConfig": {
                                    "deviceId": "e457978e-5e37-43e6-979d-18112e12c961",
                                    "componentId": "main"
                                }
                            }
                        ],
                        "lightSwitch": [
                            {
                                "valueType": "DEVICE",
                                "deviceConfig": {
                                    "deviceId": "74aac3bb-91f2-4a88-8c49-ae5e0a234d76",
                                    "componentId": "main"
                                }
                            }
                        ],
                        "minutes": [
                            {
                                "valueType": "STRING",
                                "stringConfig": {
                                    "value": "5"
                                }
                            }
                        ],
                        "permissions": [
                            "r:devices:e457978e-5e37-43e6-979d-18112e12c961",
                            "r:devices:74aac3bb-91f2-4a88-8c49-ae5e0a234d76",
                            "x:devices:74aac3bb-91f2-4a88-8c49-ae5e0a234d76"
                        ]
                    }
                },
                "events": [
                    {
                        "eventType": "DEVICE_EVENT",
                        "deviceEvent": {
                            "subscriptionName": "motion_sensors",
                            "eventId": "736e3903-001c-4d40-b408-ff40d162a06b",
                            "locationId": "499e28ba-b33b-49c9-a5a1-cce40e41f8a6",
                            "deviceId": self.smart_things_device.smart_things_id,
                            "componentId": "main",
                            "capability": "motionSensor",
                            "attribute": "motion",
                            "value": "active",
                            "stateChange": True
                        }
                    }
                ]
            },
            "settings": {
                "property1": "string",
                "property2": "string"
            }
        }
