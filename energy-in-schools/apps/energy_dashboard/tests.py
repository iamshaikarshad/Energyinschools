from unittest.mock import patch, Mock
from datetime import datetime, timezone

from apps.accounts.permissions import RoleName
from apps.energy_dashboard.models import DashboardScreen, DashboardPing, DashboardType
from apps.main.base_test_case import BaseTestCase

REQUEST_TIME_MOCK = datetime(1999, 1, 1, 10, 10, 10, tzinfo=timezone.utc)
datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = REQUEST_TIME_MOCK


class TestEnergyDashboardScreen(BaseTestCase):
    URL = '/api/v1/energy-dashboard/screens/'
    FORCE_LOGIN_AS = RoleName.ES_USER

    def test_get_energy_screens(self):
        screens = DashboardScreen.objects.all()
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        data = response.json()

        self.assertEqual(len(screens), len(data))
        for screen, api_screen in zip(screens, data):
            self.assertEqual(screen.name, api_screen['name'])
            self.assertEqual(len(screen.messages.all()), len(api_screen['messages']))
            for message, api_message in zip(screen.messages.all(), api_screen['messages']):
                self.assertEqual(message.text, api_message['text'])

    def test_delete_default_screen(self):
        default_screen = DashboardScreen.objects.first()
        default_screen.delete()
        try:
            DashboardScreen.objects.get(id=default_screen.id)
        except DashboardScreen.DoesNotExist:
            self.fail("Default screen should not be removed")

    def test_delete_custom_screen(self):
        custom_screen = DashboardScreen.objects.create(name="Test")
        custom_screen.delete()
        self.assertRaises(DashboardScreen.DoesNotExist, DashboardScreen.objects.get, id=custom_screen.id)


class TestEnergyDashboardPing(BaseTestCase):
    URL = '/api/v1/energy-dashboard/ping/'
    FORCE_LOGIN_AS = RoleName.ES_USER
    DASHBOARD_TYPE = DashboardType.DASHBOARD_V0.value

    @patch('apps.energy_dashboard.views.datetime', new=datetime_mock)
    def test_ping(self):
        response = self.client.post(self.get_url(),
                                    {'type': self.DASHBOARD_TYPE})
        self.assertResponse(response)

        dashboard_ping = DashboardPing.objects.get(type=self.DASHBOARD_TYPE, 
                                                   location=self.location)

        self.assertEqual(dashboard_ping.last_ping, REQUEST_TIME_MOCK)
