from http import HTTPStatus
from datetime import datetime, timezone, timedelta

from django.conf import settings
import jwt

from apps.accounts.permissions import RoleName
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.main.base_test_case import BaseTestCase


class TokenBaseTestCase(BaseTestCase):
    def _check_exp_datetime(self, token: dict, correct_exp_timedelta: timedelta, claim='exp'):
        token_exp_timedelta = datetime.fromtimestamp(token[claim], tz=timezone.utc) - datetime.now(tz=timezone.utc)
        self.assertTrue(correct_exp_timedelta - timedelta(seconds=2) < token_exp_timedelta <= correct_exp_timedelta)


class TestObtainRegularToken(TokenBaseTestCase):
    URL = '/api/v1/token/'

    def test_obtain_token(self):
        for user in (
                self.sle_admin,
                self.admin,
        ):
            with self.subTest(user.role):
                response = self.client.post(self.get_url(), {
                    'username': user.username,
                    'password': self.USER_PASSWORD
                })

                self.assertResponse(response)

                access_token = jwt.decode(response.data['access'], verify=False)
                refresh_token = jwt.decode(response.data['refresh'], verify=False)

                self.assertEqual(user.username, access_token['username'])
                self.assertEqual(user.role, access_token['role'])

                self._check_exp_datetime(access_token, settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
                self._check_exp_datetime(refresh_token, settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'])

                with self.subTest(f'{user.role} refresh'):
                    response = self.client.post(self.get_url('refresh'), {
                        'refresh': response.data['refresh']
                    })
                    token = jwt.decode(response.data['access'], verify=False)
                    self._check_exp_datetime(token, settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])

    def test_regular_token_forbidden_for_mug_user(self):
        response = self.client.post(self.get_url(), {
            'username': self.mug_user.username,
            'password': self.USER_PASSWORD,
        })

        self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)


class TestObtainDashboardToken(EnergyProviderBaseTestCase):
    URL = '/api/v1/token/dashboard/'

    def test_obtain_token(self):
        response = self.client.post(self.get_url(), {
            'location_uid': self.get_user().location.uid,
        })

        self.assertEqual(HTTPStatus.OK, response.status_code)

        token = jwt.decode(response.data['access'], verify=False)
        self.assertEqual(self.get_user().location.id, token['location_id'])
        self.assertEqual(self.get_user(RoleName.ES_USER).role, token['role'])
        self.assertEqual(1, len(token['energy_types']))
        self.assertEqual('ELECTRICITY', token['energy_types'][0])

    def test_obtain_dashboard_token_bad_location_uid(self):
        response = self.client.post(self.get_url(), {
            'location_uid': 'XXXXX',
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)

    def test_access_dashboard_data_with_token(self):
        self.client.logout()

        response = self.client.post(self.get_url(), {
            'location_uid': self.get_user().location.uid,
        })

        self.assertEqual(HTTPStatus.OK, response.status_code)

        token = response.data['access']

        auth_headers = {
            'HTTP_AUTHORIZATION': f'Bearer {token}'  # It is required by django client
        }

        with self.subTest('Check isAuthenticated permission for ES_USER'):
            response = self.client.get(
                f'/api/v1/facts/?location_id={self.get_user().location.uid}',
                data={'format': 'json'},
                content_type='application/json',
                **auth_headers
            )

            self.assertEqual(HTTPStatus.OK, response.status_code)

        with self.subTest('Check 401 for Energy Providers as ES_USER'):
            response = self.client.get(
                f'/api/v1/energy-providers/',
                content_type='application/json',
                **auth_headers
            )
            self.assertEqual(HTTPStatus.FORBIDDEN, response.status_code)


class TestObtainMUGTokenTestCase(TokenBaseTestCase):
    URL = '/api/v1/token/'

    def test_obtain_token(self):
        mug_user = self.mug_user
        response = self.client.post(self.get_url('mug'), {
            'username': mug_user.username,
            'password': self.USER_PASSWORD,
        })
        self.assertResponse(response)

        access_token = jwt.decode(response.data['access'], verify=False)
        refresh_token = jwt.decode(response.data['refresh'], verify=False)

        self._check_exp_datetime(access_token, settings.MUG_ACCESS_TOKEN_LIFETIME)
        self._check_exp_datetime(refresh_token, settings.MUG_REFRESH_TOKEN_LIFETIME)

        self.assertEqual(mug_user.role, access_token['role'])
        self.assertEqual(mug_user.id, access_token['user_id'])

        with self.subTest("After refresh"):
            refresh_token = response.data['refresh']
            response = self.client.post(self.get_url('refresh'), {
                'refresh': refresh_token
            })
            self.assertResponse(response)

            access_token = jwt.decode(response.data['access'], verify=False)
            self._check_exp_datetime(access_token, settings.MUG_ACCESS_TOKEN_LIFETIME)

    def test_bad_credentials(self):
        response = self.client.post(self.get_url('mug'), {
            'username': self.mug_user.username,
            'password': 'XXXXX',
        })
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_forbidden_for_not_mug_user(self):
        for role_name in set(RoleName.get_all()) - {RoleName.MUG_USER}:

            user = self.admin if role_name == RoleName.ADMIN else self.get_user(role_name)

            with self.subTest(user.role):
                response = self.client.post(self.get_url('mug'), {
                    'username': user.username,
                    'password': self.USER_PASSWORD if role_name != RoleName.ES_USER else ''
                })

                self.assertResponse(response, expected_status=HTTPStatus.BAD_REQUEST)
