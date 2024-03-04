import json
from http import HTTPStatus
from typing import Collection, Dict, Iterable, Type, TypeVar

import funcy
import requests
import requests.auth
from apps.locations.models import Location
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.settings import REFRESH_TOKEN_URL
from apps.smart_things_apps.types import SmartThingsAPIResponse, AuthCredentialsError, BadGateway, BadRequest,\
    SmartThingsAppNotConnected, SmartThingsError, TokenPair
from apps.smart_things_web_hooks.models import SmartThingsConnector
from requests import Request, Response
from rest_framework.status import is_client_error, is_server_error
from utilities.logger import logger
from utilities.types import JsonObject

T = TypeVar('T', bound='SmartThingsAuthApiConnector')


class SmartThingsAuthApiConnector:
    def __init__(self, smart_things_app: "SmartThingsApp"):
        self.smart_things_app = smart_things_app

    @classmethod
    def from_location(cls: Type[T], location: Location,
                      smart_things_location: str,
                      connector_type: SmartThingsConnector.Type = SmartThingsConnector.Type.SMART_APP) -> T:  # XXX TODO Add Annotation
        try:
            return cls(SmartThingsApp.objects.get(
                location=location,
                connector__type=connector_type,
                app_location_id=smart_things_location
            ))
        except SmartThingsApp.DoesNotExist as exception:
            raise SmartThingsAppNotConnected('SmartThings is not connected to the location!') from exception

    def get_token_pair(self, smart_things_client: SmartThingsConnector) -> TokenPair:
        response = SmartThingsAPIResponse(requests.post(
            REFRESH_TOKEN_URL,
            data=dict(
                grant_type='refresh_token',
                client_id=smart_things_client.connector_id,
                client_secret=smart_things_client.connector_secret,
                refresh_token=self.smart_things_app.refresh_token
            ),
            auth=requests.auth.HTTPBasicAuth(smart_things_client.connector_id, smart_things_client.connector_secret)
        ), self.smart_things_app)
        self._check_response(response)

        response_data = response.json()
        return TokenPair(
            access_token=response_data['access_token'],
            refresh_token=response_data['refresh_token']
        )

    @property
    def _auth_headers(self) -> Dict[str, str]:
        return {
            'Authorization': f'Bearer {self.smart_things_app.auth_token}'
        }

    @staticmethod
    @funcy.log_errors(logger.error)
    def _check_response(response: SmartThingsAPIResponse) -> JsonObject:

        if response.text:
            try:
                response_data = response.json()

            except json.decoder.JSONDecodeError as exception:

                if response.status_code == HTTPStatus.UNAUTHORIZED:  # XXX TODO REMOVE WHEN SMART THINGS WILL CHANGE API
                    raise AuthCredentialsError(f'Wrong credentials for SmartThings or token is expired: {response.status_code} "{response.text}"', response)

                raise SmartThingsError(
                    f'SmartThings returned not json body, {response.text}', response) from exception

        else:
            response_data = {}

        if response.status_code == HTTPStatus.UNAUTHORIZED or \
                response.status_code == HTTPStatus.BAD_REQUEST and \
                response_data.get('error') == 'invalid_grant':
            raise AuthCredentialsError(
                f'Wrong credentials for SmartThings: {response.status_code} "{response.text}"', response)

        elif is_client_error(response.status_code):
            raise BadRequest(
                f'Bad request to the SmartThings: {response.status_code} "{response.text}"', response)

        elif is_server_error(response.status_code):
            raise BadGateway(
                f'SmartThings internal error: {response.status_code} "{response.text}"', response)

        elif not response.ok:
            raise SmartThingsError(
                f'response status {response.status_code} is not ok, {response.text}', response)

        return response_data

    @staticmethod
    def _check_fields(check_field_paths: Iterable[Collection[str]], response: Response, response_data: JsonObject):
        for field_path in check_field_paths:
            if funcy.get_in(response_data, field_path) is None:
                request: Request = response.request
                raise SmartThingsError(f'Response for {request.method} {request.url} does not have path "{field_path}"')
