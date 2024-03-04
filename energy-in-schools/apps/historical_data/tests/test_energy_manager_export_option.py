from datetime import datetime, timezone, timedelta
from http import HTTPStatus

from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.models import LongTermHistoricalData
from apps.resources.models import Unit
from apps.resources.types import TimeResolution
from apps.accounts.permissions import RoleName


class TestEnergyManagerExportOption(EnergyHistoryBaseTestCase):
    URL = '/api/v1/energy-meters/aggregated-consumption/historical/export/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN
    FROM_QUERY_PARAM = datetime(2000, 10, 10, 10, 10, 00, tzinfo=timezone.utc)
    TO_QUERY_PARAM = datetime(2000, 11, 10, 12, 10, 00, tzinfo=timezone.utc)

    def setUp(self):
        super().setUp()

        self.DEFAULT_QUERY_PARAMS = {
            'from': self.FROM_QUERY_PARAM,
            'to': self.TO_QUERY_PARAM,
            'meter_type': MeterType.ELECTRICITY.value,
            'unit': Unit.KILOWATT_HOUR.value,
            'location_uid': self.location.uid,
            'format': 'csv'
        }

        energy_meter = self.create_energy_meter()
        self.energy_meter_2 = self.create_energy_meter()

        self.create_energy_history(extra_rows=(
            (energy_meter, datetime(2000, 10, 10, 1, 00, 00, tzinfo=timezone.utc)),
            (energy_meter, datetime(2000, 10, 10, 1, 30, 00, tzinfo=timezone.utc)),
            (energy_meter, datetime(2000, 10, 10, 2, 00, 00, tzinfo=timezone.utc)),
            (self.energy_meter_2, datetime(2000, 10, 10, 1, 00, 00, tzinfo=timezone.utc)),
            (self.energy_meter_2, datetime(2000, 10, 10, 1, 30, 00, tzinfo=timezone.utc)),
            (self.energy_meter_2, datetime(2000, 10, 10, 2, 00, 00, tzinfo=timezone.utc)),
            # time resolution half hour
            (energy_meter, datetime(2000, 10, 10, 10, 00, 00, tzinfo=timezone.utc)),
            (energy_meter, datetime(2000, 10, 10, 10, 30, 00, tzinfo=timezone.utc)),
            (energy_meter, datetime(2000, 10, 10, 11, 00, 00, tzinfo=timezone.utc)),
            # time resolution hour
            (energy_meter, datetime(2000, 11, 10, 10, 00, 00, tzinfo=timezone.utc)),
            (energy_meter, datetime(2000, 11, 10, 11, 00, 00, tzinfo=timezone.utc)),
            (energy_meter, datetime(2000, 11, 10, 12, 00, 00, tzinfo=timezone.utc)),
        ), is_detailed_history=False)

    def _get_csv_response(self, query_params: dict = {}):
        response = self.client.get(
            self.get_url(query_param={**self.DEFAULT_QUERY_PARAMS, **query_params})
        )
        return response

    def test_response_with_correct_period_and_format(self):
        response = self._get_csv_response()

        self.assertResponse(response)
        self.assertEqual(response.get('content-type'), 'text/csv; charset=utf-8')
        self.assertTrue(self.location.name and self.location.uid in response.get('content-disposition'))

    def test_export_hh_data_for_individual_meter(self):
        response = self._get_csv_response(dict(
            from_=datetime(2000, 10, 10, 1, 00, 00, tzinfo=timezone.utc),
            to=datetime(2000, 10, 10, 2, 00, 00, tzinfo=timezone.utc) + timedelta(seconds=1),
            time_resolution=TimeResolution.HALF_HOUR.value,
            resouce_id=self.energy_meter_2.id
        ))
        self.assertResponse(response)

        energy_meter_2_hh_data = LongTermHistoricalData.objects.filter(resource_id=self.energy_meter_2.id).count()

        self.assertTrue(self.energy_meter_2.name in response.get('content-disposition'))
        self.assertEqual(len(response.data), energy_meter_2_hh_data)

    def test_response_with_correct_period_wrong_format(self):
        response = self._get_csv_response({'format': ''})

        self.assertResponse(response, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.get('content-type'), 'application/json')
        self.assertFalse(response.get('content-disposition'))

    def test_response_with_wrong_period(self):
        response = self._get_csv_response(dict(
            from_=self.TO_QUERY_PARAM + timedelta(days=1),
            to=self.TO_QUERY_PARAM + timedelta(days=5)
        ))

        self.assertResponse(response)
        self.assertEqual([
            {'time': f'{(self.TO_QUERY_PARAM + timedelta(days=idx)).isoformat()[:-6]}Z', 'value': None}
            for idx in range(1, 5)
        ], response.data)

    def test_maximal_date_period(self):
        """ Maximal date period for now is one year """

        response = self._get_csv_response({'to': self.FROM_QUERY_PARAM + timedelta(days=365+1)})
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_period_incorrect_order(self):
        response = self._get_csv_response(dict(
            from_=self.TO_QUERY_PARAM + timedelta(days=1),
            to=self.TO_QUERY_PARAM,
        ))
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_access_with_non_sem_admin_role(self):
        self.client.logout()
        response = self._get_csv_response()
        self.assertResponse(response, HTTPStatus.UNAUTHORIZED)

    def test_unit_abbreviation(self):
        for unit in (
            Unit.WATT_HOUR, Unit.KILOWATT, Unit.POUND_STERLING,
        ):
            with self.subTest(f'Checking {unit} abbreviation in response'):
                response = self._get_csv_response({'unit': unit.value})

                for data in response.data:
                    self.assertResponse(response)
                    self.assertEqual(data.get('value_unit'), unit.abbreviation if data.get('value') else None)
