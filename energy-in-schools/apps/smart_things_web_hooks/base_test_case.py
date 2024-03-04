from apps.main.base_test_case import BaseTestCase
from apps.smart_things_web_hooks.models import SmartThingsConnector


class SmartThingsClientBaseTestCase(BaseTestCase):
    smart_things_location_id = 'f20d3414-9bab-469b-bbb3-fc25feb4b840'

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls._smart_things_connector_id = SmartThingsConnector.objects.create(
            connector_name='conn-name',
            connector_id='connector_id',
            connector_secret='connector_secret',
        ).id

    @property
    def smart_things_connector(self):
        return SmartThingsConnector.objects.get(id=self._smart_things_connector_id)
