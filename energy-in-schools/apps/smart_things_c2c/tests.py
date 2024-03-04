from unittest.mock import MagicMock, patch

import factory
from django.db.models.signals import post_save, pre_delete

from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.smart_things_c2c.base_test_case import SmartThingsC2CBaseTestCase
from apps.smart_things_c2c.models import C2CDeviceToEnergyMeterMap
from apps.smart_things_c2c.utils import CloudDeviceManager
from apps.smart_things_devices.types import App, Attribute, Capability, DTH, DeviceDetail, DeviceProfile


class TestCloudDeviceManager(SmartThingsC2CBaseTestCase, EnergyProviderBaseTestCase):
    @patch('apps.smart_things_c2c.utils.CloudDeviceManager.api_connector')
    def test_reconcile_device_list(self, api_connector_mock: MagicMock):
        with factory.django.mute_signals(post_save, pre_delete):
            energy_meter = self.energy_meter
            energy_meter.name = 'existed'
            energy_meter.save()

            C2CDeviceToEnergyMeterMap.objects.create(
                smart_things_app=self.c2c_smart_things_app,
                device_id='existed',
                device_label='existed',
                device_profile=self.c2c_device_profile,
                energy_meter=self.energy_meter,
            )
            C2CDeviceToEnergyMeterMap.objects.create(
                smart_things_app=self.c2c_smart_things_app,
                device_id='wrong',
                device_label='wrong',
                device_profile=self.c2c_device_profile,
                energy_meter=self.create_energy_meter(name='unconnected'),
            )
            created_device, *devices_on_cloud = [
                DeviceDetail(
                    device_id, '', DTH('', '', ''),
                    App(app_id, '', DeviceProfile(profile_id)),
                    '', '', '', '', '', {}
                ) for device_id, app_id, profile_id in (
                    ('created', self.c2c_smart_things_app.app_id, self.c2c_device_profile.profile_id),
                    ('extra', self.c2c_smart_things_app.app_id, self.c2c_device_profile.profile_id),
                    ('existed', self.c2c_smart_things_app.app_id, self.c2c_device_profile.profile_id),
                    ('wrong', self.c2c_smart_things_app.app_id, 'wrong'),
                    ('wrong', 'wrong', self.c2c_device_profile.profile_id),
                )
            ]

        api_connector_mock.create_device.return_value = created_device
        api_connector_mock.list_devices_details.return_value = devices_on_cloud
        managers = CloudDeviceManager.from_location(self.location)

        for manager in managers:
            manager.reconcile_device_list()

        api_connector_mock.create_device.assert_called_once()
        self.assertEqual('unconnected', api_connector_mock.create_device.call_args[1]['label'])
        api_connector_mock.list_devices_details.assert_called_once()
        api_connector_mock.destroy_device.assert_called_once_with('extra')
        self.assertEqual(
            ['existed', 'created'],
            list(C2CDeviceToEnergyMeterMap.objects.values_list('device_id', flat=True).all())
        )

    @patch('apps.smart_things_c2c.utils.CloudDeviceManager.api_connector')
    def test_reconcile_device_list_multiple_smart_aps(self, api_connector_mock: MagicMock):
        with factory.django.mute_signals(post_save, pre_delete):
            C2CDeviceToEnergyMeterMap.objects.create(
                smart_things_app=self.c2c_smart_things_app,
                device_id='test',
                device_label='test',
                device_profile=self.c2c_device_profile,
                energy_meter=self.energy_meter,
            )

            connector, smartapp, device_profile = self.create_c2c_app()

            C2CDeviceToEnergyMeterMap.objects.create(
                smart_things_app=smartapp,
                device_id='test',
                device_label='test',
                device_profile=device_profile,
                energy_meter=self.energy_meter,
            )

            created_device, *devices_on_cloud = [
                DeviceDetail(
                    device_id, '', DTH('', '', ''),
                    App(app_id, '', DeviceProfile(profile_id)),
                    '', '', '', '', '', {}
                ) for device_id, app_id, profile_id in (
                    ('created', self.c2c_smart_things_app.app_id, self.c2c_device_profile.profile_id),
                    ('created', smartapp.app_id, device_profile.profile_id)
                )
            ]

            api_connector_mock.create_device.return_value = created_device
            api_connector_mock.list_devices_details.return_value = devices_on_cloud
            managers = CloudDeviceManager.from_location(self.location)

            for manager in managers:
                manager.reconcile_device_list()

            self.assertEqual(api_connector_mock.create_device.call_count, len(managers))

    @patch('apps.smart_things_c2c.utils.CloudDeviceManager.api_connector')
    def test_update_device_state(self, api_connector_mock: MagicMock):
        CloudDeviceManager(self.c2c_smart_things_app).set_cloud_device_state('theid', 12345.6789)
        api_connector_mock.send_event.assert_called_once_with(
            'theid',
            Capability.ENERGY_METER,
            Attribute.ENERGY,
            12.346
        )
