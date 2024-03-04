import json
from abc import abstractmethod
from datetime import datetime
from http import HTTPStatus
from typing import NamedTuple

from requests import Response

from apps.energy_providers.providers.abstract import AbstractProviderConnection, ProviderAuthError, ProviderCredentials, \
    ProviderError, ProviderValidateError, UnknownProviderRequestError
from utilities.rest import RestSessionPayload


class RestAPIKey(NamedTuple):
    api_key: str
    expired_at: datetime

    @staticmethod
    def from_json(json_data: str):
        return RestAPIKey(**json.loads(json_data))

    def to_json(self):
        return json.dumps(self._asdict())


class RestProviderConnection(AbstractProviderConnection):
    session_payload_class = RestSessionPayload
    session_payload: RestSessionPayload
    credentials_class = ProviderCredentials
    credentials: ProviderCredentials

    @abstractmethod
    def login(self) -> RestSessionPayload:
        pass

    def validate(self):
        try:
            self.login()
        except (ProviderAuthError, ProviderError) as error:
            raise ProviderValidateError from error

    def get_auth_token(self) -> str:
        try:
            payload = self._session_payload

        except (KeyError, json.decoder.JSONDecodeError):
            self._session_payload = payload = self.login()

        else:
            if not payload or payload.is_expired():
                self._session_payload = payload = self.login()

        return payload.token

    def get_auth_headers(self):
        return {
            'Authorization': f'Bearer {self.get_auth_token()}'
        }

    @staticmethod
    def _check_response(response: Response):
        if response.status_code == HTTPStatus.UNAUTHORIZED:
            raise ProviderAuthError(response.text or response.status_code)
        elif response.status_code != HTTPStatus.OK:
            raise UnknownProviderRequestError(response.text or response.status_code)
