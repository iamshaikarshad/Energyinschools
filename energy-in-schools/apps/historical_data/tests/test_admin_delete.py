from http import HTTPStatus
from unittest.mock import patch

from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.accounts.permissions import RoleName
from apps.main.base_test_case import AdminBaseTestCase


class TestDeleteHistoricalDataAdmin(EnergyHistoryBaseTestCase, AdminBaseTestCase):
    URL = '/admin/historical_data/detailedhistoricaldata/delete_historical_data/'
    FORCE_LOGIN_AS = RoleName.ADMIN

    def test_non_admin_access(self):
        super().check_non_admin_access(url=self.URL)

    def test_admin_access(self):
        self.create_energy_history()
        test_data_sets = [
            self.CHECK_RESULT_PAIR({
                "from_date_0": "2000-10-10",
                "from_date_1": "00:00:00",
                "to_date_0": "2000-11-10",
                "to_date_1": "00:00:00",
                "related_resource": self.energy_meter.id
            }, '3 DETAILED HISTORICAL DATA entries were deleted'),
            self.CHECK_RESULT_PAIR({
                "from_date_0": "2019-09-18",
                "from_date_1": "00:00:00",
                "to_date_0": "2019-09-18",
                "to_date_1": "00:00:00",
                "related_resource": self.energy_meter.id
            }, 'No data to delete'),
            self.CHECK_RESULT_PAIR({
                "from_date_0": "2019-09-18",
                "from_date_1": "00:00:00",
                "to_date_0": "2019-09-17",
                "to_date_1": "00:00:00",
                "related_resource": self.energy_meter.id
            }, '"To date" field value must be less then "From date"')
        ]
        for index, data_set in enumerate(test_data_sets):
            with self.subTest(data_set.result_message):
                response = self.client.post(self.URL, data_set.data)
                self.assertResponse(response, HTTPStatus.FOUND)
                self.assertMessage(response, index, data_set.result_message)

    @patch("apps.historical_data.admin.DELETE_LIMIT", 2)
    def test_delete_limit(self):
        self.create_energy_history()
        test_data_set = self.CHECK_RESULT_PAIR({
            "from_date_0": "2000-10-10",
            "from_date_1": "00:00:00",
            "to_date_0": "2000-11-10",
            "to_date_1": "00:00:00",
            "related_resource": self.energy_meter.id,
        }, 'Not allowed to delete more than 2 entries per time')
        response = self.client.post(self.URL, test_data_set.data)
        self.assertResponse(response, HTTPStatus.FOUND)
        self.assertMessage(response, 0, test_data_set.result_message)
