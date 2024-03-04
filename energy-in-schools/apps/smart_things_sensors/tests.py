import json
import random
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from unittest.mock import MagicMock, call, patch

import factory
from faker import Factory
from safedelete import HARD_DELETE

from apps.accounts.permissions import RoleName
from apps.historical_data.models import DetailedHistoricalData
from apps.resources.tests import ResourceFactory
from apps.resources.types import MotionState, ResourceValue, ResourceChildType
from apps.resources.models import Resource
from apps.smart_things_devices.models import SmartThingsCapability, SmartThingsDevice
from apps.smart_things_devices.tests.test_connector import SmartThingsDeviceFactory
from apps.smart_things_devices.types import Capability, DeviceEvent, DeviceStatus
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from apps.smart_things_sensors.models import SmartThingsSensor, SmartThingsEnergyMeter
from apps.smart_things_sensors.tasks import update_all_subscriptions
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_providers.models import EnergyProviderAccount
from apps.locations.models import Location
from apps.addresses.models import Address


faker = Factory.create()


class SmartThingsSensorFactory(ResourceFactory):
    class Meta:
        model = SmartThingsSensor

    capability = factory.LazyFunction(lambda: random.choice(list(Capability)))
    device = factory.SubFactory(SmartThingsDeviceFactory)


class SmartThingsEnergyMeterFactory(SmartThingsSensorFactory):
    class Meta:
        model = SmartThingsEnergyMeter

    type = factory.LazyFunction(lambda: random.choice(list(MeterType)))
    capability = Capability.POWER_METER


class TestSmartThingsSensor(SmartThingsSensorsBaseTestCase):
    URL = '/api/v1/smart-things/sensors/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    @patch('apps.resources.models.PullSupportedResource.collect_new_values')
    def test_collect_new_value_if_online(self, collect_new_values_mock):
        SmartThingsDevice.objects.filter(id=self._smart_things_device_id).update(status=DeviceStatus.OFFLINE)
        self.smart_things_sensor.collect_new_values()
        collect_new_values_mock.assert_not_called()

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.update_device_label')
    def test_auto_managing_sensors(self, _):
        self.smart_things_device.delete(force_policy=HARD_DELETE)
        smart_things_device = self.create_smart_things_device(False)

        for label, test_method in (
                ('add capabilities to inactive device', self._test_add_capabilities_to_inactive_device),
                ('active device', self._test_activate_device),
                ('add values to each sensor', self._add_values_to_each_sensor),
                ('change device capabilities', self._test_change_device_capability),
                ('delete device', self._test_delete_device),
                ('recover device', self._test_recover_device),
                ('recover capability', self._test_recover_capability),
        ):
            with \
                    self.subTest(label), \
                    patch('apps.smart_things_sensors.tasks.subscribe_sensor_for_events.apply_async') as subscribe_mock, \
                    patch('apps.smart_things_sensors.tasks.unsubscribe_for_events.delay') as unsubscribe_mock:
                test_method(smart_things_device, subscribe_mock, unsubscribe_mock)

    def _test_add_capabilities_to_inactive_device(
            self,
            smart_things_device: SmartThingsDevice,
            subscribe_mock: MagicMock,
            unsubscribe_mock: MagicMock
    ):
        smart_things_device.save()
        smart_things_device.capabilities.set([
            SmartThingsCapability.objects.create(capability='unsupported'),
            SmartThingsCapability.objects.create(capability=Capability.TEMPERATURE.value),
            SmartThingsCapability.objects.create(capability=Capability.CONTACT_SENSOR.value),
            SmartThingsCapability.objects.create(capability=Capability.MOTION_SENSOR.value),
        ])
        smart_things_device.save()
        self.assertFalse(SmartThingsSensor.objects.exists())
        subscribe_mock.assert_not_called()
        unsubscribe_mock.assert_not_called()

    def _test_activate_device(
            self,
            smart_things_device: SmartThingsDevice,
            subscribe_mock: MagicMock,
            unsubscribe_mock: MagicMock
    ):
        smart_things_device.is_connected = True
        smart_things_device.save()
        self.assertEqual(
            {Capability.TEMPERATURE, Capability.CONTACT_SENSOR, Capability.MOTION_SENSOR},
            set(SmartThingsSensor.objects.values_list('capability', flat=True))
        )
        subscribe_mock.assert_has_calls([
            call(countdown=5, args=(SmartThingsSensor.objects.get(capability=Capability.CONTACT_SENSOR.value).id, ),),
            call(countdown=5, args=(SmartThingsSensor.objects.get(capability=Capability.MOTION_SENSOR.value).id, ),),
        ], any_order=True)
        unsubscribe_mock.assert_not_called()

    @staticmethod
    def _add_values_to_each_sensor(*_):
        for sensor in SmartThingsSensor.objects.all():
            sensor.add_value(ResourceValue(
                time=datetime.now(timezone.utc),
                value=42,
            ))

    def _test_change_device_capability(
            self,
            smart_things_device: SmartThingsDevice,
            subscribe_mock: MagicMock,
            unsubscribe_mock: MagicMock
    ):
        SmartThingsSensor \
            .objects \
            .filter(capability=Capability.CONTACT_SENSOR.value) \
            .update(events_subscription_id='contact sensor')

        smart_things_device.capabilities.remove(
            SmartThingsCapability.objects.get(capability=Capability.CONTACT_SENSOR.value)
        )
        smart_things_device.capabilities.add(
            SmartThingsCapability.objects.create(capability=Capability.BUTTON.value)
        )
        smart_things_device.save()
        self.assertEqual(
            {Capability.TEMPERATURE, Capability.BUTTON, Capability.MOTION_SENSOR},
            set(SmartThingsSensor.objects.values_list('capability', flat=True))
        )
        subscribe_mock.assert_called_once_with(
            countdown=5, args=(SmartThingsSensor.objects.get(capability=Capability.BUTTON.value).id,)
        )
        unsubscribe_mock.assert_called_once_with(self._smart_things_app_id, 'contact sensor')

    def _test_delete_device(self, smart_things_device, subscribe_mock, unsubscribe_mock):
        SmartThingsSensor.objects.filter(capability=Capability.BUTTON).update(events_subscription_id='button')
        SmartThingsSensor.objects.filter(capability=Capability.MOTION_SENSOR).update(events_subscription_id='motion')

        smart_things_device.delete()
        self.assertFalse(SmartThingsSensor.objects.exists())
        subscribe_mock.assert_not_called()
        unsubscribe_mock.assert_has_calls([
            call(self._smart_things_app_id, 'button'),
            call(self._smart_things_app_id, 'motion'),
        ], any_order=True)
        self.assertEqual(2, unsubscribe_mock.call_count)

    def _test_recover_device(
            self,
            smart_things_device: SmartThingsDevice,
            subscribe_mock: MagicMock,
            unsubscribe_mock: MagicMock
    ):
        smart_things_device.save()

        self.assertEqual(
            {Capability.BUTTON, Capability.MOTION_SENSOR, Capability.TEMPERATURE},
            set(smart_things_device.sensors.values_list('capability', flat=True))
        )

        subscribe_mock.assert_has_calls([
            call(countdown=5, args=(SmartThingsSensor.objects.get(capability=Capability.BUTTON).id, )),
            call(countdown=5, args=(SmartThingsSensor.objects.get(capability=Capability.MOTION_SENSOR).id, ))
        ], any_order=True)
        self.assertEqual(2, subscribe_mock.call_count)
        unsubscribe_mock.assert_not_called()
        self.assertTrue(
            smart_things_device
                .sensors
                .get(capability=Capability.MOTION_SENSOR)
                .detailed_historical_data
                .exists()
        )

    def _test_recover_capability(
            self,
            smart_things_device: SmartThingsDevice,
            subscribe_mock: MagicMock,
            unsubscribe_mock: MagicMock
    ):
        smart_things_device.capabilities.add(
            SmartThingsCapability.objects.get(capability=Capability.CONTACT_SENSOR.value)
        )
        smart_things_device.save()
        subscribe_mock.assert_called_once_with(
            countdown=5, args=(SmartThingsSensor.objects.get(capability=Capability.CONTACT_SENSOR).id, )
        )
        unsubscribe_mock.assert_not_called()
        self.assertTrue(
            smart_things_device
                .sensors
                .get(capability=Capability.CONTACT_SENSOR)
                .detailed_historical_data
                .exists()
        )

    @patch(
        'apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.subscribe_for_device_events',
        return_value='sub uid'
    )
    def test_subscribe_for_events(self, subscribe_for_device_events_mock: MagicMock):
        self.smart_things_sensor.subscribe_for_events()

        self.assertEqual('sub uid', self.smart_things_sensor.events_subscription_id)
        subscribe_for_device_events_mock.assert_called_once_with(
            device_id=self.smart_things_sensor.device.smart_things_id,
            capability=self.smart_things_sensor.capability,
        )

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.unsubscribe_for_device_events',
           return_value='sub uid')
    def test_unsubscribe_for_events(self, unsubscribe_for_device_events_mock: MagicMock):
        smart_things_sensor = self.smart_things_sensor
        smart_things_sensor.events_subscription_id = 'the id'
        smart_things_sensor.save()

        smart_things_sensor.unsubscribe_for_events()
        self.assertIsNone(self.smart_things_sensor.events_subscription_id)
        unsubscribe_for_device_events_mock.assert_called_once_with('the id')

    @patch('apps.smart_things_sensors.models.SmartThingsSensor.add_value')
    def test_process_event(self, add_value_mock: MagicMock):
        smart_things_sensor = self.smart_things_sensor
        smart_things_sensor.events_subscription_id = 'sub id'
        smart_things_sensor.save()

        event = DeviceEvent(
            subscription_name='some subscription_name',
            event_id='some event_id',
            location_id='some location_id',
            device_id='some device_id',
            component_id='some component_id',
            capability=Capability.MOTION_SENSOR,
            attribute='some attribute',
            value=MotionState.ACTIVE,
            state_change=True,
        )

        self.smart_things_sensor.process_event(event)
        self.assertEqual(1, add_value_mock.call_args[0][0].value)
        self.assertEqual(Capability.MOTION_SENSOR.unit, add_value_mock.call_args[0][0].unit)

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.get_device_states',
           return_value=MotionState.ACTIVE)
    def test_fetch_current_value(self, _):
        result = self.smart_things_sensor.fetch_current_value()
        self.assertEqual(MotionState.ACTIVE.int_value, result.value)
        self.assertEqual(Capability.MOTION_SENSOR.unit, result.unit)

    @patch('apps.smart_things_devices.utilities.connectors.SmartThingsApiConnector.get_all_subscriptions_ids',
           return_value=['correct', 'unused'])
    @patch('apps.smart_things_sensors.tasks.unsubscribe_for_events')
    @patch('apps.smart_things_sensors.tasks.subscribe_sensor_for_events.delay')
    def test_fail_over_reconnection(self, subscribe_mock: MagicMock, unsubscribe_mock: MagicMock, _):
        without_sub_sensor = self.smart_things_sensor

        correct_sub_sensor = self.create_smart_things_sensor(self.smart_things_device, capability=Capability.BUTTON)
        correct_sub_sensor.events_subscription_id = 'correct'
        correct_sub_sensor.save()

        wrong_sub_sensor = self.create_smart_things_sensor(self.smart_things_device,
                                                           capability=Capability.CONTACT_SENSOR)
        wrong_sub_sensor.events_subscription_id = 'wrong'
        wrong_sub_sensor.save()

        update_all_subscriptions()

        subscribe_mock.assert_has_calls([
            call(without_sub_sensor.id),
            call(wrong_sub_sensor.id),
        ], any_order=True)
        unsubscribe_mock.assert_called_once_with(self._smart_things_app_id, 'unused')

    def test_crud_action(self):
        response = self.client.get(self.get_url(self.smart_things_sensor.id))
        self.assertResponse(response)
        self.assertEqual(self.smart_things_sensor.id, response.json()['id'])
        self.assertEqual(self.smart_things_sensor.capability.value, response.json()['capability'])

    def test_update_sensor_location_updates_all_device_sensors_locations(self):
        other_sensor = self.create_smart_things_sensor(self.smart_things_device, Capability.TEMPERATURE)
        new_location = other_sensor.sub_location.sub_locations.first()
        response = self.client.put(
            self.get_url(self.smart_things_sensor.id),
            {
                'name': 'new name',
                'description': 'some description',
                'sub_location_id': new_location.id
            },
            content_type='application/json'
        )

        self.assertResponse(response)
        self.assertEqual(new_location.id, response.json()['sub_location_id'])
        self.smart_things_sensor.refresh_from_db()
        self.assertEqual(new_location.id, self.smart_things_sensor.sub_location.id)

    def test_aggregation_action(self):
        for index, value in enumerate((1, 0, 1)):
            DetailedHistoricalData.objects.create(
                resource=self.smart_things_sensor,
                time=datetime.now(tz=timezone.utc) + timedelta(minutes=index),
                value=value,
            )
        response = self.client.get(self.get_url(self.smart_things_sensor.id, 'data', 'total'))
        self.assertResponse(response)

        self.assertEqual(2, response.data['value'])

    def test_change_device_capabilities(self):
        self._set_capabilities(
            self.smart_things_device,
            [Capability.POWER_METER, Capability.ENERGY_METER, Capability.TEMPERATURE]
        )

        self.assertCountEqual(
            [Capability.POWER_METER, Capability.TEMPERATURE],
            list(self.smart_things_device.sensors.values_list('capability', flat=True))
        )

        with self.subTest('Change capabilities'):
            self._set_capabilities(
                self.smart_things_device,
                [Capability.POWER_METER, Capability.ENERGY_METER, Capability.BUTTON, Capability.MOTION_SENSOR]
            )
            self.assertCountEqual(
                [Capability.POWER_METER, Capability.BUTTON, Capability.MOTION_SENSOR],
                list(self.smart_things_device.sensors.values_list('capability', flat=True))
            )
            self.assertEqual(1, SmartThingsEnergyMeter.objects.filter(device=self.smart_things_device).count())

        with self.subTest('Remove Energy meter, remain Power Meter'):
            self._set_capabilities(
                self.smart_things_device,
                [Capability.POWER_METER, Capability.BUTTON, Capability.MOTION_SENSOR]
            )
            self.assertCountEqual(
                [Capability.BUTTON, Capability.MOTION_SENSOR],
                list(self.smart_things_device.sensors.values_list('capability', flat=True))
            )

    def test_child_types(self):
        self._set_capabilities(
            self.smart_things_device,
            [Capability.POWER_METER, Capability.ENERGY_METER, Capability.TEMPERATURE]
        )

        resource_st_energy_meter = Resource.objects\
            .filter(pk=self.smart_things_device.sensors.filter(capability=Capability.POWER_METER.value).get().id).get()
        resource_temperature = Resource.objects\
            .filter(pk=self.smart_things_device.sensors.filter(capability=Capability.TEMPERATURE.value).get().id).get()

        self.assertEqual(resource_st_energy_meter.child_type, ResourceChildType.SMART_THINGS_ENERGY_METER)
        self.assertEqual(resource_temperature.child_type, ResourceChildType.SMART_THINGS_SENSOR)

    def test_boundary_values_action(self):
        with self.subTest("no data"):
            response = self.client.get(self.get_url('boundary-live-data', query_param={
                'capability': 'temperatureMeasurement',
                'unit': 'celsius'
            }))
            self.assertResponse(response, HTTPStatus.NO_CONTENT)

        temperature_sensor = self.create_smart_things_sensor(self.smart_things_device, Capability.TEMPERATURE)
        DetailedHistoricalData.objects.create(
            resource=temperature_sensor,
            time=datetime.now(tz=timezone.utc),
            value=20,
        )

        with self.subTest("single resource"):
            response = self.client.get(self.get_url('boundary-live-data', query_param={
                'capability': 'temperatureMeasurement',
                'unit': 'celsius'
            }))
            self.assertResponse(response)
            self.assertEqual(temperature_sensor.name, response.data['min']['resource']['name'])
            self.assertEqual(temperature_sensor.name, response.data['max']['resource']['name'])
            self.assertEqual(20, response.data['min']['value']['value'])

        second_device = self.create_smart_things_device(smart_things_id="second_device")
        second_temperature_sensor = self.create_smart_things_sensor(second_device, Capability.TEMPERATURE)
        DetailedHistoricalData.objects.create(
            resource=second_temperature_sensor,
            time=datetime.now(tz=timezone.utc),
            value=10,
        )

        with self.subTest("multiple sensors"):
            response = self.client.get(self.get_url('boundary-live-data', query_param={
                'capability': 'temperatureMeasurement',
                'unit': 'celsius'
            }))
            self.assertResponse(response)
            self.assertEqual(second_temperature_sensor.name, response.data['min']['resource']['name'])
            self.assertEqual(temperature_sensor.name, response.data['max']['resource']['name'])
            self.assertEqual(10, response.data['min']['value']['value'])
            self.assertEqual(20, response.data['max']['value']['value'])


class TestSmartThingsEnergyMeterAPI(SmartThingsSensorsBaseTestCase):
    URL = '/api/v1/smart-things/energy-meters/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    def _create_dummy_provider(self):
        return EnergyProviderAccount.objects.create(
            name='Dummy',
            description='Dummy provider_account',
            provider=EnergyProviderAccount.Provider.DUMMY,
            location=self.location,
            credentials='{}',
        )

    def test_update_st_energy_meter(self):
        self._set_capabilities(
            self.smart_things_device,
            [Capability.POWER_METER, Capability.ENERGY_METER]
        )

        smart_things_energy_meter = SmartThingsEnergyMeter.objects.get(
            device=self.smart_things_device,
            capability=Capability.POWER_METER
        )

        another_location = Location.objects.create(
            name='Another location',
            parent_location=self.location,
            description='Another description',
            address=Address.objects.create(line_1='Another address')
        )

        dummy_energy_provider = self._create_dummy_provider()

        response = self.client.put(
            self.get_url(smart_things_energy_meter.id),
            json.dumps({
                "type": MeterType.ELECTRICITY.value,
                'sub_location_id': another_location.id,
                'name': 'new_name',
                'description': 'new_description',
                'provider_account': dummy_energy_provider.id
            }),
            content_type='application/json'
        )

        self.assertResponse(response)
        self.assertDictValuesOnly(
            {
                'type': MeterType.ELECTRICITY.value,
                'sub_location_id': another_location.id,
                'provider_account': dummy_energy_provider.id,
                'name': 'new_name',
                'description': 'new_description'
            },
            response.data
        )

    def test_new_type_update(self):
        smart_things_energy_meter = self.create_smart_things_energy_meter()
        for meter_type in MeterType:
            response = self.client.patch(
                self.get_url(smart_things_energy_meter.id),
                json.dumps({
                    "type": meter_type.value,
                }),
                content_type='application/json',
            )

            self.assertResponse(response)
            smart_things_energy_meter.refresh_from_db()
            self.assertEqual(smart_things_energy_meter.type, meter_type)
