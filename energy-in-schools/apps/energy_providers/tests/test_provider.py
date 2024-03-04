import json
from datetime import datetime, timezone
from http import HTTPStatus
from unittest.mock import MagicMock, patch

from safedelete import HARD_DELETE

from apps.accounts.permissions import RoleName
from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import ProviderValidateError
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.resources.models import ResourceValue, Unit


class TestEnergyProvider(EnergyProviderBaseTestCase):
    URL = '/api/v1/energy-providers/'

    PROVIDER_REQUEST_DATA = {
        'provider': EnergyProviderAccount.Provider.OVO.value,
        'credentials': {
            'username': 'log',
            'password': 'pass'
        },
        'name': 'the name',
        'description': 'the description'
    }

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_create(self, _):
        self.client.force_login(self.get_user(RoleName.SEM_ADMIN, school_number=1))

        response = self.client.post(self.get_url(), json.dumps(self.PROVIDER_REQUEST_DATA),
                                    content_type='application/json')

        self.assertResponse(response, HTTPStatus.CREATED)

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_create_with_wrong_credentials(self, fake_connector: MagicMock):
        fake_connection = MagicMock
        fake_connection_class = MagicMock(side_effect=fake_connection)
        fake_connector.side_effect = fake_connection_class
        fake_connection.validate = MagicMock(side_effect=ProviderValidateError('error'))

        EnergyProviderAccount.all_objects.delete(force_policy=HARD_DELETE)

        try:
            self.client.force_login(self.get_user(RoleName.SEM_ADMIN))

            response = self.client.post(self.get_url(), json.dumps(self.PROVIDER_REQUEST_DATA),
                                        content_type='application/json')

            self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)

            fake_connection.validate.assert_called()

        finally:
            del fake_connection.validate  # "patch" decorator should clean up after it self but it doesn't

    def test_retrieve(self):
        self.client.force_login(self.get_user(RoleName.SEM_ADMIN))

        response = self.client.get(self.get_url(self.energy_provider.pk))
        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual({
            'id': self.energy_provider.id,
            'provider': self.energy_provider.provider.value,
            'location_id': self.energy_provider.location_id,
            'name': self.energy_provider.name,
            'description': self.energy_provider.description
        }, response.data)

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_patch(self, _: MagicMock):
        self.client.force_login(self.get_user(RoleName.SEM_ADMIN))

        response = self.client.patch(self.get_url(self.energy_provider.pk), json.dumps({
            'credentials': {
                'username': 'the user2',
                'password': 'the password2'
            },
        }), content_type='application/json')

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(json.dumps({
            'username': 'the user2',
            'password': 'the password2'
        }), EnergyProviderAccount.objects.last().credentials)

    @patch('apps.energy_providers.models.EnergyProviderAccount.get_connection_class')
    def test_soft_delete(self, _):
        energy_provider_id = self.energy_provider.pk
        meter_value = ResourceValue(
            time=datetime(2018, 10, 18, 19, 28, 56, tzinfo=timezone.utc),
            value=123,
            unit=Unit.WATT
        )
        self.energy_meter.add_value(meter_value)
        self.client.force_login(self.get_user(RoleName.SEM_ADMIN))

        response = self.client.delete(self.get_url(energy_provider_id))
        self.assertEqual(HTTPStatus.NO_CONTENT, response.status_code)

        value_that_persists = self.energy_meter.get_latest_value()
        self.assertEqual(meter_value.value, value_that_persists.value)

        # re-creating same provider
        response = self.client.post(self.get_url(), json.dumps(self.PROVIDER_REQUEST_DATA),
                                    content_type='application/json')
        self.assertResponse(response, HTTPStatus.CREATED)
        self.assertEqual(response.data['id'], energy_provider_id)

    def test_hard_delete(self):
        meter_value = ResourceValue(
            time=datetime(2018, 10, 18, 19, 28, 56, tzinfo=timezone.utc),
            value=123,
            unit=Unit.WATT
        )
        self.energy_meter.add_value(meter_value)
        self.client.force_login(self.get_user(RoleName.SEM_ADMIN))

        response = self.client.post(self.get_url(self.energy_provider.pk, 'delete-permanently'))
        self.assertEqual(HTTPStatus.OK, response.status_code)

        with self.assertRaises(EnergyMeter.DoesNotExist):
            self.energy_meter.get_latest_value()
