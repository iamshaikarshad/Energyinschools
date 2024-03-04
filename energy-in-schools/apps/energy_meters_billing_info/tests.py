import random
from datetime import date
from http import HTTPStatus
from json import dumps

import factory
from faker import Factory
from unittest.mock import patch

from apps.accounts.permissions import RoleName
from apps.energy_meters_billing_info.models import UsedMeterType, EnergyMeterBillingInfoConsumption
from apps.energy_meters_billing_info.views import NOT_UNIQUE_ERROR_MESSAGE
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_tariffs.models import EnergyTariff
from apps.locations.models import Location
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests, CONSUMPTION_BY_RATES, DEFAULT_RATE_TYPE
from apps.mug_service.constants import MUGMeterRateTypes, MUGMeterRatePeriod, PeriodsByRateType
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfo


faker = Factory.create()


class EnergyMeterBillingInfoFactory(factory.DjangoModelFactory):
    class Meta:
        model = EnergyMeterBillingInfo

    fuel_type = factory.LazyFunction(lambda: random.choice(list(MeterType)))
    meter_type = factory.LazyFunction(lambda: random.choice(list(UsedMeterType)))
    meter_id = factory.LazyFunction(faker.word)
    unit_rate_type = factory.LazyFunction(lambda: random.choice(list(MUGMeterRateTypes)))
    standing_charge = faker.random_number()
    contract_starts_on = faker.date()
    contract_ends_on = faker.date()
    supplier_id = faker.random_number()


class EnergyMetersBillingInfoTestCase(EnergyHistoryBaseTestCase):
    URL = '/api/v1/energy-meters-billing-info/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.request_data = dict(
            fuel_type=MeterType.ELECTRICITY.value,
            meter_type=UsedMeterType.NON_AMR.value,
            meter_id='the id',
            unit_rate_type=DEFAULT_RATE_TYPE.value,
            standing_charge=24.0,
            contract_ends_on=date(2000, 1, 1).isoformat(),
            contract_starts_on=date(1999, 1, 1).isoformat(),
            supplier_id=MUGAPIMockedRequests._REQUEST_GET_SUPPLIERS_RESPONSE[0]['id'],
            consumption_by_rates=CONSUMPTION_BY_RATES
        )

    def test_manage_energy_meter_billing_info(self):
        self.client.force_login(self.sle_admin)

        with self.subTest('create'):
            response = self.client.post(
                path=self.get_url(),
                data=dumps({**self.request_data, 'location_id': self.location.id}),
                content_type='application/json'
            )
            self.assertResponse(response, HTTPStatus.CREATED)
            meter_info_id = response.data['id']

        with self.subTest('create bulk'):
            response = self.client.post(
                path=self.get_url('bulk'),
                data=dumps([{**self.request_data, 'meter_id': f'the id {index}', 'location_id': self.location.id}
                            for index in range(3)]),
                content_type='application/json',
            )
            self.assertResponse(response, HTTPStatus.CREATED)
            self.assertEqual(4, EnergyMeterBillingInfo.objects.count())

        with self.subTest('retrieve one'):
            response = self.client.get(
                path=self.get_url(meter_info_id)
            )
            self.assertResponse(response)

            check_response_data = dict(
                id=meter_info_id,
                location_id=self.location.id,
                resource_id=None, **self.request_data
            )
            response_consumption_by_rates = response.data.pop('consumption_by_rates')
            request_consumption_by_rates = []
            for unit_rate in check_response_data.pop('consumption_by_rates'):
                if MUGMeterRatePeriod(unit_rate['unit_rate_period']) in PeriodsByRateType[response.data['unit_rate_type']]:
                    request_consumption_by_rates.append(unit_rate)
            for unit_rate in response_consumption_by_rates:
                del unit_rate['id']

            self.assertEqual(request_consumption_by_rates, response_consumption_by_rates)

            self.assertDictEqual(
                check_response_data,
                response.data
            )

    def test_bulk_create_with_not_unique_meter_ids(self):
        response = self.client.post(
            self.get_url('bulk'),
            data=dumps([
                {**self.request_data, 'location_id': self.location.id},
                {**self.request_data, 'location_id': self.location.id},
            ]),
            content_type='application/json'
        )
        self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
        self.assertFalse(EnergyMeterBillingInfo.objects.filter(meter_id=self.request_data['meter_id']).exists())
        self.assertEqual(response.data, NOT_UNIQUE_ERROR_MESSAGE)

    def test_tariff_creation(self):
        with self.subTest('Tariff creation'):
            data = {**self.request_data}
            data.pop('consumption_by_rates')
            tariffs_len = EnergyTariff.objects.count()
            energy_meter_billing_info = EnergyMeterBillingInfo.objects.create(
                **data,
                location_id=self.location.id,
                resource=self.energy_meter,
            )
            embi_unit_rate = EnergyMeterBillingInfoConsumption.objects.create(
                energy_meter_billing_info=energy_meter_billing_info,
                unit_rate_period=MUGMeterRatePeriod.DAY,
                unit_rate=42.0,
                consumption=10.0,
            )

            self.assertEqual(tariffs_len + 1, EnergyTariff.objects.count())

        with self.subTest('Tariff was created correctly'):
            energy_tariff = EnergyTariff.objects.get(energy_meter_billing_info_consumption=embi_unit_rate)
            self.assertEqual(energy_tariff.resource_id, self.energy_meter.id)
            self.assertEqual(0.00042, energy_tariff.watt_hour_cost)
            self.assertEqual(0.24, energy_tariff.daily_fixed_cost)

        with self.subTest('Energy Meter Billing Info updating'):
            another_resource = self.create_energy_meter()
            energy_meter_billing_info.resource = another_resource
            energy_meter_billing_info.standing_charge = 20.0
            energy_meter_billing_info.save()
            embi_unit_rate.unit_rate = 10.0
            embi_unit_rate.save()
            energy_tariff = EnergyTariff.objects.get(energy_meter_billing_info_consumption=embi_unit_rate)
            self.assertEqual(0.0001, energy_tariff.watt_hour_cost)
            self.assertEqual(0.2, energy_tariff.daily_fixed_cost)
            self.assertEqual(energy_tariff.resource_id, another_resource.id)

    def test_tariff_creation_from_api_request(self):
        response = self.client.post(
            path=self.get_url(),
            data=dumps({
                **self.request_data,
                'location_id': self.location.id,
                'resource_id': self.energy_meter.id,
                'unit_rate_type': MUGMeterRateTypes.WEEKDAY_AND_NIGHT_AND_EVENING_AND_WEEKEND.value
            }),
            content_type='application/json'
        )
        self.assertResponse(response, HTTPStatus.CREATED)

        with self.subTest('Tariff was created correctly'):
            energy_meter_billing_info = EnergyMeterBillingInfo.objects.filter(
                location_id=self.location.id,
                resource_id=self.energy_meter.id
            ).first()
            embi_consumptions = EnergyMeterBillingInfoConsumption.objects.filter(
                energy_meter_billing_info=energy_meter_billing_info)
            energy_tariffs = EnergyTariff.objects.filter(
                energy_meter_billing_info_consumption__in=embi_consumptions
            )
            # number of tariffs created should be equal to TariffRateActiveHours
            # entries in all active_periods of particular tariff type (see: apps.energy_tariffs.types)
            self.assertEqual(energy_tariffs.count(), 4)

    def test_create_with_resource_id(self):
        response = self.client.post(
            path=self.get_url(),
            data=dumps({
                **self.request_data,
                'location_id': self.location.id,
                'resource_id': self.energy_meter.id,
            }),
            content_type='application/json'
        )
        self.assertResponse(response, HTTPStatus.CREATED)
        energy_meter_billing_info = EnergyMeterBillingInfo.objects.get(pk=response.data['id'])
        self.assertEqual(energy_meter_billing_info.resource_id, self.energy_meter.id)

        with self.subTest('BAD REQUEST resource_id exists'):
            response = self.client.post(
                path=self.get_url(),
                data=dumps({**self.request_data, 'location_id': self.location.id, 'resource_id': self.energy_meter.id}),
                content_type='application/json'
            )
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)
            self.assertEqual('unique', response.data['resource_id'][0].code)

        with self.subTest('BAD REQUEST bulk with same resource'):
            another_meter = self.create_energy_meter()
            response = self.client.post(
                self.get_url('bulk'),
                data=dumps([
                    {**self.request_data, 'location_id': self.location.id, 'meter_id': 'id_1',
                     'resource_id': another_meter.id},
                    {**self.request_data, 'location_id': self.location.id, 'meter_id': 'id_2',
                     'resource_id': another_meter.id},
                ]),
                content_type='application/json'
            )
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)
            self.assertEqual(response.data, NOT_UNIQUE_ERROR_MESSAGE)

    def test_get_list_with_filters(self):
        data = {**self.request_data}
        data.pop('consumption_by_rates')
        sub_location = Location(parent_location=self.location, name='Sub Location')
        another_location = Location(name="Another Location")
        Location.objects.bulk_create([sub_location, another_location])

        meter_info_location = EnergyMeterBillingInfo(**data, location_id=self.location.id)
        meter_info_sub_location = EnergyMeterBillingInfo(**data, location_id=sub_location.id)
        EnergyMeterBillingInfo.objects.bulk_create([
            meter_info_location,
            meter_info_sub_location,
            EnergyMeterBillingInfo(**data, location_id=another_location.id),
        ])

        self.client.force_login(self.get_user(RoleName.ADMIN))

        for test_name, location_id, expected_meter_ids in (
            ("Parent Location", self.location.id, [meter_info_location.id, meter_info_sub_location.id]),
            ("Sub Location", sub_location.id, [meter_info_sub_location.id])
        ):
            with self.subTest(test_name):
                response = self.client.get(self.get_url(query_param={'location': location_id}))
                self.assertResponse(response)
                self.assertListEqual(expected_meter_ids, [meter_info['id'] for meter_info in response.data])

    @patch('apps.energy_meters_billing_info.signals.handle_pre_delete_signal')
    def test_delete_energy_meter_billing_info(self, signal_handler_mock):
        energy_meter_billing_info = EnergyMeterBillingInfoFactory(location=self.location)
        energy_meter_billing_info.save()

        delete_response = self.client.delete(path=self.get_url(energy_meter_billing_info.id))
        self.assertResponse(delete_response, HTTPStatus.NO_CONTENT)
        signal_handler_mock.assert_called_once()

    def test_resources_linking(self):
        energy_meters_billing_info = EnergyMeterBillingInfoFactory.create_batch(5, location=self.location)
        another_resource = self.create_energy_meter()

        response = self.client.patch(
            self.get_url('resources'),
            data=dumps([
                {'resource': self.energy_meter.id, 'energy_meter_billing_info': energy_meters_billing_info[0].id},
                {'resource': another_resource.id, 'energy_meter_billing_info': energy_meters_billing_info[1].id},
                {'resource': None, 'energy_meter_billing_info': energy_meters_billing_info[2].id},
            ]),
            content_type='application/json'
        )
        self.assertResponse(response)

        energy_meters_billing_info = EnergyMeterBillingInfo.objects.in_location(self.location).order_by('id')
        self.assertEqual(energy_meters_billing_info[0].resource_id, self.energy_meter.id)
        self.assertEqual(energy_meters_billing_info[1].resource_id, another_resource.id)
        self.assertIsNone(energy_meters_billing_info[2].resource)
