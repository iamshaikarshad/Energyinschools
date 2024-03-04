from datetime import datetime, timedelta, timezone

from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.historical_data.models import DetailedHistoricalData


class TestDetailedHistoricalData(EnergyHistoryBaseTestCase):
    def test_remove_old_rows(self):
        DetailedHistoricalData.objects.create(
            resource=self.energy_meter,
            time=datetime.now(tz=timezone.utc) - timedelta(days=4, minutes=1),
            value=42
        )

        DetailedHistoricalData.objects.create(
            resource=self.energy_meter,
            time=datetime.now(tz=timezone.utc) - timedelta(days=3),
            value=24
        )

        DetailedHistoricalData.remove_old_rows()

        self.assertEqual(24, DetailedHistoricalData.objects.get().value)
