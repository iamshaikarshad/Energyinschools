from typing import NamedTuple, Union, Tuple

import funcy
from django.core.exceptions import ValidationError
from rest_framework import authentication, exceptions
from rest_framework.request import Request

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.hubs.models import Hub
from apps.locations.models import Location
from django.conf import settings

# TODO rename to hub auth
class RaspberryPiAuthData(NamedTuple):
    location: Location
    raspberry_hub: Hub


class RaspberryPiAuthentication(authentication.BaseAuthentication):
    def authenticate_header(self, request: Request):
        return 'WWW-Authenticate: Custom realm="api"'

    def authenticate(self, request: Request):
        if not {'HTTP_SCHOOL_ID', 'HTTP_PI_ID'}.issubset(request.META):
            return

        auth_result = self.get_auth_data(request.META['HTTP_PI_ID'], request.META['HTTP_SCHOOL_ID'])

        if isinstance(auth_result, Exception):
            raise auth_result

        return auth_result

    @staticmethod
    @funcy.cache(settings.RASPBERRY_PI_AUTH_CACHE_TIME)
    @funcy.ignore(exceptions.AuthenticationFailed, exceptions.AuthenticationFailed())
    def get_auth_data(pi_id: str, school_id: str) -> Union[Tuple[User, RaspberryPiAuthData], Exception]:
        try:
            raspberry_hub = Hub.objects.get(uid=pi_id)
            location = Location.objects.get(uid=school_id)
            user = User.objects.get(
                groups__name=RoleName.PUPIL,
                location=location
            )
        except (Hub.DoesNotExist, Location.DoesNotExist, User.DoesNotExist, ValidationError) as exception:
            raise exceptions.AuthenticationFailed() from exception

        is_hub_in_current_location = location.id == raspberry_hub.sub_location_id
        is_hub_in_current_sub_location = (raspberry_hub.sub_location.parent_location and
                                          location.id == raspberry_hub.sub_location.parent_location.id)

        if not (is_hub_in_current_location or is_hub_in_current_sub_location):
            raise exceptions.AuthenticationFailed()

        return user, RaspberryPiAuthData(location, raspberry_hub)
