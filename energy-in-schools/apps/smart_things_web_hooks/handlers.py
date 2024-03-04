import logging
from typing import Any, Dict, List, NamedTuple, Optional, Tuple, TYPE_CHECKING
from datetime import datetime, timezone

import requests
import stringcase
from django.contrib.auth import authenticate
from django.db.transaction import atomic
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from apps.accounts.permissions import RoleName
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_devices.types import DeviceEvent
from apps.smart_things_sensors.models import SmartThingsSensor
from apps.smart_things_web_hooks.models import SmartThingsConnector
from apps.smart_things_web_hooks.settings import get_config_page_data, get_initialize_page_data
from utilities.types import JsonObject

if TYPE_CHECKING:
    from apps.accounts.models import User

logger = logging.getLogger(__name__)


class SmartAppInfo(NamedTuple):
    app_id: str
    app_type: SmartThingsConnector.Type
    name: str
    description: str
    permissions: Tuple[str, ...]
    first_page_id: str = 'main'


class AbstractSmartThingsWebHookHandler:
    smart_app_info: SmartAppInfo = None

    def __init__(self, request_body: JsonObject, connector_name: str):
        self.request_body = request_body
        self.connector_name = connector_name

    def process_request(self) -> Dict[str, Any]:
        handle_lifecycle = getattr(self, 'handle_' + stringcase.lowercase(self.lifecycle), None)

        if not handle_lifecycle:
            logger.warning(f'Handler for lifecycle "{self.lifecycle}" is not implemented!')
            raise NotImplementedError

        return handle_lifecycle()

    def verify_sender(self, path: str, headers: JsonObject):
        if self.lifecycle == 'PING' or self.lifecycle == 'CONFIRMATION':
            return True
        # TODO: There is no public key currently, need to verify x509 certificate somehow
        # try:
        #     if HeaderVerifier(headers=headers,
        #                       # secret=self.smart_things_connector.connector_public_key,
        #                       method='POST',
        #                       path=path).verify():
        #         return True
        # except httpsig.utils.HttpSigException:
        #     pass

        return True

    @property
    def lifecycle(self) -> str:
        return self.request_body['lifecycle']

    @property
    def data(self) -> JsonObject:
        if self.lifecycle == 'OAUTH_CALLBACK':
            key = 'oAuthCallbackData'
        else:
            key = stringcase.camelcase(self.lifecycle.lower()) + 'Data'

        return self.request_body[key]

    @property
    def installed_app_id(self) -> Optional[str]:
        return self.data.get('installedApp', self.data).get('installedAppId')  # two possible positions

    @property
    def location_id(self) -> Optional[str]:
        return self.data.get('installedApp', {}).get('locationId')

    @property
    def smart_things_app(self) -> Optional[SmartThingsApp]:
        if self.installed_app_id:
            return SmartThingsApp.objects.filter(app_id=self.installed_app_id).first()

    @property
    def smart_things_connector(self) -> SmartThingsConnector:
        return SmartThingsConnector.objects.get(
            connector_name=self.connector_name,
            type=self.smart_app_info.app_type
        )

    def handle_ping(self):
        return {'pingData': {'challenge': self.data['challenge']}}

    def handle_configuration(self) -> JsonObject:
        if self.data['phase'] == 'INITIALIZE':
            return {'configurationData': get_initialize_page_data(self.smart_app_info)}
        elif self.data['phase'] == 'PAGE':
            return {'configurationData': get_config_page_data()}
        else:
            logger.warning(f'Action for phase "{self.data["phase"]}" is not implemented!')
            raise NotImplementedError

    def handle_install(self) -> JsonObject:
        self.create_or_update_smart_things_app(self.data)

        return {'installData': {}}

    def handle_update(self) -> JsonObject:
        self.create_or_update_smart_things_app(self.data)

        return {'updateData': {}}

    def handle_confirmation(self) -> JsonObject:
        confirmation_link = self.request_body['confirmationData']['confirmationUrl']
        is_confirmed = False
        if self.request_body['confirmationData'] and confirmation_link:
            is_confirmed = requests.get(confirmation_link).status_code == requests.codes.ok

        return {'status': is_confirmed}

    def handle_uninstall(self) -> JsonObject:
        SmartThingsApp.objects.filter(app_id=self.installed_app_id, app_location_id=self.location_id).delete()

        return {'uninstallData': {}}

    @atomic
    def create_or_update_smart_things_app(self, data: JsonObject):
        try:
            app = SmartThingsApp.objects.select_for_update().get(app_id=self.installed_app_id)

        except SmartThingsApp.DoesNotExist:
            app = SmartThingsApp(app_id=self.installed_app_id)

        user = self._authenticate(self.data)

        app.connector = self.smart_things_connector
        app.location = user.location
        app.auth_token = data['authToken']
        app.refresh_token = data['refreshToken']
        app.auth_token_updated_at = datetime.now(timezone.utc)
        app.refresh_token_updated_at = datetime.now(timezone.utc)
        app.app_location_id = self.location_id
        app.save()

    def _authenticate(self, data: JsonObject) -> 'User':
        username, password = self._get_configuration_data(data['installedApp']['config'])
        user = authenticate(username=username, password=password)

        if not user:
            raise AuthenticationFailed

        if user.role != RoleName.SLE_ADMIN:
            raise ValidationError

        return user

    @staticmethod
    def _get_configuration_data(data):
        user_name = extract_field_value(data['sle_username'])
        user_password = extract_field_value(data['sle_password'])
        return user_name, user_password


class SmartAppWebHookHandler(AbstractSmartThingsWebHookHandler):
    smart_app_info = SmartAppInfo(
        name='Connect Your School',
        description="Setup School Smart App",
        app_id='energy-in-schools',
        app_type=SmartThingsConnector.Type.SMART_APP,
        permissions=(
            'i:deviceprofiles:*',
            'r:devices:*',
            'w:devices:*',
            'x:devices:*',
            'r:locations:*'
        ),
    )

    def handle_event(self) -> JsonObject:
        events = self.data['events']

        for event in events:
            if event.get('eventType') == 'DEVICE_EVENT':
                self.process_device_event(DeviceEvent.parse(event['deviceEvent']))

        return {'eventData': {}}

    @staticmethod
    def process_device_event(device_event: DeviceEvent):
        smart_things_sensor: SmartThingsSensor = SmartThingsSensor.objects.filter(
            device__smart_things_id=device_event.device_id,
            capability=device_event.capability
        ).first()

        if smart_things_sensor:
            smart_things_sensor.process_event(device_event)


class C2CDeviceWebHookHandler(AbstractSmartThingsWebHookHandler):
    smart_app_info = SmartAppInfo(
        name='Connect Your School',
        description="Setup School Smart App",
        app_id='energy-in-schools-devices',
        app_type=SmartThingsConnector.Type.CLOUD_TO_CLOUD,
        permissions=(
            'i:deviceprofiles:*',
            'r:devices:*',
            'w:devices:*',
            'x:devices:*',
            'r:locations:*'
        ),
    )


def extract_field_value(data: List[Any]) -> Optional[str]:
    data_detail = data[0]
    if data_detail['valueType'] == 'STRING':
        return data_detail['stringConfig']['value']
