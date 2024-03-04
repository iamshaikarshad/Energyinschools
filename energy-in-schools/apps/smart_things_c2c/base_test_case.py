import uuid

from typing import Tuple

from apps.main.base_test_case import BaseTestCase
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_c2c.models import DeviceProfile as DeviceProfileModel
from apps.smart_things_web_hooks.models import SmartThingsConnector


class SmartThingsC2CBaseTestCase(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls._c2c_smart_things_connection_id = SmartThingsConnector.objects.create(
            connector_name='c2cname',
            type=SmartThingsConnector.Type.CLOUD_TO_CLOUD,
            connector_id='conid',
            connector_secret='secret',
        ).id
        cls._c2c_smart_things_app_id = SmartThingsApp.objects.create(
            location=cls.get_user().location,
            _auth_token='auth token',
            refresh_token='refresh token',
            app_id='the app id',
            app_location_id='the app location id',
            connector_id=cls._c2c_smart_things_connection_id
        ).id

        cls._c2c_device_profile_id = DeviceProfileModel.objects.create(
            name='prof_name',
            type=DeviceProfileModel.Type.ENERGY_METER,
            profile_id='prof_id',
            connector_id=cls._c2c_smart_things_connection_id,
        ).id

    @classmethod
    def create_c2c_app(cls) -> Tuple[SmartThingsConnector, SmartThingsApp, DeviceProfileModel]:
        connector = SmartThingsConnector.objects.create(
            connector_name='c2cname',
            type=SmartThingsConnector.Type.CLOUD_TO_CLOUD,
            connector_id=f'{uuid.uuid4().hex}',
            connector_secret=f'{uuid.uuid4().hex}',
        )
        smartapp = SmartThingsApp.objects.create(
            location=cls.get_user().location,
            _auth_token=f'{uuid.uuid4().hex}',
            refresh_token=f'{uuid.uuid4().hex}',
            app_id=f'{uuid.uuid4().hex}',
            app_location_id=f'{uuid.uuid4().hex}',
            connector_id=connector.id
        )

        device_profile = DeviceProfileModel.objects.create(
            name='prof_name',
            type=DeviceProfileModel.Type.ENERGY_METER,
            profile_id=f'{uuid.uuid4().hex}',
            connector_id=connector.id,
        )

        return connector, smartapp, device_profile

    @property
    def c2c_smart_things_connection(self):
        return SmartThingsConnector.objects.get(id=self._c2c_smart_things_connection_id)

    @property
    def c2c_smart_things_app(self):
        return SmartThingsApp.objects.get(id=self._c2c_smart_things_app_id)

    @property
    def c2c_device_profile(self):
        return DeviceProfileModel.objects.get(id=self._c2c_device_profile_id)