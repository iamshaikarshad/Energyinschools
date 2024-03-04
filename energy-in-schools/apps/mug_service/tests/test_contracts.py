from datetime import date
from http import HTTPStatus

from collections import namedtuple

from apps.accounts.permissions import RoleName
from apps.mug_service.constants import SwitchStatus, MUGMeterRatePeriod
from apps.mug_service.tests.base_test_case import MUGBaseTestCase
from apps.mug_service.tests.test_switches import SwitchFactory
from apps.energy_meters_billing_info.models import EnergyMeterBillingInfoConsumption


SWITCH_CONDITIONS = namedtuple('switch_conditions', [
    'to_standing_charge',
    'to_day_unit_rate',
    'to_night_unit_rate',
    'to_evening_and_weekend_unit_rate',
    'to_peak_unit_rate',
    'contract_start_date',
    'contract_end_date',
])


class ContractsViewSetTestCase(MUGBaseTestCase):
    URL = '/api/v1/mug-api/contracts/'
    FORCE_LOGIN_AS = RoleName.MUG_USER

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.switch_conditions = SWITCH_CONDITIONS(20.0, 13.0, 10.0, 11.0, 14.0, date(2021, 1, 1), date(2021, 12, 31))
        cls.switch = SwitchFactory(
            energy_meter_billing_info=cls.energy_meter_billing_info,
            to_standing_charge=cls.switch_conditions.to_standing_charge,
            to_day_unit_rate=cls.switch_conditions.to_day_unit_rate,
            to_night_unit_rate=cls.switch_conditions.to_night_unit_rate,
            to_evening_and_weekend_unit_rate=cls.switch_conditions.to_evening_and_weekend_unit_rate,
            to_peak_unit_rate=cls.switch_conditions.to_peak_unit_rate,
            contract_start_date=cls.switch_conditions.contract_start_date,
            contract_end_date=cls.switch_conditions.contract_end_date,
            status=SwitchStatus.SENT_TO_MUG,
        )

        EnergyMeterBillingInfoConsumption.objects.bulk_create([
            EnergyMeterBillingInfoConsumption(
                energy_meter_billing_info=cls.energy_meter_billing_info,
                unit_rate_period=period,
                unit_rate=0.0,
                consumption=1000,
            ) for period in MUGMeterRatePeriod
        ])

    def test_update_switch(self):
        for status_to, status_after_action, expected_status in (
            (SwitchStatus.SUPPLIER_DOWNLOADED_CONTRACT, SwitchStatus.SUPPLIER_DOWNLOADED_CONTRACT, HTTPStatus.OK),
            (SwitchStatus.SWITCH_ACCEPTED, SwitchStatus.SWITCH_ACCEPTED, HTTPStatus.OK),
            (SwitchStatus.SUPPLIER_DOWNLOADED_CONTRACT, SwitchStatus.SWITCH_ACCEPTED, HTTPStatus.BAD_REQUEST),
            (SwitchStatus.LIVE_SWITCH_COMPLETE, SwitchStatus.LIVE_SWITCH_COMPLETE, HTTPStatus.OK),
            (SwitchStatus.FAILED_CONTRACT, SwitchStatus.LIVE_SWITCH_COMPLETE, HTTPStatus.BAD_REQUEST),
            (SwitchStatus.SWITCH_ACCEPTED, SwitchStatus.LIVE_SWITCH_COMPLETE, HTTPStatus.BAD_REQUEST),
            (SwitchStatus.SUPPLIER_DOWNLOADED_CONTRACT, SwitchStatus.LIVE_SWITCH_COMPLETE, HTTPStatus.BAD_REQUEST),
            (SwitchStatus.SENT_TO_MUG, SwitchStatus.LIVE_SWITCH_COMPLETE, HTTPStatus.BAD_REQUEST),
        ):
            with self.subTest(f'Switch to {status_to.value}'):
                response = self.client.post(
                    self.get_url(self.switch.contract_id, 'update_switch'),
                    dict(status=status_to.value),
                )
                self.assertResponse(response, expected_status=expected_status)
                self.switch.refresh_from_db()
                self.assertEqual(self.switch.status, status_after_action)

    def test_update_embi_and_embi_consumption_on_switch_success(self):
        response = self.client.post(
            self.get_url(self.switch.contract_id, 'update_switch'),
            dict(status=SwitchStatus.LIVE_SWITCH_COMPLETE.value),
        )
        self.assertResponse(response)
        self.switch.refresh_from_db()
        self.energy_meter_billing_info.refresh_from_db()
        self.assertEqual(self.energy_meter_billing_info.standing_charge, self.switch.to_standing_charge)
        self.assertEqual(self.energy_meter_billing_info.contract_starts_on, self.switch.contract_start_date)
        self.assertEqual(self.energy_meter_billing_info.contract_ends_on, self.switch.contract_end_date)

        for consumption_rate in self.switch.energy_meter_billing_info.consumption_by_rates.all():
            self.assertEqual(
                consumption_rate.unit_rate,
                getattr(self.switch_conditions, f'to_{consumption_rate.unit_rate_period.period_name}_unit_rate')
            )

    def test_permissions(self):
        self._test_permissions_is_forbidden(
            url=self.get_url(self.switch.contract_id, 'update_switch'),
            allowed_user_roles={RoleName.MUG_USER},
            request_func=self.client.post,
        )
