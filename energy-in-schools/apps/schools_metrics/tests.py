from datetime import datetime, timezone, date, timedelta
from unittest.mock import patch, Mock, PropertyMock
from collections import OrderedDict

from django.test import override_settings

from apps.accounts.permissions import RoleName
from apps.cashback.models import OffPeakyPoint
from apps.energy_dashboard.models import DashboardPing, DashboardType
from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.tests.test_energy_meter import EnergyMeterFactory
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.energy_tariffs.models import EnergyTariff
from apps.historical_data.models import LongTermHistoricalData, DetailedHistoricalData
from apps.locations.models import Location
from apps.resources.types import ResourceChildType, Unit
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.settings import REFRESH_TOKEN_LIVE_TIME, REFRESH_TOKEN_CYCLE
from apps.smart_things_apps.tests.test_utilities import SmartThingsAppFactory
from apps.smart_things_apps.types import SmartAppConnectivityStatus
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_devices.tests.test_connector import SmartThingsDeviceFactory
from apps.smart_things_devices.types import DeviceStatus
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from apps.smart_things_sensors.models import SmartThingsEnergyMeter
from apps.smart_things_sensors.tests import SmartThingsEnergyMeterFactory
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.mug_service.models import Switch, Site
from apps.mug_service.constants import SwitchStatus
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from apps.mug_service.tests.test_switches import SwitchFactory

datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = datetime(2000, 1, 30, tzinfo=timezone.utc)


class TestSchoolsMetricsViewSet(EnergyTariffBaseTestCase, SmartThingsSensorsBaseTestCase, EnergyHistoryBaseTestCase):
    URL = '/api/v1/schools-metrics/'
    FORCE_LOGIN_AS = RoleName.ADMIN

    def test_checking_smart_app_status(self):
        SmartThingsApp.objects.all().delete()  # remove created in setup. TODO
        with self.subTest("No smart app"):
            response = self.client.get(self.get_url(self.location.id))
            self.assertResponse(response)
            self.assertDictEqual(
                dict(
                    status=SmartAppConnectivityStatus.NO_SMART_APP.value,
                    app_id=None,
                    refresh_token_updated_at=None,
                ),
                response.data['smart_things_app_token'],
            )

        app = SmartThingsAppFactory(location=self.location)

        for refresh_token_updated_at, status_expected in (
                (datetime.now(tz=timezone.utc) - REFRESH_TOKEN_LIVE_TIME,
                 SmartAppConnectivityStatus.REFRESH_TOKEN_EXPIRED),
                (datetime.now(tz=timezone.utc) - REFRESH_TOKEN_CYCLE,
                 SmartAppConnectivityStatus.REFRESH_TOKEN_SHOULD_BE_REFRESHED),
                (datetime.now(tz=timezone.utc), SmartAppConnectivityStatus.CONNECTED),
        ):
            with self.subTest(status_expected.value):
                app.refresh_token_updated_at = refresh_token_updated_at
                app.save()
                response = self.client.get(self.get_url(self.location.id))
                self.assertResponse(response)
                self.assertDictEqual(
                    dict(
                        status=status_expected.value,
                        app_id=app.id,
                        refresh_token_updated_at=app.refresh_token_updated_at.isoformat()[:-6] + 'Z',
                    ),
                    response.data['smart_things_app_token'],
                )

    def test_get_energy_tariffs(self):
        self.create_energy_tariff()
        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)

        with self.subTest(f'Check {EnergyTariff.Type.NORMAL}'):
            self.assertGreaterEqual(len(response.json()['tariffs']['current_off_peaky_normal']), 1)
            for tariff in response.json()['tariffs']['current_energy_tariffs']:
                self.assertEqual(tariff['type'], EnergyTariff.Type.NORMAL.value)

        with self.subTest(f'Check {EnergyTariff.Type.CASH_BACK_TOU}'):
            self.assertGreater(len(response.json()['tariffs']['current_off_peaky_tou']), 1)
            for tariff in response.json()['tariffs']['current_off_peaky_tou']:
                self.assertEqual(tariff['type'], EnergyTariff.Type.CASH_BACK_TOU.value)

        with self.subTest(f'Check {EnergyTariff.Type.CASH_BACK_TARIFF}'):
            self.assertGreaterEqual(len(response.json()['tariffs']['current_off_peaky_normal']), 1)
            for tariff in response.json()['tariffs']['current_off_peaky_normal']:
                self.assertEqual(tariff['type'], EnergyTariff.Type.CASH_BACK_TARIFF.value)

        with self.subTest(f'Check tariff for resource'):
            smart_things_energy_meter: SmartThingsEnergyMeter = self.create_smart_things_energy_meter()
            self.create_energy_tariff_for_meter(smart_things_energy_meter)

            response = self.client.get(self.get_url(self.location.id))
            self.assertResponse(response)

            resource_based_tariffs = [
                tariff for tariff in (
                    *response.json()['tariffs']['current_energy_tariffs'],
                    *response.json()['tariffs']['current_off_peaky_tou'],
                    *response.json()['tariffs']['current_off_peaky_normal']
                )
            ]

            self.assertGreater(len(resource_based_tariffs), 1)

    @patch('apps.schools_metrics.serializers.datetime', new=datetime_mock)
    @patch('apps.cashback.models.datetime', new=datetime_mock)
    @override_settings(OFF_PEAKY_POINTS_START_DATE=date(2000, 1, 1))
    def test_get_off_peaky_points(self):
        OffPeakyPoint.objects.bulk_create((
            OffPeakyPoint(day=date(2000, 1, 1), value=0.0, location=self.location),
            OffPeakyPoint(day=date(2000, 1, 10), value=15.0, location=self.location),
            OffPeakyPoint(day=date(2000, 1, 15), value=10.0, location=self.location),
            OffPeakyPoint(day=date(2000, 1, 20), value=15.0, location=self.location),
            OffPeakyPoint(day=date(2000, 1, 29), value=18.0, location=self.location),
        ))
        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)
        self.assertDictEqual(
            dict(total=58.0, yesterday_value=18.0, day_avg_value=2.0, days_with_positive_value=4),
            response.data['off_peaky_points'],
        )

    def test_get_list(self):
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(Location.objects.filter(parent_location__isnull=True).count(), len(response.data))

    @patch('apps.schools_metrics.serializers.datetime', new=datetime_mock)
    @patch('apps.historical_data.utils.aggregations.datetime', new=datetime_mock)
    @patch('apps.historical_data.utils.aggregation_params_manager.datetime', new=datetime_mock)
    def test_get_consumption(self):
        with self.subTest('Empty'):
            response = self.client.get(self.get_url(self.location.id))
            self.assertResponse(response)
            self.assertDictEqual(
                dict(electricity=dict(today=dict(), live=dict()), gas=None, smart_plug=None, unknown=None),
                response.data['consumption'],
            )

        day = datetime_mock.now()
        energy_meter = self.energy_meter
        LongTermHistoricalData.objects.bulk_create((
            LongTermHistoricalData(value=0.0, time=day.replace(hour=1), resource=energy_meter),
            LongTermHistoricalData(value=200.0, time=day.replace(hour=2), resource=energy_meter),
            LongTermHistoricalData(value=300.0, time=day.replace(hour=3), resource=energy_meter),
            # Shouldn't be included in response
            LongTermHistoricalData(value=10000.0, time=day - timedelta(days=1), resource=energy_meter),
        ))

        DetailedHistoricalData.objects.bulk_create((
            DetailedHistoricalData(value=10.0, time=day, resource=energy_meter),
            DetailedHistoricalData(value=20.0, time=day - timedelta(minutes=10), resource=energy_meter),
            # Shouldn't be included in response
            DetailedHistoricalData(value=10000.0, time=day - timedelta(minutes=16), resource=energy_meter),
        ))

        for meter_type in (MeterType.ELECTRICITY, MeterType.GAS, MeterType.SMART_PLUG, MeterType.UNKNOWN):
            energy_meter.type = meter_type
            energy_meter.save()

            response = self.client.get(self.get_url(self.location.id))
            self.assertResponse(response)
            with self.subTest(f'{meter_type.value} data TODAY'):
                self.assertDictEqual(dict(time=day.replace(hour=3).isoformat()[:-6] + 'Z', value=0.25,
                                          unit=Unit.KILOWATT_HOUR.value),
                                     response.data['consumption'][meter_type.value.lower()]['today'])

            with self.subTest(f'{meter_type.value} data LIVE'):
                self.assertDictEqual(dict(time=day.isoformat()[:-6] + 'Z', value=0.015, unit=Unit.KILOWATT.value),
                                     response.data['consumption'][meter_type.value.lower()]['live'])

    def test_get_energy_meters(self):
        EnergyMeterFactory.create_batch(
            4, provider_account=self.energy_provider, sub_location=self.location, type=MeterType.ELECTRICITY
        )

        devices = SmartThingsDeviceFactory.create_batch(5, sub_location=self.location, status=DeviceStatus.OFFLINE)
        for device in devices:
            SmartThingsEnergyMeterFactory(sub_location=self.location, device=device)

        for test_name, online, not_online, make_online in (
            ('offline', 0, 5, False),
            ('online', 5, 0, True),
        ):
            if make_online:
                mock = PropertyMock(return_value=DeviceStatus.ONLINE)
                setattr(EnergyMeter, 'connectivity_status', mock)

                SmartThingsDevice.objects.filter(id__in=[device.id for device in devices])\
                    .update(status=DeviceStatus.ONLINE)

            response = self.client.get(self.get_url(self.location.id))
            self.assertResponse(response)

            for energy_meter_type in ('energy_meters', 'smart_things_energy_meters'):
                with self.subTest(f'{test_name}, {energy_meter_type}'):
                    self.assertEqual(5, response.data['energy_meters'][energy_meter_type]['total'])
                    self.assertEqual(online, response.data['energy_meters'][energy_meter_type]['online'])
                    self.assertEqual(not_online, len(response.data['energy_meters'][energy_meter_type]['not_online']))

    def test_permissions(self):
        self._test_permissions_is_forbidden(
            url=self.get_url(),
            allowed_user_roles={RoleName.ADMIN},
            request_func=self.client.get,
        )

    def test_get_smart_things_devices_number(self):
        # create smart_things devices for test

        # following statements with second argument works as id it is required argument

        self.create_smart_things_device(False, 'unknown')

        # create online device
        online_device = self.create_smart_things_device(True, 'online')
        online_device.status = SmartThingsDevice.Status.ONLINE
        online_device.save()

        # create offline device
        offline_device = self.create_smart_things_device(False, 'offline')
        offline_device.status = SmartThingsDevice.Status.OFFLINE
        offline_device.save()

        # get metrics API
        response = self.client.get(self.get_url())
        self.assertResponse(response)

        # filter response for our test location
        test_location_metrics = next(filter(lambda location: location['id'] == self.location.id, response.json()))[
            'smart_things_devices']
        
        # get devices for our location
        test_location_devices = SmartThingsDevice.objects.filter(sub_location=self.location)

        # check online count
        self.assertGreater(
            test_location_metrics['connectivity_status']['online'],
            0
        )
        self.assertEqual(
            test_location_metrics['connectivity_status']['online'],
            test_location_devices.filter(status=SmartThingsDevice.Status.ONLINE).count()
        )

        # check offline count
        self.assertGreater(
            test_location_metrics['connectivity_status']['offline'],
            0
        )
        self.assertEqual(
            test_location_metrics['connectivity_status']['offline'],
            test_location_devices.filter(status=SmartThingsDevice.Status.OFFLINE).count()
        )

        # check uknown count
        self.assertGreater(
            test_location_metrics['connectivity_status']['unknown'],
            0
        )
        self.assertEqual(
            test_location_metrics['connectivity_status']['unknown'],
            test_location_devices.filter(status=SmartThingsDevice.Status.UNKNOWN).count()
        )

        # check total count without greater check, because if offline, online, unknown = 0 than test will fail earlier
        self.assertEqual(
            test_location_metrics['connectivity_status']['total'],
            len(test_location_devices)
        )

    def test_leaderboard_always_on_data(self):
        mock_energy_value_date = datetime.now(tz=timezone.utc).replace(hour=2)

        self.create_energy_history(
            default_rows=False,
            is_detailed_history=False,
            long_term_history_in_watt_hour=True,
            extra_rows=(
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=8)),
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=3)),
                (self.energy_meter, mock_energy_value_date - timedelta(weeks=3, days=1)),
            ))

        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)
        data = response.data

        with self.subTest('Always on data'):
            self.assertEqual(1, data['leaderboard']['always_on']['total_members'])
            self.assertEqual(1, data['leaderboard']['always_on']['own_rank'])
            self.assertEqual(30.0, data['leaderboard']['always_on']['own_points'])

    def test_leaderboard_always_on_no_data(self):
        response = self.client.get(self.get_url(self.location.id))

        self.assertResponse(response)
        data = response.data
        self.assertEqual(None, data['leaderboard']['always_on'])

    def test_leaderboard_electricity_usage(self):
        self._create_location_meters_and_energy_data()

        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)
        data = response.data

        with self.subTest('Electricity_live'):
            self.assertEqual(3, data['leaderboard']['electricity_live']['total_members'])
            self.assertEqual(1, data['leaderboard']['electricity_live']['own_rank'])
            self.assertEqual(10.0, data['leaderboard']['electricity_live']['own_points'])

        with self.subTest('Electricity yesterday'):
            self.assertEqual(3, data['leaderboard']['electricity_yesterday']['total_members'])
            self.assertEqual(1, data['leaderboard']['electricity_yesterday']['own_rank'])
            self.assertEqual(5.0, data['leaderboard']['electricity_yesterday']['own_points'])

    def test_leaderboard_gas_usage(self):
        self._create_location_meters_and_energy_data(energy_type=EnergyMeter.Type.GAS, reverse=True)

        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)
        data = response.data

        self.assertEqual(data['leaderboard']['gas_yesterday']['own_rank'],
                         data['leaderboard']['gas_yesterday']['total_members'])
        self.assertEqual(3, data['leaderboard']['gas_yesterday']['total_members'])
        self.assertEqual(15.0, data['leaderboard']['gas_yesterday']['own_points'])

    def test_empty_mug_data(self):
        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)
        data = response.data
        self.assertEqual(
            data['mug_data'],
            {
                'mug_customer_id': None,
                'mug_sites': self.mug_sites_to_dict(self.location),
                'mug_meters': [],
                'switches_per_status': {
                    'sent_to_mug': 0,
                    'supplier_downloaded_contract': 0,
                    'switch_accepted': 0,
                    'live_switch_complete': 0,
                    'failed_contract': 0,
                },
                'require_resource_linking': False,
            })

    def test_mug_data(self):
        user = self.get_user()
        registration_request = MUGBaseTestCase.create_registration_request(user)
        mug_customer = MUGBaseTestCase.create_mug_customer(registration_request)
        energy_meter_billing_info = MUGBaseTestCase.create_energy_meter_billing_info(user)
        mug_meter = MUGBaseTestCase.create_meter(energy_meter_billing_info)
        MUGBaseTestCase.create_mug_site(user.location)

        SwitchFactory.create_batch(5, energy_meter_billing_info=energy_meter_billing_info)

        response = self.client.get(self.get_url(self.location.id))
        self.assertResponse(response)
        data = response.data

        with self.subTest('Mug customer'):
            self.assertEqual(mug_customer.mug_customer_id, data['mug_data']['mug_customer_id'])
        with self.subTest('Mug sites'):
            self.assertEqual(
                self.mug_sites_to_dict(self.location)
                , data['mug_data']['mug_sites']
            )

        with self.subTest('Mug meters'):
            self.assertEqual(
                [
                    OrderedDict([
                        ('meter_id', energy_meter_billing_info.meter_id),
                        ('mug_meter_id', mug_meter.mug_meter_id),
                    ])
                ], data['mug_data']['mug_meters']
            )
        with self.subTest('Switches'):
            self.assertEqual(
                {
                    'sent_to_mug': Switch.objects.filter(status=SwitchStatus.SENT_TO_MUG).count(),
                    'supplier_downloaded_contract': Switch.objects.filter(status=SwitchStatus.SUPPLIER_DOWNLOADED_CONTRACT).count(),
                    'switch_accepted': Switch.objects.filter(status=SwitchStatus.SWITCH_ACCEPTED).count(),
                    'live_switch_complete': Switch.objects.filter(status=SwitchStatus.LIVE_SWITCH_COMPLETE).count(),
                    'failed_contract': Switch.objects.filter(status=SwitchStatus.FAILED_CONTRACT).count(),
                },
                response.data['mug_data']['switches_per_status']
            )

        with self.subTest('require_resource_linking'):
            energy_meter_billing_infos = EnergyMeterBillingInfo.objects.filter(
                location__in=Location.objects.in_location(self.location)
            )
            resource_ids_existence = (energy_meter_billing_info.resource_id is None
                                      for energy_meter_billing_info in energy_meter_billing_infos)

            self.assertEqual(response.data['mug_data']['require_resource_linking'],
                             any(resource_ids_existence))

    def test_dashboard_last_ping(self):
        time = datetime.now(timezone.utc)

        dashboard_ping_created = DashboardPing.objects.bulk_create([
            DashboardPing(
                type=dashboard_type,
                location=self.location,
                last_ping=time + timedelta(seconds=seconds)
            ) for dashboard_type, seconds in zip(list(DashboardType), range(0, 250, 50))
        ])

        response = self.client.get(self.get_url(self.location.id))

        self.assertResponse(response)

        data = response.data['last_dashboard_ping']
        type_time_response_data = { item.get('type'): item.get('last_ping') for item in data }

        self.assertEqual(len(data), len(dashboard_ping_created))

        for dashboard_type, seconds in zip(list(DashboardType), range(0, 250, 50)):
            self.assertEqual(
                type_time_response_data[dashboard_type.value], 
                (time + timedelta(seconds=seconds)).isoformat()[:-6] + 'Z'
            )

    def test_pupils_count(self):
        for index, location in enumerate(Location.get_schools()):
            location.pupils_count = (index + 1) * 100
            location.save()

        response = self.client.get(self.get_url())
        self.assertResponse(response)
        for index, school in enumerate(response.data):
            self.assertEqual((index + 1) * 100, school['pupils_count'])


    @staticmethod
    def mug_sites_to_dict(location):
        mug_sites = []
        for sub_location in location.with_sub_locations:
            try:
                site_id = sub_location.mug_site.mug_site_id
            except Site.DoesNotExist:
                site_id = None
            mug_sites.append(OrderedDict([
                 ('sub_location_id', sub_location.id),
                 ('sub_location_name', sub_location.name),
                 ('mug_site_id', site_id),
            ]))
        return mug_sites
