from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_web_hooks.base_test_case import SmartThingsClientBaseTestCase


class SmartThingsAppBaseTestCase(SmartThingsClientBaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        # noinspection PyUnresolvedReferences
        cls._smart_things_app_id = SmartThingsApp.objects.create(
            location=cls.get_user().location,
            _auth_token='auth token',
            refresh_token='refresh token',
            app_id='the app id',
            app_location_id=cls.smart_things_location_id,
            connector_id=cls._smart_things_connector_id,
        ).id

    @property
    def smart_things_app(self):
        return SmartThingsApp.objects.get(id=self._smart_things_app_id)
