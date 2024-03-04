import unittest
from datetime import date, datetime, time, timedelta, timezone
from http import HTTPStatus
from itertools import product
from unittest.mock import MagicMock, Mock, patch

import factory
import funcy
from django.db.models import Sum
from faker import Factory

from apps.accounts.permissions import RoleName
from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.hubs.base_test_case import HubBaseTestCase
from apps.resources.models import Resource
from apps.resources.types import ButtonState, ContactState, DataCollectionMethod, MotionState, ResourceValue, \
    TimeResolution, Unit
from apps.smart_things_devices.types import Capability, DeviceStatus
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from apps.smart_things_sensors.models import SmartThingsEnergyMeter
from apps.smart_things_sensors.tasks import fill_st_meter_with_last_value

faker = Factory.create()


class ResourceFactory(factory.DjangoModelFactory):
    class Meta:
        model = Resource

    name = factory.LazyFunction(faker.word)
    description = faker.sentence(nb_words=6)


class TestResourcesViewSet(HubBaseTestCase, SmartThingsSensorsBaseTestCase, EnergyProviderBaseTestCase):
    URL = '/api/v1/resources/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    __TIME = datetime.combine(date.today(), time(), tzinfo=timezone.utc)

    def test_retrieve(self):
        response = self.client.get(self.get_url(self.energy_meter.id))
        self.assertResponse(response)

        self.assertEqual(self.energy_meter.type.value, response.data['energy_meter']['type'])

    def test_list(self):
        response = self.client.get(self.get_url())
        self.assertResponse(response)

        self.assertIn(self.energy_meter.type.value, [type_['energy_meter']['type'] if type_['energy_meter'] else None for type_ in response.data])

    def test_filter_by_child_type(self):
        self._set_capabilities(self.smart_things_device, [Capability.POWER_METER, Capability.ENERGY_METER])

        for count, child_type, status_code in (
                (1, Resource.ChildType.ENERGY_METER.value, HTTPStatus.OK),
                (0, Resource.ChildType.WEATHER_TEMPERATURE.value, HTTPStatus.OK),
                (1, Resource.ChildType.SMART_THINGS_ENERGY_METER.value, HTTPStatus.OK),
        ):
            with self.subTest(child_type):
                response = self.client.get(self.get_url(query_param=dict(child_type=child_type)))
                self.assertResponse(response, status_code)
                self.assertEqual(count, len(response.data))

    def test_filters(self):
        resource = self.create_energy_meter()
        resource.sub_location = self.location.sub_locations.first()
        resource.save()

        response = self.client.get(self.get_url(query_param=dict(location_uid=resource.sub_location.uid)))
        self.assertResponse(response)
        self.assertEqual(1, len(response.data))
        self.assertEqual(resource.id, response.data[0]['energy_meter']['id'])

    def test_live_data(self):
        DetailedHistoricalData.objects.create(
            resource=self.energy_meter,
            time=datetime.now(tz=timezone.utc),
            value=42
        )

        response = self.client.get(self.get_url(self.energy_meter.id, 'data/live'))
        self.assertResponse(response)
        self.assertEqual(42, response.data['value'])

    def test_live_data_st_energy_meter(self):
        self._set_capabilities(self.smart_things_device, [Capability.POWER_METER, Capability.ENERGY_METER])
        st_energy_meter = SmartThingsEnergyMeter.objects.get(device=self.smart_things_device, capability=Capability.POWER_METER)
        DetailedHistoricalData.objects.create(
            resource=st_energy_meter,
            time=datetime.now(tz=timezone.utc),
            value=42
        )

        response = self.client.get(self.get_url(st_energy_meter.id, 'data/live'))
        self.assertResponse(response)
        self.assertEqual(42, response.data['value'])

    def test_status(self):
        resource_id = self.energy_meter.id
        DetailedHistoricalData.objects.create(
            resource_id=resource_id,
            time=datetime(2000, 1, 1, tzinfo=timezone.utc),
            value=42
        )

        for index, (value, unit, state) in enumerate((
                (123, Unit.WATT, 123.0),
                (0, Unit.CONTACT_STATE, ContactState.CLOSED.value),
                (1, Unit.MOTION_STATE, MotionState.ACTIVE.value),
                (3, Unit.BUTTON_STATE, ButtonState.HELD.value),
        )):
            record_time = datetime(2000, 1, 1, tzinfo=timezone.utc) + timedelta(minutes=index + 1)
            DetailedHistoricalData.objects.create(resource_id=resource_id, time=record_time, value=value)
            Resource.objects.filter(id=resource_id).update(unit=unit)

            with self.subTest(f'{unit.value}({value}) -> {state}'):
                response = self.client.get(self.get_url(resource_id, 'data', 'state'))

                self.assertResponse(response)
                self.assertDictEqual(
                    dict(
                        time=self.format_datetime(record_time),
                        state=state,
                        unit=unit.value,
                    ),
                    response.data,
                )

    def test_get_resources_for_collecting_new_value(self):
        old_value_meter = EnergyMeter.objects.create(
            meter_id='bla bla 1',
            type=EnergyMeter.Type.ELECTRICITY,
            provider_account=self.energy_provider,
            sub_location=self.location,
        )
        new_value_meter = EnergyMeter.objects.create(
            meter_id='bla bla 2',
            type=EnergyMeter.Type.ELECTRICITY,
            provider_account=self.energy_provider,
            sub_location=self.location,
        )
        push_only_resource = EnergyMeter.objects.create(
            meter_id='bla bla 3',
            type=EnergyMeter.Type.ELECTRICITY,
            provider_account=self.energy_provider,
            sub_location=self.location,
        ).resource_ptr
        push_only_resource.supported_data_collection_methods = [DataCollectionMethod.PUSH]
        push_only_resource.preferred_data_collection_method = DataCollectionMethod.PUSH
        push_only_resource.save()

        old_value_meter_long_term_only = EnergyMeter.objects.create(
            meter_id='bla bla 4',
            type=EnergyMeter.Type.ELECTRICITY,
            provider_account=self.energy_provider,
            sub_location=self.location,
        )
        old_value_meter.detailed_time_resolution = None
        old_value_meter.save()

        without_value_meter = self.energy_meter

        old_value_meter.add_value(
            ResourceValue(
                time=(datetime.fromtimestamp(self.energy_meter.round_timestamp_to_lower_discrete_period(
                    datetime.now(tz=timezone.utc).timestamp(),
                    self.energy_meter.detailed_time_resolution
                ), tz=timezone.utc) - self.energy_meter.detailed_time_resolution.duration),
                value=24,
                unit=Unit.WATT
            )
        )

        new_value_meter.add_value(
            ResourceValue(
                time=datetime.fromtimestamp(self.energy_meter.round_timestamp_to_lower_discrete_period(
                    datetime.now(tz=timezone.utc).timestamp(),
                    self.energy_meter.detailed_time_resolution
                ), tz=timezone.utc),
                value=24,
                unit=Unit.WATT
            )
        )

        self.assertEqual(
            sorted([without_value_meter.id, old_value_meter.id, old_value_meter_long_term_only.id]),
            sorted([resource.id for resource in Resource.get_resources_for_collecting_new_value()])
        )

    def test_get_resources_for_saving_values(self):
        self.energy_meter.delete()
        now = datetime(2000, 10, 10, tzinfo=timezone.utc) - timedelta(minutes=1)

        for (long_term_label, last_long_term_data), (detailed_label, last_detailed_data) in product(
                (
                        ('none', None),
                        ('old', now - TimeResolution.HALF_HOUR.duration - timedelta(minutes=10)),
                        ('new', now - timedelta(minutes=10)),
                ),
                (
                        ('none', None),
                        ('old', now - TimeResolution.HALF_HOUR.duration),
                        ('new', now),
                )
        ):
            resource = self.create_energy_meter()
            resource.name = f'long_term_{long_term_label}__detailed_{detailed_label}'
            resource.last_long_term_data_add_time = last_long_term_data
            resource.last_detailed_data_add_time = last_detailed_data
            resource.save()

        self.assertEqual(
            sorted([
                'long_term_none__detailed_old',
                'long_term_none__detailed_new',
                'long_term_old__detailed_new',
            ]),
            sorted([
                resource.name
                for resource in Resource.get_resources_for_saving_values_for_long_term()
            ])
        )

    @patch('apps.energy_meters.models.EnergyMeter.fetch_current_value', side_effect=[
        ResourceValue(time=datetime(2000, 10, 10, second=5, tzinfo=timezone.utc), value=10, unit=Unit.WATT),
        ResourceValue(time=datetime(2000, 10, 10, second=30, tzinfo=timezone.utc), value=40, unit=Unit.WATT),
        ResourceValue(time=datetime(2000, 10, 10, second=50, tzinfo=timezone.utc), value=75, unit=Unit.WATT),
        ResourceValue(time=datetime(2000, 10, 10, minute=10, second=5, tzinfo=timezone.utc), value=42, unit=Unit.WATT),
        ResourceValue(time=datetime(2000, 10, 10, minute=16, second=41, tzinfo=timezone.utc), value=443,
                      unit=Unit.WATT),
        ResourceValue(time=datetime(2000, 10, 10, minute=23, second=41, tzinfo=timezone.utc), value=100, unit=Unit.WATT)
    ])
    def test_collect_new_values(self, _: MagicMock):
        for label, count, value, time_ in (
                ('First', 1, 10, datetime(2000, 10, 10, second=0, tzinfo=timezone.utc)),
                ('Second', 2, 30, datetime(2000, 10, 10, second=20, tzinfo=timezone.utc)),
                ('With missed value', 3, 60, datetime(2000, 10, 10, second=40, tzinfo=timezone.utc)),
                ('With a lot of missed', 4, 42, datetime(2000, 10, 10, minute=10, second=0, tzinfo=timezone.utc)),
                ('19 misses', 24, 442, datetime(2000, 10, 10, minute=16, second=40, tzinfo=timezone.utc)),
                ('20 misses', 25, 100, datetime(2000, 10, 10, minute=23, second=40, tzinfo=timezone.utc)),
        ):
            EnergyMeter.objects.update(detailed_time_resolution=TimeResolution.TWENTY_SECONDS)  # TEMP FIX REMOVE IT
            with self.subTest(label):
                self.energy_meter.collect_new_values()

                self.assertEqual(count, DetailedHistoricalData.objects.count())
                self.assertEqual(value, DetailedHistoricalData.objects.last().value)
                self.assertEqual(time_, DetailedHistoricalData.objects.last().time)

    def test_add_value_directly_to_long_term(self):
        resource = self.energy_meter
        resource.detailed_time_resolution = None
        resource.save()

        value = ResourceValue(
            time=datetime(2000, 10, 10, tzinfo=timezone.utc),
            value=42,
            unit=Unit.WATT
        )

        resource.add_value(value)

        self.assertEqual(value.time, resource.get_latest_value().time)
        self.assertEqual(value.value, resource.get_latest_value().value)

    def test_add_duplicate(self):
        value = ResourceValue(time=datetime(2000, 10, 10, tzinfo=timezone.utc), value=10, unit=Unit.WATT)
        count = self.energy_meter.detailed_historical_data.count()

        self.energy_meter.add_value(value)
        self.energy_meter.add_value(value)

        self.assertEqual(count + 1, self.energy_meter.detailed_historical_data.count())

    def test_add_missed_values(self):
        for value in (
                self._get_resource_value(1, 1),
                self._get_resource_value(29, 29),
                self._get_resource_value(90, 90),
                self._get_resource_value(121, 121),
        ):
            self.energy_meter.add_value(value)

        self.energy_meter.save_data_to_long_term_history()
        self.assertEqual(4, self.energy_meter.detailed_historical_data.count())
        self.assertEqual(2, self.energy_meter.long_term_historical_data.count())

        self.energy_meter.add_missed_data((
            self._get_resource_value(28, 280),
            self._get_resource_value(29, 290),

            self._get_resource_value(31, 310),
            self._get_resource_value(61, 610),

            self._get_resource_value(90, 900),
            self._get_resource_value(91, 920),
            self._get_resource_value(121, 1210),
        ))

        self.assertEqual(4 + 4 + 1, self.energy_meter.detailed_historical_data.count())
        self.assertEqual(
            (15, 447.825, 358.5, 105),
            tuple(self.energy_meter.long_term_historical_data.order_by('time').values_list('value', flat=True))
        )

    @patch('apps.resources.models.Resource.add_missed_data')
    def test_add_missed_values_view(self, add_missed_data_mock):
        self.client.force_login(self.admin)

        self.assertResponse(self.client.post(
            path=self.get_url(self.energy_meter.id, 'data', 'batch'),
            content_type='application/json',
            data=dict(
                values=[
                    dict(time=datetime(2000, 10, 10, tzinfo=timezone.utc), value=42),
                    dict(time=datetime(2000, 10, 11, tzinfo=timezone.utc), value=43),
                ],
                unit=Unit.WATT.value
            ),
        ), HTTPStatus.CREATED)

        add_missed_data_mock.assert_called_once_with([
            ResourceValue(time=datetime(2000, 10, 10, tzinfo=timezone.utc), value=42, unit=Unit.WATT),
            ResourceValue(time=datetime(2000, 10, 11, tzinfo=timezone.utc), value=43, unit=Unit.WATT),
        ])

    def test_fetch(self):
        value_at_0_31 = 20
        value_at_1_0 = 49
        value_at_1_1 = 50
        value_at_1_2 = 20

        parts = 30  # minutes per period
        average_for_0_30 = (
                1 / parts * value_at_0_31 +
                29 / parts * (value_at_0_31 + value_at_1_0) / 2
        )
        average_for_1_0 = (
                1 / parts * (value_at_1_0 + value_at_1_1) / 2 +
                1 / parts * (value_at_1_1 + value_at_1_2) / 2 +
                28 / parts * value_at_1_2
        )

        for label, count, value, a_time, new_values in (
                ('Not full sequence', 0, None, None, [
                    DetailedHistoricalData(
                        resource=self.energy_meter,
                        time=self._get_time(year=2000),
                        value=10,
                    ),
                ]),
                ('First (right interpolation)', 3, average_for_0_30, self._get_time(minute=30), [
                    DetailedHistoricalData(
                        resource=self.energy_meter,
                        time=self._get_time(year=2001),
                        value=10,
                    ),
                    DetailedHistoricalData(
                        resource=self.energy_meter,
                        time=self._get_time(hour=0, minute=31),
                        value=20,
                    ),
                    DetailedHistoricalData(
                        resource=self.energy_meter,
                        time=self._get_time(hour=1, minute=1),
                        value=50,
                    ),
                ]),
                ('Second (left interpolation)', 4, average_for_1_0, self._get_time(hour=1), [
                    DetailedHistoricalData(
                        resource=self.energy_meter,
                        time=self._get_time(hour=1, minute=2),
                        value=20,
                    ),
                    DetailedHistoricalData(
                        resource=self.energy_meter,
                        time=self._get_time(hour=2, minute=2),
                        value=20,
                    ),
                ]),
        ):
            with self.subTest(label):
                DetailedHistoricalData.objects.bulk_create(new_values)
                self.energy_meter.save_data_to_long_term_history()

                self.assertEqual(count, LongTermHistoricalData.objects.count())
                if count:
                    self.assertAlmostEqual(value, LongTermHistoricalData.objects.last().value, places=5)
                    self.assertEqual(a_time, LongTermHistoricalData.objects.last().time)

    def test_query_filter(self):
        power_sensor = self.create_smart_things_sensor(self.smart_things_device, capability=Capability.POWER_METER)

        response = self.client.get(self.get_url(), data=dict(
            native_unit=Unit.WATT.value,
            child_type=(Resource.ChildType.ENERGY_METER.value, Resource.ChildType.SMART_THINGS_SENSOR.value)
        ))

        self.assertResponse(response)
        self.assertEqual(
            {power_sensor.id, self.energy_meter.id},
            {resource['id'] for resource in response.data}
        )

    @unittest.skip('performance test')
    def test_add_new_value_performance(self):
        new_time = None

        datetime_mock = Mock(wraps=datetime)
        datetime_mock.now = Mock(side_effect=lambda **__: new_time)

        with patch('apps.resources.models.datetime', new=datetime_mock):
            for seconds_per_value in (55, 350):
                with funcy.print_durations():
                    for index in range(1_000):
                        new_time = datetime(2000, 1, 1, tzinfo=timezone.utc) + \
                                   timedelta(seconds=seconds_per_value * index)

                        self.energy_meter.add_value(ResourceValue(
                            time=new_time,
                            value=index,
                        ))

        with funcy.print_durations():
            self.energy_meter.save_data_to_long_term_history()

        self.assertEqual(
            109710.810284332,
            self.energy_meter.long_term_historical_data.aggregate(sum_value=Sum('value'))['sum_value']
        )

        # seconds_per_value: 55;  time before: 4.820; time after: 3.72
        # seconds_per_value: 350; time before: 13.64; time after: 8.03
        # save to long term;      time 300ms

        # self._live_data.bulk_create([items], ignore_conflicts=True) in Resource.add_value should be used on Django 2.2
        # https://docs.djangoproject.com/en/dev/ref/models/querysets/#django.db.models.query.QuerySet.bulk_create

    def test_unsupported_conditions_error(self):
        self.assertResponse(
            self.client.get(self.get_url(self.energy_meter.id, 'data', 'historical', query_param=dict(
                time_resolution=TimeResolution.SECOND.value
            ))),
            HTTPStatus.BAD_REQUEST
        )

    def test_add_very_small_value(self):
        self.energy_meter.add_value(ResourceValue(
            time=datetime(2000, 10, 10, tzinfo=timezone.utc),
            value=1.234e-10,
        ))

        detailed_historical_data = self.energy_meter.detailed_historical_data.get()
        self.assertEqual(0.0, detailed_historical_data.value)

        self.energy_meter.add_value(ResourceValue(
            time=datetime(2000, 10, 11, tzinfo=timezone.utc),
            value=1.234e-30,
        ))
        self.energy_meter.save_data_to_long_term_history()

        long_term_historical_data = self.energy_meter.long_term_historical_data.get()
        self.assertEqual(0.0, long_term_historical_data.value)

    def test_st_energy_meter_not_included_in_pulling_resources(self):
        smart_things_energy_meter = self.create_smart_things_energy_meter()

        with self.subTest('Collecting new values'):
            resources_for_collecting = list(Resource.get_resources_for_collecting_new_value())
            self.assertEqual(1, len(resources_for_collecting))  # self.energy_meter
            self.assertEqual(Resource.ChildType.ENERGY_METER, resources_for_collecting[0].child_type)

        with self.subTest('Saving to long term'):
            resource_value = ResourceValue(value=10, time=datetime.now(timezone.utc))
            smart_things_energy_meter.add_value(resource_value)
            self.energy_meter.add_value(resource_value)

            resources_for_saving_to_long_term = list(Resource.get_resources_for_saving_values_for_long_term())

            self.assertEqual(2, len(resources_for_saving_to_long_term))
            self.assertListEqual(
                [Resource.ChildType.ENERGY_METER, Resource.ChildType.SMART_THINGS_ENERGY_METER],
                [resource.child_type for resource in resources_for_saving_to_long_term],
            )

    def test_set_st_energy_meter_last_value(self):
        resource_value = ResourceValue(value=10, time=datetime(2000, 10, 10, second=5, tzinfo=timezone.utc))
        st_energy_meter = self.create_smart_things_energy_meter()

        device_for_st_plug = self.create_smart_things_device(smart_things_id='smart plug device id',
                                                             status=DeviceStatus.OFFLINE)
        st_plug = self.create_smart_things_energy_meter(type_=MeterType.SMART_PLUG, device_id=device_for_st_plug.id)

        st_energy_meter.add_value(resource_value)
        st_plug.add_value(resource_value)

        fill_st_meter_with_last_value()

        device_for_st_plug.refresh_from_db()
        st_plug.refresh_from_db()

        self.assertEqual(st_energy_meter.last_value, 10)
        self.assertEqual(st_plug.last_value, 0.0)

    @classmethod
    def _get_time(cls, **kwargs) -> datetime:
        return cls.__TIME.replace(**kwargs)

    @staticmethod
    def _get_resource_value(time_index, value) -> ResourceValue:
        return ResourceValue(
            time=datetime(2000, 10, 10, tzinfo=timezone.utc) + timedelta(minutes=time_index),
            value=value
        )
