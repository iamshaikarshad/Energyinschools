from http import HTTPStatus
from unittest.mock import patch, MagicMock

from datetime import datetime, timezone, timedelta

from apps.accounts.permissions import RoleName
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.mug_service.constants import HHDataRequestErrorMessages
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from apps.mug_service.tests.mocked_requests import MUGAPIMockedRequests
from apps.mug_service.internal_types import MUGMeterRateType
from apps.resources.types import Unit
from apps.energy_providers.providers.abstract import MeterType
from utilities.requests_mock import RequestMock


class MUGAPIMUGMeterTestCase(MUGBaseTestCase, EnergyHistoryBaseTestCase):
    URL = '/api/v1/mug-api/meters/'

    def setUp(self):
        super(MUGAPIMUGMeterTestCase, self).setUp()
        self.energy_meter_billing_info.resource = self.energy_meter
        self.energy_meter_billing_info.save()
        self.client.force_login(self.mug_user)

    @patch('apps.mug_service.models.Site.create_from_location')
    def test_get_hh_data(self, _: MagicMock):
        self.create_energy_history(is_detailed_history=False, default_rows=False, extra_rows=(
            (self.energy_meter, datetime(2000, 10, 10, 10, 00, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 10, 30, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 11, 00, tzinfo=timezone.utc)),
            (self.energy_meter, datetime(2000, 10, 10, 11, 30, tzinfo=timezone.utc)),
        ))

        response = self.client.get(
            self.get_url(
                self.meter.mug_meter_id,
                'hh-data',
                query_param={
                    'from_datetime': datetime(2000, 10, 10, tzinfo=timezone.utc),
                    'to_datetime': datetime(2001, 10, 10, tzinfo=timezone.utc),
                }
            )
        )

        self.assertResponse(response)
        self.assertDictEqual(
            {"unit": Unit.WATT.value,
             'hh_data': [
                 {'time': self.format_datetime(datetime(2000, 10, 10, 10, 0, tzinfo=timezone.utc)), 'value': 0.0},
                 {'time': self.format_datetime(datetime(2000, 10, 10, 10, 30, tzinfo=timezone.utc)), 'value': 10.0},
                 {'time': self.format_datetime(datetime(2000, 10, 10, 11, 0, tzinfo=timezone.utc)), 'value': 20.0},
                 {'time': self.format_datetime(datetime(2000, 10, 10, 11, 30, tzinfo=timezone.utc)), 'value': 30.0},
             ]},
            response.data
        )

    def test_bad_requests(self):
        with self.subTest('Date interval more than one year'):
            response = self.client.get(self.get_url(self.meter.mug_meter_id, 'hh-data', query_param={
                'from_datetime': datetime(2000, 10, 10, 10, 10, 10, tzinfo=timezone.utc),
            }))
            self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
            self.assertEqual(response.data['non_field_errors'][0],
                             HHDataRequestErrorMessages.TOO_BIG_INTERVAL.value)

        with self.subTest('FROM date in future'):
            response = self.client.get(self.get_url(self.meter.mug_meter_id, 'hh-data', query_param={
                'from_datetime': datetime.now(tz=timezone.utc) + timedelta(days=1),
            }))
            self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
            self.assertEqual(response.data['from_datetime'][0], HHDataRequestErrorMessages.DATE_IN_FUTURE.value)

        with self.subTest('TO date in future'):
            response = self.client.get(self.get_url(self.meter.mug_meter_id, 'hh-data', query_param={
                'from_datetime': datetime.now(tz=timezone.utc) - timedelta(days=1),
                'to_datetime': datetime.now(tz=timezone.utc) + timedelta(days=1),
            }))
            self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
            self.assertEqual(response.data['to_datetime'][0], HHDataRequestErrorMessages.DATE_IN_FUTURE.value)

        with self.subTest('Incorrect order of dates'):
            response = self.client.get(self.get_url(self.meter.mug_meter_id, 'hh-data', query_param={
                'from_datetime': datetime.now(tz=timezone.utc) - timedelta(days=1),
                'to_datetime': datetime.now(tz=timezone.utc) - timedelta(days=2),
            }))
            self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
            self.assertEqual(response.data['non_field_errors'][0], HHDataRequestErrorMessages.INCORRECT_ORDER.value)

    def test_permissions(self):
        self._test_permissions_is_forbidden(
            url=self.get_url(self.meter.mug_meter_id, 'hh-data', query_param={
                'from_datetime': datetime(2000, 10, 10, 10, 10, 10, tzinfo=timezone.utc),
                'to_datetime': datetime(2001, 10, 10, 10, 10, 10, tzinfo=timezone.utc),
            }),
            allowed_user_roles={RoleName.MUG_USER},
            request_func=self.client.get,
        )


class MUGAPITestGetMeterInfo(MUGBaseTestCase):
    URL = '/api/v1/mug-api/meter-info/'
    FORCE_LOGIN_AS = RoleName.MUG_USER

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.request_data = dict(
            meter_type=MeterType.ELECTRICITY.value,
            meter_id='the id',
        )

    @RequestMock.assert_requests([MUGAPIMockedRequests.AUTHORIZE_REQUEST, MUGAPIMockedRequests.REQUEST_MUG_METER_INFO])
    def test_get_meter_info(self):
        response = self.client.post(self.get_url(), self.request_data)

        self.assertResponse(response)
        internal_format: MUGMeterRateType = MUGMeterRateType(**response.json())
        expected_value = MUGAPIMockedRequests.REQUEST_MUG_METER_INFO.response_json['mpanInfoDto']['rateType']
        self.assertEqual(internal_format.meter_rate_type, expected_value)

    def test_get_meter_info_wrong_type(self):
        request_data = {**self.request_data}
        request_data['meter_type'] = MeterType.SOLAR.value

        response = self.client.post(self.get_url(), request_data)
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)
