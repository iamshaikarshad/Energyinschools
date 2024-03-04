import logging
from functools import wraps
from http import HTTPStatus

from django.conf import settings
from rest_framework.decorators import action
from rest_framework.response import Response

from drf_yasg.utils import swagger_auto_schema

from apps.mug_service.exceptions import MUGServiceDisabled, MUGAPIException


logger = logging.getLogger(__name__)

MUG_SERVICE_DISABLED = 'MUG service disabled'
MUG_API_ERROR = 'MUG API error'


def check_mug_disabled(request_func):
    @wraps(request_func)
    def wrapper(self, *args, **kwargs):
        if not settings.MUG_API_URL and not settings.MUG_AUTH_API_URL:
            raise MUGServiceDisabled

        return request_func(self, *args, **kwargs)

    return wrapper


# Use for functions in which MUGApiClient is using
def mug_client_error_handler(return_on_disabled=None, return_on_api_exception=None):
    def decorator(func):

        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except MUGServiceDisabled:
                logger.info(f'MUG service disabled. [FUNCTION]-{func.__name__}')
                return return_on_disabled
            except MUGAPIException as err:
                logger.error(f'MUG API error. {str(err)} [FUNCTION]-{func.__name__}')
                return return_on_api_exception

        return wrapper

    return decorator


#  Should be used in view functions
mug_client_error_handler__view = mug_client_error_handler(
    return_on_disabled=Response(MUG_SERVICE_DISABLED),
    return_on_api_exception=Response(MUG_API_ERROR, HTTPStatus.BAD_GATEWAY)
)


def postcode_view_decorator(serializer=None, url_path=None):
    from apps.mug_service.serializers import PostcodeSerializer
    def decorator(view_func):

        @wraps(view_func)
        def wrapper(*args, **kwargs):
            return view_func(*args, serializer_class=serializer, **kwargs)

        return swagger_auto_schema(
            method='post',
            request_body=PostcodeSerializer,
            responses={
                HTTPStatus.OK.value: serializer,
                HTTPStatus.BAD_REQUEST.value: HTTPStatus.BAD_REQUEST.phrase
            }
        )(mug_client_error_handler(
            return_on_api_exception=Response(MUG_API_ERROR, status=HTTPStatus.BAD_GATEWAY),
            return_on_disabled=Response(MUG_SERVICE_DISABLED, HTTPStatus.BAD_REQUEST)
        )(action(
            detail=False,
            methods=['post'],
            url_path=url_path
        )(wrapper)))

    return decorator
