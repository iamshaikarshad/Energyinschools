from datetime import datetime, timedelta, timezone
from http import HTTPStatus

import factory
from faker import Factory

from apps.smart_things_apps.base_test_case import SmartThingsAppBaseTestCase
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.types import SmartThingsError
from apps.smart_things_web_hooks.models import SmartThingsConnector, SmartThingsConnectorType
from utilities.requests_mock import RequestMock


faker = Factory.create()


class SmartThingsConnectorFactory(factory.DjangoModelFactory):
    class Meta:
        model = SmartThingsConnector

    type = SmartThingsConnectorType.SMART_APP
    connector_name = faker.word()
    connector_id = faker.pystr(min_chars=None, max_chars=20)
    connector_secret = faker.pystr(min_chars=None, max_chars=20)


class SmartThingsAppFactory(factory.DjangoModelFactory):
    class Meta:
        model = SmartThingsApp

    connector = factory.SubFactory(SmartThingsConnectorFactory)
    _auth_token = faker.pystr(min_chars=None, max_chars=20)
    refresh_token = faker.pystr(min_chars=None, max_chars=20)
    app_id = faker.pystr(min_chars=None, max_chars=20)
    app_location_id = faker.pystr(min_chars=None, max_chars=20)
    auth_token_updated_at = faker.date_time(tzinfo=timezone.utc)
    refresh_token_updated_at = faker.date_time(tzinfo=timezone.utc)
    token_refresh_in_progress = False


auth_request_mock = RequestMock(
    request_url='https://auth-global.api.smartthings.com/oauth/token',
    request_body='grant_type=refresh_token&client_id=connector_id&client_secret=connector_secret&'
                 'refresh_token=refresh+token',
    request_headers={},
    request_method=RequestMock.Method.POST,
    response_json={
        'access_token': 'the new access token',
        'refresh_token': 'the new refresh token'
    },
    response_status_code=HTTPStatus.OK,
)

auth_bad_credentials_request_mock = RequestMock(
    request_url='https://auth-global.api.smartthings.com/oauth/token',
    request_body='grant_type=refresh_token&client_id=connector_id&client_secret=connector_secret&'
                 'refresh_token=refresh+token',
    request_headers={},
    request_method=RequestMock.Method.POST,
    response_json={
        'error': 'invalid_grant'
    },
    response_status_code=HTTPStatus.BAD_REQUEST,
)


class TestSmartThingsAppConnector(SmartThingsAppBaseTestCase):
    @RequestMock.assert_requests([auth_request_mock])
    def test_refresh_all_tokens(self):
        old_app_id = SmartThingsApp.objects.create(
            location=self.get_user(school_number=1).location,
            _auth_token='auth token',
            refresh_token='refresh token',
            app_id='the app id',
            app_location_id='the app location id',
            connector_id=self._smart_things_connector_id
        ).id
        app = SmartThingsApp.objects.get(id=old_app_id)
        app.auth_token_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
        app.refresh_token_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
        app.save()

        SmartThingsApp.refresh_old_refresh_tokens()
        self.assertEqual('the new access token', SmartThingsApp.objects.get(id=old_app_id).auth_token)
        self.assertEqual('the new refresh token', SmartThingsApp.objects.get(id=old_app_id).refresh_token)
        self.assertFalse(SmartThingsApp.objects.get(id=old_app_id).token_refresh_in_progress)

        SmartThingsApp.refresh_old_refresh_tokens()  # nothing happened

    @RequestMock.assert_requests([auth_bad_credentials_request_mock])
    def test_refresh_with_bad_credentials(self):
        old_app_id = SmartThingsApp.objects.create(
            location=self.get_user(school_number=1).location,
            _auth_token='auth token',
            refresh_token='refresh token',
            app_id='the app id',
            app_location_id='the app location id',
            connector=self.smart_things_connector
        ).id
        app = SmartThingsApp.objects.get(id=old_app_id)
        app.auth_token_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
        app.refresh_token_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
        app.save()

        with self.assertRaises(SmartThingsError) as raised_st_error:
            SmartThingsApp.refresh_old_refresh_tokens()

        # check extended logging
        self.assertIn('[URL]', raised_st_error.exception.args[0])
        self.assertIn('[LocationUID]', raised_st_error.exception.args[0])
        self.assertIn('[SmartAppId]', raised_st_error.exception.args[0])

        self.assertFalse(SmartThingsApp.objects.get(id=old_app_id).token_refresh_in_progress)

    def test_refresh_when_refresh_in_progress(self):
        old_app_id = SmartThingsApp.objects.create(
            location=self.get_user(school_number=1).location,
            _auth_token='auth token',
            refresh_token='refresh token',
            app_id='the app id',
            app_location_id='the app location id',
            connector=self.smart_things_connector,
            token_refresh_in_progress=True,
        ).id
        app = SmartThingsApp.objects.get(id=old_app_id)
        app.auth_token_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
        app.refresh_token_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
        app.save()
        SmartThingsApp.refresh_old_refresh_tokens()
        self.assertEqual('auth token', SmartThingsApp.objects.get(id=old_app_id).auth_token)
        self.assertEqual('refresh token', SmartThingsApp.objects.get(id=old_app_id).refresh_token)
