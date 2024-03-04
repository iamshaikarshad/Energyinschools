import subprocess
from io import StringIO

from django.core.management.commands.loaddata import Command

from apps.main.base_test_case import BaseTestCase


class TestSwagger(BaseTestCase):
    URL = '/api/v1/docs/swagger/'

    @classmethod
    def setUpTestData(cls):
        pass  # database should be empty for test fixtures

    def test_swagger_generator(self):
        self.assertResponse(self.client.get(self.get_url()))
        self.assertResponse(self.client.get(self.get_url(query_param=dict(format='openapi'))))

    def test_fixtures(self):
        for files in (
                (
                        'apps/accounts/fixtures/groups.json',
                        'apps/addresses/fixtures/addresses.json',
                        'apps/locations/fixtures/demo-school.json',
                        'apps/energy_providers/fixtures/providers.json',
                ),
                subprocess.check_output(['bash', '-c', 'echo apps/*/fixtures/*']).decode().strip().split(),
        ):
            stream = StringIO()
            Command().execute(
                *files,
                verbosity=1,
                settings=None,
                pythonpath=None,
                traceback=False,
                no_color=False,
                database='default',
                app_label=None,
                ignore=False,
                exclude=[],
                format=None,
                configuration=None,
                stdout=stream
            )
