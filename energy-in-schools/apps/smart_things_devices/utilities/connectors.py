from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Any, Collection, Iterable, Iterator, Tuple
import dateutil.parser

import funcy
import requests
import requests.auth
from apps.smart_things_apps.types import BadGateway, BadRequest, ValidationError, SmartThingsAPIResponse
from apps.smart_things_apps.utilities import SmartThingsAuthApiConnector
from apps.smart_things_devices.settings import CAPABILITY_RULES
from apps.smart_things_devices.types import Attribute, Capability, DeviceDetail, DeviceStatus, SmartThingsRoomDetail
from cacheops.redis import redis_client
from utilities.caching import NotNoneRedisCache
from utilities.types import JsonObject

ANY = '*'

cache = NotNoneRedisCache(redis_client)


class SmartThingsApiConnector(SmartThingsAuthApiConnector):
    ROOM_DETAILS_CACHE_TIMEOUT = int(timedelta(hours=1).total_seconds())

    class Endpoint:
        DEVICES = 'https://api.smartthings.com/v1/devices'
        LOCATIONS = 'https://api.smartthings.com/v1/locations'
        SUBSCRIPTION = 'https://api.smartthings.com/v1/installedapps/{installed_app_id}/subscriptions'

    def _get_all_pages(self, url: str, *, check_field_paths: Iterable[Collection[str]] = ()) -> Iterator[JsonObject]:
        while url:
            response = SmartThingsAPIResponse(requests.get(url, headers=self._auth_headers), self.smart_things_app)
            response_data = self._check_response(response)

            try:
                url = funcy.get_in(response_data, ('_links', 'next', 'href'))

            except TypeError:
                url = None

            for item in response_data.get('items', ()):
                self._check_fields(check_field_paths, response, item)
                yield item

    def get_room_detail(self, location_id: str, room_id: str) -> SmartThingsRoomDetail:
        @cache.cached(timeout=self.ROOM_DETAILS_CACHE_TIMEOUT)
        def _get_room_detail(_location_id: str, _room_id: str):
            response = SmartThingsAPIResponse(requests.get(
                self._get_url(
                    self.Endpoint.LOCATIONS,
                    location_id,
                    'rooms',
                    room_id),
                headers=self._auth_headers), self.smart_things_app)
            try:
                self._check_response(response)
            # TODO: to get locations additional smart app permission is required, which may not be in old locations
            except BadRequest:
                return None
            return SmartThingsRoomDetail.from_json(response.json())

        return _get_room_detail(location_id, room_id)

    def list_devices_details(
            self,
            *,
            ignore_mobile_devices: bool = True,
            ignore_unknown_device_type: bool = False,
    ) -> Iterator[DeviceDetail]:
        for raw_device_detail in self._get_all_pages(self._get_url(self.Endpoint.DEVICES)):
            device_detail = DeviceDetail.from_json(raw_device_detail)
            if device_detail.room_id:
                device_detail = device_detail._replace(
                    room=self.get_room_detail(device_detail.location_id, device_detail.room_id))
            if ignore_mobile_devices and device_detail.dth.device_type_name == 'Mobile Presence' or \
                    ignore_unknown_device_type and device_detail.dth.device_type_id is None:
                continue

            yield device_detail

    def create_device(self, label: str, profile_id: str, external_id: str) -> DeviceDetail:
        response = SmartThingsAPIResponse(
            requests.post(self._get_url(self.Endpoint.DEVICES), headers=self._auth_headers, json=dict(
                label=label,
                locationId=self.smart_things_app.app_location_id,
                app=dict(
                    profileId=profile_id,
                    installedAppId=self.smart_things_app.app_id,
                    externalId=external_id
                )
            )), self.smart_things_app)
        self._check_response(response)

        device_detail = DeviceDetail.from_json(response.json())
        if device_detail.room_id:
            return device_detail._replace(room=self.get_room_detail(device_detail.location_id, device_detail.room_id))
        return device_detail

    def destroy_device(self, device_id: str):
        response = SmartThingsAPIResponse(
            requests.delete(self._get_url(self.Endpoint.DEVICES, device_id), headers=self._auth_headers),
            self.smart_things_app)
        self._check_response(response)

    def get_device_detail(self, device_id: str) -> DeviceDetail:
        response = SmartThingsAPIResponse(
            requests.get(self._get_url(self.Endpoint.DEVICES, device_id), headers=self._auth_headers),
            self.smart_things_app)
        self._check_response(response)

        device_detail = DeviceDetail.from_json(response.json())
        if device_detail.room_id:
            return device_detail._replace(room=self.get_room_detail(device_detail.location_id, device_detail.room_id))
        return device_detail

    def get_device_states(self, device_id: str, capability: Capability) -> Any:
        response = SmartThingsAPIResponse(requests.get(
            self._get_url(
                self.Endpoint.DEVICES,
                device_id,
                'components',
                'main',
                'capabilities',
                capability.value,
                'status'
            ),
            headers=self._auth_headers
        ), self.smart_things_app)
        self._check_response(response)

        try:
            return CAPABILITY_RULES[capability].get_value_from_response(response.json())
        except ValidationError as error:
            raise BadGateway from error

    def get_device_status(self, device_id: str) -> Tuple[str, datetime]:
        response = SmartThingsAPIResponse(requests.get(self._get_url(self.Endpoint.DEVICES, device_id, 'health'),
                                                       headers=self._auth_headers), self.smart_things_app)
        if response.status_code in (HTTPStatus.NOT_FOUND, HTTPStatus.INTERNAL_SERVER_ERROR):
            return DeviceStatus.UNKNOWN.value, datetime.now(tz=timezone.utc)

        response_data = self._check_response(response)

        try:
            last_updated = dateutil.parser.parse(response_data["lastUpdatedDate"])
        except (ValueError, KeyError):
            last_updated = None

        return response_data["state"], last_updated

    def update_device_label(self, device_id: str, label: str) -> None:
        if not label:
            return

        response = SmartThingsAPIResponse(requests.put(self._get_url(self.Endpoint.DEVICES, device_id),
                                                       headers=self._auth_headers,
                                                       json={'label': label}), self.smart_things_app)
        self._check_response(response)

    def execute_command(self, device_id: str, capability: Capability, value: Any) -> None:
        response = SmartThingsAPIResponse(requests.post(
            self._get_url(self.Endpoint.DEVICES, device_id, 'commands'),
            headers=self._auth_headers,
            json={"commands": [CAPABILITY_RULES[capability].get_command_body(value)]}
        ), self.smart_things_app)

        self._check_response(response)

    def send_event(self, device_id: str, capability: Capability, attribute: Attribute, value: Any):
        response = SmartThingsAPIResponse(requests.post(
            self._get_url(self.Endpoint.DEVICES, device_id, 'events'),
            headers=self._auth_headers,
            json={
                'deviceEvents': [
                    {
                        'component': "main",
                        'capability': capability.value,
                        'attribute': attribute.value,
                        'value': value
                    }
                ]
            }
        ), self.smart_things_app)

        self._check_response(response)

    def subscribe_for_device_events(
            self,
            device_id: str,
            capability: Capability = None,
            attribute: Attribute = None,
            state_change_only: bool = True
    ) -> str:
        response = SmartThingsAPIResponse(requests.post(
            self._get_url(self.Endpoint.SUBSCRIPTION),
            headers=self._auth_headers,
            json=dict(
                sourceType='DEVICE',
                device=dict(
                    deviceId=device_id,
                    componentId='*',
                    capability=capability.value if capability else ANY,
                    attribute=attribute.value if attribute else ANY,
                    stateChangeOnly=state_change_only
                )
            )
        ), self.smart_things_app)
        response_data = self._check_response(response)
        self._check_fields((('id',),), response, response_data)

        return response_data['id']

    def unsubscribe_for_device_events(self, subscription_id: str):
        response = SmartThingsAPIResponse(requests.delete(
            self._get_url(self.Endpoint.SUBSCRIPTION, subscription_id),
            headers=self._auth_headers,
        ), self.smart_things_app)
        self._check_response(response)

    def get_all_subscriptions_ids(self) -> Iterator[str]:
        for raw_subscription in self._get_all_pages(
                self._get_url(self.Endpoint.SUBSCRIPTION),
                check_field_paths=(('id',),
                                   ('sourceType',),)
        ):
            if raw_subscription['sourceType'] == 'DEVICE':
                yield raw_subscription['id']

    def get_location(self) -> dict:
        response = SmartThingsAPIResponse(requests.get(
            self._get_url(self.Endpoint.LOCATIONS, self.smart_things_app.app_location_id),
            headers=self._auth_headers
        ), self.smart_things_app)

        response_data = self._check_response(response)
        return response_data

    @funcy.joining('')
    def _get_url(self, endpoint: str, item_id: str = None, *sub_urls: str, **parameters: str) -> str:
        yield endpoint.format(installed_app_id=self.smart_things_app.app_id, **parameters)

        if item_id:
            yield '/'
            yield item_id

        if sub_urls:
            yield '/'
            yield '/'.join(sub_urls)
