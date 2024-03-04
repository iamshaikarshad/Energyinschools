from datetime import datetime, timezone

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.resources.types import ResourceValue, Unit


class TestEnergyAssets(EnergyProviderBaseTestCase):
    provider = EnergyProviderAccount.Provider.ENERGY_ASSETS

    def test_parse_message(self):
        self.assertEqual(ResourceValue(
            time=datetime(2018, 10, 18, 19, 28, 56, tzinfo=timezone.utc),
            value=123,
            unit=Unit.WATT
        ), self.energy_provider.connection.parse_message(
            b'{ \r\n"meter": "E14BG02851", \r\n"timestamp": "2018-10-18T19:28:56", \r\n"total_wh": 5461000, '
            b'\r\n"power": 0.123 \r\n, \r\n"power_unit": "kW"} \r\n',
            self.energy_meter
        ))
