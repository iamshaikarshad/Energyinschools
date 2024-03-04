import json
import random
from datetime import datetime, timezone
from functools import partial
from http import HTTPStatus
from unittest.mock import MagicMock, patch

import factory
from django.db.models import Q
from faker import Factory

from apps.accounts.permissions import RoleName
from apps.addresses.models import Address
from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import ProviderValidateError, MeterType
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.historical_data.utils.energy_cost_calculation_utils import CostAggregationOption
from apps.historical_data.types import WEEKDAYS
from apps.locations.models import Location
from apps.resources.tests import ResourceFactory
from apps.resources.types import ResourceValue, TimeResolution, Unit


faker = Factory.create()


class EnergyMeterFactory(ResourceFactory):
    class Meta:
        model = EnergyMeter

    meter_id = factory.LazyFunction(faker.word)
    type = factory.LazyFunction(lambda: random.choice(list(MeterType)))


class TestEnergyMeter(EnergyHistoryBaseTestCase, EnergyTariffBaseTestCase):
    URL = '/api/v1/energy-meters/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN
    NEW_METER_ID = 'some id'
    METER_VALUE_TIME = datetime(year=2000, month=10, day=10, tzinfo=timezone.utc)

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_connect(self, _):
        response = self.client.post(self.get_url(), self._get_request_data())

        self.assertEqual(HTTPStatus.CREATED, response.status_code, msg=response.data)
        self.assertTrue(EnergyMeter.objects.filter(meter_id=self.NEW_METER_ID).first())

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_connect_validate_failed(self, fake_connector: MagicMock):
        fake_connection = MagicMock
        fake_connection_class = MagicMock(side_effect=fake_connection)
        fake_connector.side_effect = fake_connection_class
        fake_connection.validate_meter = MagicMock(side_effect=ProviderValidateError('error'))

        try:
            response = self.client.post(self.get_url(), self._get_request_data())

            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code, msg=response.data)
            self.assertFalse(EnergyMeter.objects.filter(meter_id=self.NEW_METER_ID).first())
            fake_connection.validate_meter.assert_called()

        finally:
            del fake_connection.validate_meter  # "patch" decorator should clean up after it self but it doesn't

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_connect_to_wrong_location(self, _):
        response = self.client.post(self.get_url(), {
            **self._get_request_data(),
            'sub_location': self.get_user(school_number=1).location_id,
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code, msg=response.data)
        self.assertFalse(EnergyMeter.objects.filter(meter_id=self.NEW_METER_ID).first())

    def test_list(self):
        (
            own_location, own_sub_location, public_location, public_sub_location, private_location,
            private_sub_location, private_shared_sub_location
        ) = self._create_locations_with_meter()

        response = self.client.get(self.get_url())

        self.assertEqual(HTTPStatus.OK, response.status_code, msg=response.data)
        self.assertSetEqual({
            own_location.id,
            own_sub_location.id,
        }, {row['sub_location'] for row in response.data})

    def test_list_own_location_only(self):
        (
            own_location, own_sub_location, public_location, public_sub_location, private_location,
            private_sub_location, private_shared_sub_location
        ) = self._create_locations_with_meter()

        response = self.client.get(self.get_url(query_param='own_location_only=true'))

        self.assertEqual(HTTPStatus.OK, response.status_code, msg=response.data)
        self.assertSetEqual({
            own_location.id,
            own_sub_location.id,
        }, {row['sub_location'] for row in response.data})

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_update(self, fake_connector: MagicMock):
        response = self.client.patch(self.get_url(self.energy_meter.id), json.dumps({
            'meter_id': 'new id'
        }), content_type='application/json')
        self.assertEqual(HTTPStatus.OK, response.status_code, msg=response.data)

        self.assertEqual('new id', EnergyMeter.objects.get(id=self.energy_meter.id).meter_id)
        fake_connector()().validate_meter.assert_called()

    def test_live_consumption_without_data(self):
        response = self.client.get(self.get_url(self.energy_meter.id, 'consumption/live/'))

        self.assertResponse(response, HTTPStatus.NO_CONTENT)
        self.assertEqual({}, response.data)

    def test_live_consumption(self):
        time = self.create_detailed_history_fresh_data()
        response = self.client.get(self.get_url(self.energy_meter.id, 'consumption/live/'))

        self.assertResponse(response)
        self.assertEqual(dict(unit='watt', time=self.format_datetime(time), value=100), response.data)

    def test_historical_consumption(self):
        self.create_energy_history(is_detailed_history=False)

        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'from': '2000-10-10T10:00:00Z',
                'to': '2000-10-10T11:00:00Z',
                'unit': 'watt',
                'time_resolution': 'hour'
            }
        ))

        self.assertResponse(response)
        self.assertEqual(1, len(response.data['values']))
        self.assertEqual('watt', response.data['unit'])
        self.assertDictEqual(dict(
            time=self.format_datetime(datetime(2000, 10, 10, 10, tzinfo=timezone.utc)),
            value=10,
            cmp_value=None,
        ), response.data['values'][0])

    @patch('apps.historical_data.utils.aggregations.aggregate_to_list', return_value=[])
    def test_historical_energy_cost(self, aggregate_to_list_mock: MagicMock):
        self.create_energy_history(is_detailed_history=False)

        for label, meter_id, location_uid, cost_option in (
                (
                        'for meter',
                        self.energy_meter.id,
                        None,
                        CostAggregationOption.WATT_HOUR_COST
                ),
                (
                        'for sub location',
                        None,
                        EnergyMeter.objects.order_by('id').last().sub_location.uid,
                        CostAggregationOption.WATT_HOUR_COST
                ),
                (
                        'for school',
                        None,
                        self.location.uid,
                        CostAggregationOption.FULL_COST
                ),
        ):
            with self.subTest(label):
                response = self.client.get(self.get_url(
                    meter_id,
                    'consumption/historical' if meter_id else 'aggregated-consumption/historical',
                    query_param={
                        'from': '2000-10-10T10:00:00Z',
                        'to': '2000-10-10T11:00:00Z',
                        'unit': Unit.POUND_STERLING.value,
                        'time_resolution': TimeResolution.YEAR.value,
                        **({'location_uid': location_uid} if location_uid else {})
                    }
                ))
                self.assertResponse(response)
                self.assertEqual(
                    cost_option,
                    aggregate_to_list_mock.call_args[1]['aggregation_rules'].params.aggregation_option
                )
                aggregate_to_list_mock.reset_mock()

    def test_always_on(self):
        second_meter = EnergyMeter.objects.create(
            meter_id='second_meter_id',
            type=EnergyMeter.Type.GAS,
            provider_account=self.energy_meter.provider_account,
            sub_location=self.energy_meter.sub_location,
        )

        self.create_energy_history(extra_rows=(
            (self.energy_meter, datetime(2000, 10, 10, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 1, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 2, 5, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 3, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 4, tzinfo=timezone.utc)),
            (second_meter, datetime(2000, 10, 10, tzinfo=timezone.utc)),
            (second_meter, datetime(2000, 10, 10, 2, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False, long_term_history_in_watt_hour=True)

        query_param = {
            'from': datetime(2000, 10, 10, tzinfo=timezone.utc).isoformat(),
            'to': datetime(2000, 10, 10, 5, tzinfo=timezone.utc).isoformat(),
        }

        with self.subTest('Always on for first meter'):
            response = self.client.get(self.get_url(
                self.energy_meter.id,
                'consumption/always-on',
                query_param=query_param,
            ))

            self.assertResponse(response)
            self.assertEqual('watt', response.data['unit'])
            self.assertEqual(40.0, response.data['value'])

        with self.subTest('Always on for second meter'):
            response = self.client.get(self.get_url(
                second_meter.id,
                'consumption/always-on',
                query_param=query_param,
            ))

            self.assertResponse(response)
            self.assertEqual('watt', response.data['unit'])
            self.assertEqual(120.0, response.data['value'])

        with self.subTest('Always on for location'):
            response = self.client.get(self.get_url(
                'aggregated-consumption/always-on',
                query_param=query_param,
            ))

            self.assertResponse(response)
            self.assertEqual('watt', response.data['unit'])
            self.assertEqual(160.0, response.data['value'])  # should be always-on for first meter + second meter

    def test_always_on_when_data_not_available(self):
        response = self.client.get(self.get_url(self.energy_meter.id, 'consumption/always-on'))

        self.assertResponse(response, HTTPStatus.NO_CONTENT)
        self.assertEqual({}, response.data)

    def test_historical_consumption_with_fill_gaps(self):
        self.create_energy_history(extra_rows=(
            (self.energy_meter, datetime(2000, 10, 10, 10, 11, 00, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 10, 11, 40, tzinfo=timezone.utc)),
        ))

        EnergyMeter.objects.update(detailed_time_resolution=TimeResolution.TWENTY_SECONDS)
        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'from': '2000-10-10T10:10:40Z',
                'to': '2000-10-10T10:12:00Z',
                'unit': Unit.WATT.value,
                'time_resolution': TimeResolution.TWENTY_SECONDS.value,
                'fill_gaps': 'true'
            }
        ))

        self.assertResponse(response)
        self.assertEqual(4, len(response.data['values']))
        self.assertEqual('watt', response.data['unit'])
        self.assertEqual(dict(
            time=self.format_datetime(datetime(2000, 10, 10, 10, 11, 20, tzinfo=timezone.utc)),
            value=None,
            cmp_value=None
        ), response.data['values'][2])

    def test_historical_consumption_with_fill_gaps_and_time_resolution_second(self):
        self.create_energy_history(
            default_rows=False,
            extra_rows=(
                (self.energy_meter, datetime(2000, 11, 11, 10, 10, 00, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 11, 11, 10, 10, 30, tzinfo=timezone.utc)),

                (self.energy_meter, datetime(2000, 11, 11, 10, 15, 00, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 11, 11, 10, 15, 30, tzinfo=timezone.utc)),

                (self.energy_meter, datetime(2000, 11, 11, 10, 20, 00, tzinfo=timezone.utc)),
                (self.energy_meter, datetime(2000, 11, 11, 10, 20, 30, tzinfo=timezone.utc)),
            )
        )

        EnergyMeter.objects.filter(pk=self.energy_meter.id).update(detailed_time_resolution=TimeResolution.SECOND)

        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'from': '2000-11-11T10:08:00Z',
                'to': '2000-11-11T10:23:00Z',
                'unit': Unit.WATT.value,
                'time_resolution': TimeResolution.SECOND.value,
                'fill_gaps': 'true'
            }
        ))

        data = response.data['values']
        data_with_values = [dataitem for dataitem in data if dataitem.get('value') is not None]

        self.assertResponse(response)
        self.assertEqual(len(data), 18)
        self.assertEqual(len(data_with_values), 6)
        
        initial_value = 0
        with self.subTest('Check values'):
            for dataitem in data_with_values:
                self.assertEqual(dataitem.get('value'), initial_value)
                initial_value += 10

        self.assertEqual('watt', response.data['unit'])

    def _create_locations_with_meter(self):
        make_address = partial(Address.objects.create, line_1='qwerty')

        own_location = self.location
        own_sub_location = Location(parent_location=own_location, address=make_address())
        own_sub_location.save()
        public_location = self.get_user(school_number=1).location
        public_location.share_energy_consumption = True
        public_location.save()
        public_sub_location = Location(parent_location=public_location, address=make_address())
        public_sub_location.save()
        private_location = self.get_user(school_number=2).location
        private_sub_location = Location(parent_location=private_location, address=make_address())
        private_sub_location.save()
        private_shared_sub_location = Location(parent_location=private_location, address=make_address(),
                                               share_energy_consumption=True)
        private_shared_sub_location.save()

        for location in (
                own_sub_location,
                public_location,
                public_sub_location,
                private_location,
                private_sub_location,
                private_shared_sub_location
        ):
            if not location.is_sub_location:
                provider = EnergyProviderAccount(
                    provider=EnergyProviderAccount.Provider.OVO,
                    credentials='{"a": "b"}'.encode(),
                    location=location,
                    name='the name',
                    description='the description',
                )
                provider.save()

            provider = EnergyProviderAccount.objects.get(Q(location=location) | Q(location=location.parent_location))

            meter = EnergyMeter(
                meter_id=f'the i d {location.uid}',
                type=EnergyMeter.Type.ELECTRICITY,
                provider_account=provider,
                sub_location=location,
            )
            meter.save()

        return \
            own_location, own_sub_location, \
            public_location, public_sub_location, \
            private_location, private_sub_location, private_shared_sub_location

    def _get_request_data(self):
        return {
            'meter_id': self.NEW_METER_ID,
            'type': EnergyMeter.Type.ELECTRICITY.value,
            'provider_account': self.energy_provider.id,
            'sub_location': self.get_user(RoleName.SEM_ADMIN).location.id,
            'name': 'the name',
            'description': 'the description',
        }

    def test_stringify(self):
        str(EnergyMeter.objects.first())

    def test_representation(self):
        repr(EnergyMeter.objects.first())

    def test_historical_with_comparison(self):
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 10, 10, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 11, 10, 10, tzinfo=timezone.utc)),
        ), is_detailed_history=False, default_rows=False)

        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'unit': 'watt',
                'time_resolution': 'hour',
                'from': datetime(2000, 10, 11, 10, tzinfo=timezone.utc).isoformat(),
                'to': datetime(2000, 10, 11, 11, tzinfo=timezone.utc).isoformat(),
                'compare_from': datetime(2000, 10, 10, 10, tzinfo=timezone.utc).isoformat(),
                'compare_to': datetime(2000, 10, 10, 11, tzinfo=timezone.utc).isoformat(),
            }
        ))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.WATT.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 11, 10, tzinfo=timezone.utc)),
                    value=10,
                    cmp_value=0
                ),
            ]
        ), response.data)

    def test_historical_in_kilowatt(self):
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 10, 10, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 10, 11, tzinfo=timezone.utc)),
        ), is_detailed_history=False, default_rows=False)

        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'unit': 'kilowatt',
                'time_resolution': 'hour',
            }
        ))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.KILOWATT.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 10, tzinfo=timezone.utc)),
                    value=0.005,
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_historical_cost(self):
        self._update_location_timezone()
        self.create_energy_tariff()
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 6, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 7, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 16, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 19, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False, long_term_history_in_watt_hour=True)

        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'unit': Unit.POUND_STERLING.value,
                'time_resolution': TimeResolution.HOUR.value,
            }
        ))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.POUND_STERLING.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
                    value=round(0, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 6, tzinfo=timezone.utc)),
                    value=round(10 * 0.05 / 1000, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 7, tzinfo=timezone.utc)),
                    value=round(20 * 0.07 / 1000, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 16, tzinfo=timezone.utc)),
                    value=round(30 * 0.14 / 1000, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 19, tzinfo=timezone.utc)),
                    value=round(40 * 0.05 / 1000, 10),
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_historical_gas_cost(self):
        self.create_energy_tariff()
        gas_meter = EnergyMeter.objects.create(
            meter_id=self.energy_meter.meter_id,
            type=EnergyMeter.Type.GAS,
            provider_account=self.energy_meter.provider_account,
            sub_location=self.energy_meter.sub_location,
        )

        self.create_energy_history((
            (gas_meter, datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
            (gas_meter, datetime(2000, 10, 10, 5, 1, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False, long_term_history_in_watt_hour=True)

        response = self.client.get(self.get_url(
            gas_meter.id,
            'consumption/historical',
            query_param={
                'unit': Unit.POUND_STERLING.value,
                'time_resolution': TimeResolution.HOUR.value,
            }
        ))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.POUND_STERLING.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
                    value=10 * 0.064 / 1000,
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_historical_cost_with_active_days_in_week(self):
        self._update_location_timezone()
        self.create_energy_tariff(active_days_in_week=WEEKDAYS)
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 11, 6, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 12, 7, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 13, 16, tzinfo=timezone.utc)),
            # this value is for weekend and should not be included is response as the related tariff is for weekdays only
            (self.energy_meter, datetime(2000, 10, 14, 19, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False, long_term_history_in_watt_hour=True)

        response = self.client.get(self.get_url(
            self.energy_meter.id,
            'consumption/historical',
            query_param={
                'unit': Unit.POUND_STERLING.value,
                'time_resolution': TimeResolution.HOUR.value,
            }
        ))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            unit=Unit.POUND_STERLING.value,
            values=[
                dict(
                    time=self.format_datetime(datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
                    value=round(0, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 11, 6, tzinfo=timezone.utc)),
                    value=round(10 * 0.05 / 1000, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 12, 7, tzinfo=timezone.utc)),
                    value=round(20 * 0.07 / 1000, 10),
                    cmp_value=None
                ),
                dict(
                    time=self.format_datetime(datetime(2000, 10, 13, 16, tzinfo=timezone.utc)),
                    value=round(30 * 0.14 / 1000, 10),
                    cmp_value=None
                ),
            ]
        ), response.data)

    def test_consumption_total(self):
        self.create_energy_history((
            (self.energy_meter, datetime(2000, 10, 10, 5, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 6, tzinfo=timezone.utc)),
        ), default_rows=False, is_detailed_history=False, long_term_history_in_watt_hour=True)

        response = self.client.get(self.get_url(self.energy_meter.id, 'consumption/total', query_param={
            'from': datetime(2000, 10, 10, tzinfo=timezone.utc).isoformat(),
            'to': datetime(2000, 10, 11, tzinfo=timezone.utc).isoformat(),
        }))

        self.assertResponse(response)
        self.assertDictEqual(dict(
            time=self.format_datetime(datetime(2000, 10, 10, 6, tzinfo=timezone.utc)),
            value=10,
            unit=Unit.WATT_HOUR.value
        ), response.data)

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_restore(self, _):
        energy_meter = self.energy_meter
        energy_meter.add_value(ResourceValue(
            time=datetime.now(tz=timezone.utc),
            value=42,
            unit=Unit.WATT,
        ))

        self.assertResponse(self.client.delete(self.get_url(energy_meter.id)), HTTPStatus.NO_CONTENT)
        self.assertEqual(1, EnergyMeter.deleted_objects.count())

        response = self.client.post(self.get_url(), {
            # unique together fields:
            'meter_id': energy_meter.meter_id,
            'type': energy_meter.type.value,
            'provider_account': energy_meter.provider_account_id,

            # other fields
            'sub_location': self.location.sub_locations.first().id,
            'name': 'new name',
            'description': 'new description',
        })
        self.assertResponse(response, HTTPStatus.CREATED)
        self.assertEqual(energy_meter.id, response.data['id'])
        self.assertTrue(energy_meter.detailed_historical_data.exists())

    def test_delete_permanently(self):
        self.assertResponse(self.client.post(self.get_url(self.energy_meter.id, 'delete-permanently')))
        self.assertFalse(EnergyMeter.all_objects.exists())
