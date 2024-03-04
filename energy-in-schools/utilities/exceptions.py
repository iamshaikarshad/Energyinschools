from http import HTTPStatus

from django.utils.translation import ugettext_lazy as _
from rest_framework.exceptions import APIException


class NoContentError(APIException):
    """Custom exception for NO Content Status"""
    status_code = HTTPStatus.NO_CONTENT
    default_detail = _(HTTPStatus.NO_CONTENT.description, )
    default_code = HTTPStatus.NO_CONTENT.value


class BadGatewayError(APIException):
    """Custom exception for NO Content Status"""
    status_code = HTTPStatus.BAD_GATEWAY
    default_detail = _(HTTPStatus.BAD_GATEWAY.description, )
    default_code = HTTPStatus.BAD_GATEWAY.value
