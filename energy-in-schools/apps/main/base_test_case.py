import tempfile
import time
import logging
from enum import Enum
from http import HTTPStatus
from typing import Any, Callable
from urllib.parse import urlencode
from collections import namedtuple

import funcy
import pytz
from django.contrib.messages import get_messages
from aldjemy.orm import get_session
from django.conf import settings
from django.contrib.auth.models import Group
from django.test import TestCase, override_settings
from rest_framework.fields import DateTimeField
from rest_framework.response import Response

from apps.accounts.management import init_groups
from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.addresses.models import Address
from apps.locations.models import Location
from utilities.logger import logger
from utilities.types import JsonObject


@override_settings(CACHEOPS_ENABLED=False)
class BaseTestCase(TestCase):
    URL = None
    USER_PASSWORD = '!@#$%^&*(QWERTYUIO'
    USER_PASSWORD_HASH = 'pbkdf2_sha256$120000$YHI5cUwbwhip$XRmG6tvtSMMGMUYjDoUmqZ96Sa6oZbJM0a3AGAWtV8g='
    FORCE_LOGIN_AS = None
    MOCK_TIME_SLEEP = True
    maxDiff = 5000

    def setUp(self):
        settings.PRIVATE_STORAGE_ROOT = tempfile.mkdtemp()
        if self.FORCE_LOGIN_AS:
            self.client.force_login(self.get_user(self.FORCE_LOGIN_AS))

    def tearDown(self):
        session = get_session()
        session.close_all()

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        logging.disable(logging.ERROR)

        cls._create_admin()
        init_groups()
        cls._create_and_fill_schools()
        cls._create_mug_user()

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logger.disabled = True

        if cls.MOCK_TIME_SLEEP:
            cls._original_sleep = time.sleep
            time.sleep = lambda sleep_time: cls._original_sleep(min(0.01, sleep_time))

    @classmethod
    def tearDownClass(cls):
        if cls.MOCK_TIME_SLEEP:
            time.sleep = cls._original_sleep

        logger.disabled = False
        super().tearDownClass()

    @classmethod
    @funcy.joining('')
    def get_url(cls, pk=None, *suffixes: str, query_param=None, **kwargs):
        yield cls.URL.format(**kwargs, pk=pk)

        if pk is not None and '{pk}' not in cls.URL:
            yield f'{pk}/'

        for suffix in map(str, suffixes):
            yield suffix
            if not suffix.endswith('/'):
                yield '/'

        if query_param:
            if isinstance(query_param, str):
                if not query_param.startswith('?'):
                    yield '?'

                yield query_param

            elif isinstance(query_param, dict):
                yield '?' + urlencode(query_param)

    @classmethod
    def _create_and_fill_schools(cls):
        for location_number in range(3):
            location = Location.objects.create(
                name=f'school #{location_number}',
                description=f'The School Number {location_number}',
                address=Address.objects.create(
                    line_1=f'school {location_number} address',
                    latitude=51.50,
                    longitude=-0.12
                )
            )

            Location.objects.create(
                name=f'Sub location in #{location_number}',
                description=f'The School Number {location_number} sub',
                address=Address.objects.create(
                    line_1=f'Sub in school {location_number} address',
                ),
                parent_location=location
            )

            for group_name, email in (
                    (RoleName.SLE_ADMIN, f'{RoleName.SLE_ADMIN}_{location_number}@bi.ci'),
                    (RoleName.SEM_ADMIN, ''),
                    (RoleName.TEACHER, ''),
                    (RoleName.PUPIL, ''),
                    (RoleName.ES_ADMIN, ''),
                    (RoleName.ES_USER, '')
            ):
                user = User(
                    username=cls.format_user_name(group_name, location_number),
                    location=location,
                    email=email,
                    is_active=True,
                    password=cls.USER_PASSWORD_HASH if group_name != RoleName.ES_USER else '',
                )

                user.save()
                user.groups.add(Group.objects.get(name=group_name))
                user.save()

    @classmethod
    def _create_admin(cls):
        User(
            username='admin',
            email='admin@bi.ci',
            password=cls.USER_PASSWORD_HASH,
            is_staff=True,
            is_superuser=True,
            is_active=True
        ).save()

    @classmethod
    def _create_mug_user(cls):
        user = User(
            username='mug_user',
            email='mug@mug.mug',
            password=cls.USER_PASSWORD_HASH,
            is_staff=False,
            is_superuser=False,
            is_active=True,
        )
        user.save()
        user.groups.add(Group.objects.get(name=RoleName.MUG_USER))
        user.save()

    @classmethod
    def format_user_name(cls, role_name: str, school_number: int) -> str:
        return f'the_{role_name}_at_{school_number}'

    @classmethod
    def get_user(cls, role_name: str = RoleName.SLE_ADMIN, school_number: int = 0):
        if role_name == RoleName.ADMIN:
            return cls.admin.__get__(cls)

        elif role_name == RoleName.MUG_USER:
            return cls.mug_user.__get__(cls)

        else:
            return User.objects.get(username=cls.format_user_name(role_name, school_number))

    @property
    def admin(self):
        return User.objects.get(username='admin')

    @property
    def sle_admin(self):
        return self.get_user(RoleName.SLE_ADMIN)

    @property
    def sem_admin(self):
        return self.get_user(RoleName.SEM_ADMIN)

    @property
    def teacher(self):
        return self.get_user(RoleName.TEACHER)

    @property
    def pupil(self):
        return self.get_user(RoleName.PUPIL)

    @property
    def es_admin(self):
        return self.get_user(RoleName.ES_ADMIN)

    @property
    def es_user(self):
        return self.get_user(RoleName.ES_USER)

    @property
    def mug_user(self):
        return User.objects.get(username='mug_user')

    @property
    def location(self):
        return self.get_user().location

    def assertResponse(self, response: Response, expected_status: HTTPStatus = HTTPStatus.OK):
        self.assertEqual(expected_status, response.status_code, getattr(response, 'data', None))

    def assertDictValuesOnly(self, json_value: JsonObject, tested_object: object):
        self.assertDictEqual(json_value, get_nested_by_pattern(tested_object, json_value))

    @staticmethod
    def format_datetime(value):
        return DateTimeField().to_representation(value)

    def _update_location_timezone(self, timezone=pytz.utc.zone, location=None):
        location = location or self.location
        location.timezone = timezone
        location.save()

    def _test_permissions_is_forbidden(self, url: str, allowed_user_roles: set, request_func: Callable):
        for role_name in set(RoleName.get_all()) - allowed_user_roles:
            user = self.get_user(role_name)

            self.client.force_login(user)
            response = request_func(url)
            self.assertResponse(response, expected_status=HTTPStatus.FORBIDDEN)


@funcy.post_processing(dict)  # todo move it
def get_nested_by_pattern(instance: Any, pattern: JsonObject) -> JsonObject:
    for key, excepted_value in pattern.items():
        nested_instance = get_by_index_or_attribute(instance, key)

        if isinstance(excepted_value, dict):
            yield key, get_nested_by_pattern(nested_instance, excepted_value)

        elif isinstance(excepted_value, list):
            sub_keys = set()
            for item in excepted_value:
                for sub_key, sub_value in (item.items() if isinstance(item, dict) else ()):
                    if isinstance(sub_value, dict):
                        raise NotImplementedError

                    sub_keys.add(sub_key)

            try:
                if hasattr(nested_instance, 'all'):
                    nested_as_list = list(nested_instance.all())
                else:
                    nested_as_list = list(nested_instance)

            except TypeError:
                yield key, None

            else:
                yield key, [get_nested_by_pattern(item, dict.fromkeys(sub_keys)) for item in nested_as_list]

        else:
            yield key, nested_instance


def get_by_index_or_attribute(instance: Any, key: str) -> Any:
    try:
        value = getattr(instance, key, None) or instance.get(key)

    except (TypeError, IndexError):
        pass

    else:
        if isinstance(value, Enum):
            return value.value

        return value


class AdminBaseTestCase(TestCase):
    CHECK_RESULT_PAIR = namedtuple('check_result_pair', ['data', 'result_message'])

    def assertMessage(self, response, index, expected_message):
        messages = [m.message for m in get_messages(response.wsgi_request)]
        self.assertEqual(str(messages[index]), expected_message)

    def check_non_admin_access(self, *args, **kwargs):
        url = kwargs.get('url')
        self.client.logout()
        response = self.client.post(url)
        self.assertEqual(HTTPStatus.FORBIDDEN, response.status_code)
