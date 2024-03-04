from http import HTTPStatus

from apps.smart_things_devices.types import Capability
from rest_framework.exceptions import APIException


class BadCredential(APIException):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    default_detail = ('Bad SmartThings credentials',)


class DeviceNotConnected(Exception):
    pass


class CapabilitiesMismatchException(Exception):

    @staticmethod
    def get_error_message(capability: Capability):
        return f'Requested capability {str(capability)} not in device available capabiltities list'
