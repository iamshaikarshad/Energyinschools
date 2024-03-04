from datetime import datetime, timedelta, timezone
from typing import List, Optional, Union
from unittest.mock import patch

from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.providers.abstract import Meter, ProviderCredentials
from apps.energy_providers.providers.rest import RestProviderConnection
from utilities.rest import RestSessionPayload
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.resources.types import ResourceValue, TimeResolution


class FakeProvider(RestProviderConnection):

    def login(self) -> RestSessionPayload:
        return RestSessionPayload('the token', datetime.now() + timedelta(hours=1))

    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        pass

    def get_historical_consumption(self, meter: 'Union[EnergyMeter, Meter]', from_date: datetime,
                                   to_date: Optional[datetime] = None,
                                   time_resolution: TimeResolution = TimeResolution.DAY) -> List[ResourceValue]:
        pass

    def get_meters(self) -> List[Meter]:
        pass


@patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class', return_value=FakeProvider)
class TestEnergyProvider(EnergyProviderBaseTestCase):
    def test_session_data(self, _):
        self.assertFalse(self.energy_provider.session_payload)
        payload = RestSessionPayload('the token', datetime(2000, 10, 10, tzinfo=timezone.utc))
        self.energy_provider.connection._session_payload = payload
        self.assertEqual(payload, self.energy_provider.connection._session_payload)
        self.assertTrue(self.energy_provider.session_payload)

    def test_credentials(self, _):
        self.assertEqual(ProviderCredentials('log', 'passsss'), self.energy_provider.connection.credentials)

    def test_validate(self, _):
        self.energy_provider.connection.validate()

    def test_get_auth_token(self, _):
        self.assertFalse(self.energy_provider.connection._session_payload)

        token = self.energy_provider.connection.get_auth_token()
        self.assertEqual('the token', token)
        self.assertTrue(self.energy_provider.connection._session_payload)

        with self.subTest('cache token'):
            session_payload = self.energy_provider.connection._session_payload
            self.energy_provider.connection.get_auth_token()

            self.assertEqual(session_payload, self.energy_provider.connection._session_payload)
