import json
from enum import Enum
from functools import wraps
from http import HTTPStatus
from itertools import zip_longest
from typing import Any, Dict, List, NamedTuple, Union
from unittest import TestCase

from requests import Request
from responses import mock as response_mock


UNTESTED = object()


class _AssertRequests:
    def __init__(self, request_mocks: List['RequestMock'], test_case: TestCase = None):
        self.request_mocks = request_mocks
        self.test_case = test_case

    def __call__(self, func):
        @wraps(func)
        def inner(*args, **kwargs):
            self.test_case = args[0]
            with self:
                return func(*args, **kwargs)

        return inner

    def __enter__(self):
        for request_mock in self.request_mocks:
            response_mock.add(
                method=request_mock.request_method.value,
                url=request_mock.request_url,
                json=request_mock.response_json,
                status=request_mock.response_status_code,
                match_querystring=request_mock.match_querystring
            )
        response_mock.__enter__()

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            for request_mock, mocked in zip_longest(self.request_mocks, response_mock.calls):
                request_mock: RequestMock

                if mocked:
                    request: Request = mocked.request
                    self.test_case.assertIsNotNone(request_mock, f'Unexpected request: {request.method} {request.url}')
                else:
                    request = None

                with self.test_case.subTest(f'{request_mock.request_method.value} {request_mock.request_url}'):
                    self.test_case.assertIsNotNone(request)
                    self.test_case.assertEqual(request_mock.request_url, request.url)
                    self.test_case.assertEqual(request_mock.request_method.value, request.method)

                    if request_mock.request_json is not UNTESTED:
                        try:
                            self.test_case.assertDictEqual(request_mock.request_json, json.loads(request.body))

                        except json.decoder.JSONDecodeError:
                            self.test_case.assertEqual(json.dumps(request_mock.request_json).encode()
                                                       if request_mock.request_json is not None else None,
                                                       request.body)

                    if request_mock.request_body is not UNTESTED:
                        self.test_case.assertEqual(request_mock.request_body, request.body)
        finally:
            response_mock.__exit__(exc_type, exc_val, exc_tb)


class RequestMock(NamedTuple):
    """
    Used to mock response and validate that the requests happened in the right order with right data

    Usage example:
        >>> import requests
        >>> class TestSomething(TestCase):
        ...     @RequestMock.assert_requests([
        ...         RequestMock(
        ...             request_url='http://my.site/login',
        ...             request_json={'name': 'the name', 'password': 'the password'},
        ...             request_headers={'Content-Type': 'application/json'},
        ...             request_method=RequestMock.Method.POST,
        ...             response_json={"token": 'the token'}
        ...         ),
        ...         RequestMock(
        ...             request_url='http://my.site/me',
        ...             request_headers={'Accept': 'application/json', 'Authorization': 'Bearer the token'},
        ...             response_json={'name': 'your name'}
        ...         )
        ...     ])
        ...     def test(self):
        ...         response = requests.post('http://my.site/login',
        ...                                  json={'name': 'the name', 'password': 'the password'})
        ...         token = response.json()['token']
        ...
        ...         response = requests.get('http://my.site/me', headers={'Accept': 'application/json',
        ...                                                       f'Authorization': 'Bearer {token}'})
        ...         self.assertEqual('your name', response.json()['name'])
        >>>
        >>> TestSomething('test').run()
        <unittest.result.TestResult run=1 errors=0 failures=0>
    """

    class Method(Enum):
        POST = response_mock.POST
        GET = response_mock.GET
        PUT = response_mock.PUT
        PATCH = response_mock.PATCH
        DELETE = response_mock.DELETE
        HEAD = response_mock.HEAD
        OPTIONS = response_mock.OPTIONS

    request_url: str
    request_json: Union[Dict[str, Any], List[Any]] = UNTESTED
    request_body: str = UNTESTED
    request_headers: Dict[str, Any] = None
    request_method: Method = Method.GET

    match_querystring: bool = True

    response_json: Union[Dict[str, Any], List[Any], int] = None
    response_status_code: HTTPStatus = HTTPStatus.OK

    assert_requests = staticmethod(_AssertRequests)  # can be used both as decorator or context manager
