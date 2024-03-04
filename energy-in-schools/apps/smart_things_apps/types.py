from typing import NamedTuple, TYPE_CHECKING

from enumfields import Enum
from requests import Response

if TYPE_CHECKING:
    from apps.smart_things_apps.models import SmartThingsApp


class SmartThingsAPIResponse:
    '''Custom class that represents SmartThings API Response with SmartApp including and requests lib Response'''

    def __init__(self, response: Response, smart_things_app: 'SmartThingsApp'):
        self.raw_response = response
        self.smart_things_app = smart_things_app

    def __getattribute__(self, item):
        '''get attribute from SmartThingsAPI response first than try requests lib response'''
        try:
            attr = super().__getattribute__(item)
        except AttributeError:
            return self.raw_response.__getattribute__(item)
        else:
            return attr


class SmartThingsError(Exception):
    def __init__(self, message=None, smart_things_api_response: SmartThingsAPIResponse = None):

        if smart_things_api_response:
            error_extra_details = f'[URL]-{smart_things_api_response.url}; [SmartAppId]-{smart_things_api_response.smart_things_app.app_id}; [LocationUID]-{smart_things_api_response.smart_things_app.location.uid}'

            super().__init__(f'{error_extra_details}: {message}')
        else:
            super().__init__(message)


class SmartThingsAppNotConnected(SmartThingsError):
    pass


class ValidationError(SmartThingsError):
    pass


class BadRequest(SmartThingsError):
    pass


class AuthCredentialsError(BadRequest):
    pass


class BadGateway(SmartThingsError):
    pass


class TokenPair(NamedTuple):
    access_token: str
    refresh_token: str


class SmartAppConnectivityStatus(Enum):
    NO_SMART_APP = 'No connected smart app'
    CONNECTED = 'Smart app connected'
    REFRESH_TOKEN_EXPIRED = 'Refresh token expired'
    REFRESH_TOKEN_SHOULD_BE_REFRESHED = 'Refresh token should be refreshed'
    REFRESH_TOKEN_BROKEN = 'Refresh token broken'
    UNKNOWN = 'Unknown'
