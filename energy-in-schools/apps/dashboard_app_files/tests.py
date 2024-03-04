from unittest.mock import MagicMock

from django.core.files import File

from apps.dashboard_app_files.models import DashboardApp
from apps.main.base_test_case import BaseTestCase


class TestFileServer(BaseTestCase):
    """Test upload and download"""

    URL = '/'

    def test_download_file(self):
        file_mock = MagicMock(spec=File, name='FileMock')
        file_mock.name = 'plan.png'

        dashboard_app = DashboardApp(
            name='test',
            description='test',
            app_file=file_mock
        )

        dashboard_app.save()

        response = self.client.get(self.get_url(DashboardApp.objects.last().app_file.url))

        self.assertResponse(response)
