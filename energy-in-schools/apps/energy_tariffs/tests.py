from datetime import date, time
from http import HTTPStatus

from django.core.exceptions import ValidationError

from apps.accounts.permissions import RoleName
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_tariffs.base_test_case import EnergyTariffBaseTestCase
from apps.energy_tariffs.models import EnergyTariff
from apps.locations.models import Location
from apps.historical_data.types import WEEKENDS, WEEKDAYS


class TestEnergyTariff(EnergyTariffBaseTestCase):
    URL = '/api/v1/energy-tariffs/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    def test_intersect_validation(self):
        self.create_energy_tariff()
        EnergyTariff.objects.first().clean()

        with self.assertRaises(ValidationError):
            EnergyTariff(
                provider_account=self.energy_provider,
                meter_type=MeterType.GAS,
                active_time_start=time(hour=0),
                active_time_end=None,
                active_date_start=date(1999, 1, 1),
                active_date_end=None,
                watt_hour_cost=42,
                daily_fixed_cost=0,
            ).clean()

    def test_create(self):
        data = dict(
            type=EnergyTariff.Type.NORMAL.value,
            provider_account_id=self.energy_provider.id,
            meter_type=MeterType.ELECTRICITY.value,
            active_time_start='07:00',
            active_time_end='08:00',
            active_date_start='2000-08-08',
            active_date_end='2000-08-08',
            watt_hour_cost=42,
            daily_fixed_cost=42,
        )

        with self.subTest('create new'):
            response = self.client.post(self.get_url(), data=data)
            self.assertResponse(response, HTTPStatus.CREATED)

        with self.subTest('create duplicated'):
            response = self.client.post(self.get_url(), data=data)
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)

        with self.subTest('create new with active_days_in_week set'):
            data['active_days_in_week'] = WEEKENDS
            data['active_date_start'] = '2000-08-08'
            data['active_time_start'] = '09:00'
            data['active_date_end'] = '2000-09-08'
            response = self.client.post(self.get_url(), data=data)
            self.assertResponse(response, HTTPStatus.CREATED)

        with self.subTest('create duplicate with different active_days_in_week set'):
            data['active_days_in_week'] = WEEKDAYS
            response = self.client.post(self.get_url(), data=data)
            self.assertResponse(response, HTTPStatus.CREATED)

        with self.subTest('create duplicate with active_days_in_week None'):
            data['active_days_in_week'] = None
            response = self.client.post(self.get_url(), data=data)
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_current_tariff(self):
        self.create_energy_tariff(for_forever=False)
        energy_tariff_id = EnergyTariff.objects.create(
            provider_account=self.energy_provider,
            meter_type=MeterType.ELECTRICITY,
            active_time_start=time(1),
            active_time_end=time(2),
            active_date_start=date(1999, 1, 1),
            active_date_end=None,
            watt_hour_cost=42,
            daily_fixed_cost=0,
        ).id

        response = self.client.get(self.get_url('current-tariffs'))
        self.assertResponse(response)

        self.assertEqual(1, len(response.data))
        self.assertEqual(energy_tariff_id, response.data[0]['id'])

        with self.subTest("Test energy dashboard access"):

            self.client.logout()

            self.client.force_login(self.es_user)

            response = self.client.get(self.get_url('current-tariffs'))
            self.assertResponse(response)

            self.assertEqual(1, len(response.data))

    def test_current_tariff_filter(self):
        self.create_energy_tariff()

        response = self.client.get(self.get_url(
            'current-tariffs',
            query_param=dict(meter_type=MeterType.ELECTRICITY.value)
        ))
        self.assertResponse(response)
        self.assertEqual(4, len(response.data))

    def test_current_tariffs_admin(self):
        self.client.force_login(self.get_user(RoleName.ADMIN))
        self.create_energy_tariff()
        another_location = Location.objects.create()
        meter_another_location = self.create_energy_meter(sub_location=another_location)
        self.create_energy_tariff_for_meter(meter_another_location)

        for location in (self.location, another_location):
            with self.subTest(f'Tariffs count for {location.name}'):
                response = self.client.get(self.get_url(
                    'current-tariffs',
                    query_param=dict(meter_type=MeterType.ELECTRICITY.value, location_uid=location.uid)
                ))

                self.assertResponse(response)
                self.assertEqual(
                    EnergyTariff.objects.in_location(location).filter(type=EnergyTariff.Type.NORMAL,
                                                                      meter_type=MeterType.ELECTRICITY).count(),
                    len(response.data)
                )

    def test_list_filter(self):
        self.create_energy_tariff()

        response = self.client.get(self.get_url(query_param=dict(meter_type=MeterType.ELECTRICITY.value)))
        self.assertResponse(response)
        self.assertEqual(4, len(response.data))

    def test_current_tariff_with_resource_changing_location_to_sub_location(self):
        sub_location: Location = Location.objects.create(
                                            name='TestLocation',
                                            description='TestDescription',
                                            parent_location=self.location
                                        )
        self.create_energy_tariff_for_meter(self.energy_meter)
        tariff = EnergyTariff.objects.get(resource_id=self.energy_meter.id, type=EnergyTariff.Type.NORMAL)

        with self.subTest('Checking tariffs in location'):
            response = self.client.get(self.get_url(query_param=dict(meter_type=MeterType.ELECTRICITY.value)))

            self.assertResponse(response)
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0].get('resource_id'), tariff.resource_id)

        with self.subTest('Checking tariffs in sublocation'):
            self.energy_meter.sub_location = sub_location
            self.energy_meter.save()

            response = self.client.get(self.get_url(query_param=dict(meter_type=MeterType.ELECTRICITY.value)))

            self.assertResponse(response)
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0].get('resource_id'), tariff.resource_id)
