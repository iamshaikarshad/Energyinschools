from functools import partial
from http import HTTPStatus

from drf_yasg.utils import swagger_auto_schema


post_action_swagger_auto_schema = partial(
    swagger_auto_schema,
    method='post',
    responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase}
)
