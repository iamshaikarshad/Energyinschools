from apps.hubs.authentication import RaspberryPiAuthentication
from apps.hubs.models import Hub
from apps.main.base_test_case import BaseTestCase


class HeaderField:
    SCHOOL_ID = 'HTTP_SCHOOL_ID'
    PI_ID = 'HTTP_PI_ID'


class HubBaseTestCase(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls._hub_id = Hub.objects.create(
            name='The hub 0',
            description='The mega hub 0',
            sub_location=cls.get_user().location
        ).id

        cls._hub_id_in_sub_location = Hub.objects.create(
            name=f'The hub 0 in sub location',
            description=f'The mega hub 0 in sub location',
            sub_location=cls.get_user().location.sub_locations.first()
        ).id

        for school_number in range(1, 3):
            Hub.objects.create(
                name=f'The hub {school_number}',
                description=f'The mega hub {school_number}',
                sub_location=cls.get_user(school_number=school_number).location
            )

            Hub.objects.create(
                name=f'The hub {school_number} in sub location',
                description=f'The mega hub {school_number} in sub location',
                sub_location=cls.get_user(school_number=school_number).location.sub_locations.first()
            )

    def setUp(self):
        super().setUp()
        RaspberryPiAuthentication.get_auth_data.invalidate_all()

    @property
    def hub(self):
        return Hub.objects.get(id=self._hub_id)

    @property
    def hub_in_sub_location(self):
        return Hub.objects.get(id=self._hub_id_in_sub_location)

    def get_hub_headers(self, hub_uid: str = None, location_uid: str = None):
        return {
            HeaderField.PI_ID: hub_uid if hub_uid is not None else self.hub.uid,
            HeaderField.SCHOOL_ID: location_uid if location_uid is not None else self.location.uid,
        }
