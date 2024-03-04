import json
from datetime import datetime, timezone, timedelta

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import Meter, MeterType
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase


class TestDummy(EnergyProviderBaseTestCase):
    def test_current_consumption(self):
        energy_provider = EnergyProviderAccount.objects.create(
            provider=EnergyProviderAccount.Provider.DUMMY,
            credentials=json.dumps({
                'login': 'any',
                'password': 'any'
            }).encode(),
            location=self.location,
            name='the name 2',
            description='the description',
        )

        value = energy_provider.connection.get_consumption(Meter(
            meter_id='any',
            type=MeterType.ELECTRICITY
        ))

        self.assertLessEqual(datetime.now(tz=timezone.utc) - value.time, timedelta(minutes=1))
        self.assertIsNotNone(value.value)
