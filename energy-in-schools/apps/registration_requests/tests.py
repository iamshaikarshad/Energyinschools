import json
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Any, Dict
from unittest.mock import MagicMock, patch

from dateutil.parser import parse
from django.core import mail
from django.core.files import File
from django.test.client import encode_multipart
from django.conf import settings
from django.forms import model_to_dict
from rest_framework_simplejwt.tokens import AccessToken

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.locations.models import Location
from apps.main.base_test_case import BaseTestCase
from apps.hubs.models import Hub, HubType
from apps.registration_requests.models import RegistrationRequest, TRIAL_DURATION
from apps.registration_requests.serializers import RegistrationRequestSerializer
from apps.registration_requests.tasks import disable_school_after_trial, disable_schools_after_trial
from apps.registration_requests.types import Decade, GovernanceType, LegalStatus, PupilsCountCategory, \
    RenewableEnergyType, SchoolType
from apps.registration_requests.registration_request_authentication import CheckStatusAuth, SubmitQuestionnaireAuth,\
    EndTrainingSessionAuth
from apps.mug_service.models import Customer, Site


class TestRegistrationRequests(BaseTestCase):
    URL = '/api/v1/registration-requests/'

    REQUEST_DATA = {
        'email': "user@example.com", 'school_nickname': "the_school_nickname",
        'school_name': "the_school_name", 'address': {
            'line_1': "the_school_address",
            'line_2': "the_school_address line 2",
            'city': 'the city',
            'latitude': 13,
            'longitude': 13,
            'post_code': '123'
        },
        'comment': "the_school_description",
        'school_manager': {
            'first_name': 'school manager first name',
            'last_name': 'school manager second name',
            'job_role': 'the job',
            'email': 'aaa@bbb.ccc',
            'phone_number': '123123123'},
        'utilities_manager': {
            'first_name': 'utilities manager first name',
            'last_name': 'utilities manager second name',
            'job_role': 'the job 2',
            'email': 'aaa@bbb.ccc',
            'phone_number': '123123123'
        },
        'it_manager': {
            'first_name': 'it manager first name',
            'last_name': 'it manager second name',
            'job_role': 'the job 2',
            'email': 'aaa@bbb.ccc',
            'phone_number': '123123123',
            'company_name': 'Test company name',
        },
        'governance_type': GovernanceType.LOCAL_AUTHORITY_MAINTAINED.value,
        'pupils_count_category': PupilsCountCategory.COUNT_200_499.value,
        'campus_buildings_construction_decade': Decade.IN_40.value,
        'school_type': SchoolType.PRIMARY.value,
        'legal_status': LegalStatus.ACADEMY_TRUST.value,
        'registration_number': '321123',
        'used_renewable_energies': [
            {
                'renewable_energy_type': RenewableEnergyType.SOLAR.value
            },
            {
                'renewable_energy_type': RenewableEnergyType.WIND.value
            },
        ],
        'electricity_provider': 'some provider',
        'gas_provider': 'some provider',
        'is_school_agreement_accepted': True,
    }
    REQUEST_RESPONSE = {
        **REQUEST_DATA,
        'status': RegistrationRequest.Status.TRIAL_PENDING.value,
        'reject_reason': None,
    }

    def test_create(self):
        response = self.client.post(self.get_url(), self.REQUEST_DATA, content_type='application/json')

        with self.subTest('Validate response status code'):
            self.assertResponse(response, HTTPStatus.CREATED)

        with self.subTest('Validate created request'):
            registration_request = RegistrationRequest.objects.get(email="user@example.com")
            self.assertDictValuesOnly(self.REQUEST_DATA, registration_request)

        with self.subTest('Validate email notifications count'):
            self.assertEqual(len(mail.outbox), 2)

        with self.subTest('Validate admin email notification'):
            self.assertEqual(mail.outbox[0].subject,
                             f'Received new school registration request from {registration_request.school_name}')
            self.assertEqual(mail.outbox[0].to, [self.admin.email])
            self.assertTrue(mail.outbox[0].alternatives)

        with self.subTest('Validate user email notification'):
            self.assertEqual(mail.outbox[1].subject,
                             f'{registration_request.school_name} created school registration request')
            self.assertEqual(mail.outbox[1].to, [registration_request.email])
            self.assertTrue(mail.outbox[1].alternatives)

    def test_create_without_utilities_manager(self):
        data = self.REQUEST_DATA.copy()

        data['utilities_manager'] = None
        self.assertResponse(
            self.client.post(self.get_url(), data, content_type='application/json'),
            HTTPStatus.CREATED
        )

        RegistrationRequest.objects.last().delete()
        del data['utilities_manager']
        self.assertResponse(
            self.client.post(self.get_url(), data, content_type='application/json'),
            HTTPStatus.BAD_REQUEST
        )

    def test_create_without_school_agreement_accepted(self):
        data = self.REQUEST_DATA.copy()
        data['is_school_agreement_accepted'] = False
        self.assertResponse(
            self.client.post(self.get_url(), data, content_type='application/json'),
            HTTPStatus.BAD_REQUEST
        )

    def test_get(self):
        registration_request = self._create_registration_request()

        expected_data = self._get_expected_response_data(registration_request)

        self.client.force_login(self.admin)
        response = self.client.get(self.get_url(registration_request.id))
        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertDictValuesOnly(expected_data, response.data)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_trial_periods_ends_on(self, _: MagicMock, __: MagicMock):
        registration_request = self._create_registration_request()
        registration_request.registered_school = self.location
        registration_request.status = RegistrationRequest.Status.TRIAL_ACCEPTED
        registration_request.save()

        self.client.force_login(self.admin)
        response = self.client.get(self.get_url(registration_request.id))

        self.assertResponse(response)
        self.assertIsInstance(response.data['trial_periods_ends_on'], str)

    def test_get_by_not_staff(self):
        registration_request = self._create_registration_request()

        self.client.force_login(self.get_user())
        response = self.client.get(self.get_url(registration_request.id))
        self.assertResponse(response, HTTPStatus.NOT_FOUND)

    def test_get_by_not_authenticated(self):
        registration_request = self._create_registration_request()

        response = self.client.get(self.get_url(registration_request.id))
        self.assertEqual(HTTPStatus.UNAUTHORIZED, response.status_code)

    def test_list(self):
        registration_request = self._create_registration_request()

        expected_data = self._get_expected_response_data(registration_request)

        self.client.force_login(self.admin)
        response = self.client.get(self.get_url())
        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(1, len(response.data))
        self.assertDictValuesOnly(expected_data, dict(response.data[0]))

    def test_duplicate_email(self):
        self.assertResponse(
            self.client.post(self.get_url(), self.REQUEST_DATA, content_type='application/json'),
            HTTPStatus.CREATED
        )
        self.assertResponse(
            self.client.post(self.get_url(), self.REQUEST_DATA, content_type='application/json'),
            HTTPStatus.BAD_REQUEST
        )

        RegistrationRequest.objects.update(status=RegistrationRequest.Status.TRIAL_ACCEPTED)
        self.assertResponse(
            self.client.post(self.get_url(), self.REQUEST_DATA, content_type='application/json'),
            HTTPStatus.BAD_REQUEST
        )

        RegistrationRequest.objects.update(status=RegistrationRequest.Status.TRIAL_REJECTED)
        self.assertResponse(
            self.client.post(self.get_url(), self.REQUEST_DATA, content_type='application/json'),
            HTTPStatus.CREATED
        )

    def test_duplicate_nickname(self):
        User(
            username=User.make_school_member_username('the_school_nickname', RoleName.SLE_ADMIN),
            password=self.USER_PASSWORD
        ).save()

        response = self.client.post(self.get_url(), {
            **self.REQUEST_DATA,
            "email": "user@example.com",
            "school_nickname": "The School Nickname",
            "school_name": "the_school_name",
            "school_description": "the_school_description"
        }, content_type='application/json')

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual(0, RegistrationRequest.objects.count())

    def test_accept_trial(self):
        registration_request = self._create_registration_request()

        self.client.force_login(self.admin)
        response = self.client.post(self.get_url(registration_request.id, 'accept-trial'))
        self.assertResponse(response)

        registration_request.refresh_from_db()

        with self.subTest('Validate status in database'):
            self.assertEqual(RegistrationRequest.Status.TRAINING_PERIOD, registration_request.status)

        with self.subTest('Validate location'):
            location = Location.objects.get(name=self.REQUEST_DATA['school_name'])
            self.assertEqual(self.REQUEST_DATA['address']['line_1'], location.address.line_1)

        with self.subTest('Validate members'):
            for group_name in RoleName.get_all_schools_roles():
                self.assertEqual(group_name, User.objects.get(username=User.make_school_member_username(
                    self.REQUEST_DATA['school_nickname'],
                    group_name
                )).role)

            sle_admin = User.objects.get(username=User.make_school_member_username(
                self.REQUEST_DATA['school_nickname'],
                RoleName.SLE_ADMIN
            ))

            self.assertEqual(self.REQUEST_DATA['email'], sle_admin.email)

        with self.subTest('Created at least 1 webhub'):
            created_webhub = Hub.objects.filter(sub_location=location).first()
            self.assertIsNotNone(created_webhub)
            self.assertEqual(created_webhub.type, HubType.BROWSER)
            self.assertEqual(created_webhub.name, f'{registration_request.school_name} Webhub')

        self.assertCountEqual(
            [message.to for message in mail.outbox],
            [[email] for email in settings.CREDENTIALS_RECEIVERS_TRAINING_PERIOD]
        )
        for index, message in enumerate(mail.outbox):
            self.assertEmailWithCredentials(message=message,
                                            subject=f'School account for {registration_request.school_name} '
                                            f'has been created',
                                            mail_to=settings.CREDENTIALS_RECEIVERS_TRAINING_PERIOD[index])

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_end_training_session(self, _: MagicMock, __: MagicMock):

        # create registration request
        registration_request = self._create_registration_request()

        # move registration request to accepted trial(training period)
        self.client.force_login(self.admin)
        response = self.client.post(self.get_url(registration_request.id, 'accept-trial'))
        self.assertResponse(response)
        self.client.logout()

        # get user from created school
        user_created_in_trial_period = User.objects.filter(location=registration_request.registered_school).first()

        user_password_hash_created_in_trial_period = user_created_in_trial_period.password

        # End training session
        access_token = EndTrainingSessionAuth.obtain_token(
            EndTrainingSessionAuth.Payload(
                registration_request_id=registration_request.id,
            )
        )

        response = self.client.post(self.get_url(registration_request.id, 'end-training-session'),
                                    HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertResponse(response)

        registration_request.refresh_from_db()

        # Check password that it is not changed (Required request from June 2019)
        self.assertEqual(registration_request.status, RegistrationRequest.Status.TRIAL_ACCEPTED)
        self.assertEqual(user_created_in_trial_period.password, user_password_hash_created_in_trial_period)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_end_training_session_admin_role(self, _: MagicMock, __: MagicMock):
        # create registration request
        registration_request = self._create_registration_request()

        # move registration request to accepted trial
        self.client.force_login(self.admin)
        response = self.client.post(self.get_url(registration_request.id, 'accept-trial'))
        self.assertResponse(response)

        # move registration request to accepted trial(training period)
        response = self.client.post(self.get_url(registration_request.id, 'end-training-session'))
        self.assertResponse(response)

        registration_request.refresh_from_db()

        # Check status changed
        self.assertEqual(registration_request.status, RegistrationRequest.Status.TRIAL_ACCEPTED)

        # check previous link unavailable
        access_token = EndTrainingSessionAuth.obtain_token(
            EndTrainingSessionAuth.Payload(
                registration_request_id=registration_request.id,
            )
        )

        response = self.client.post(self.get_url(registration_request.id, 'end-training-session'),
                                    HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertResponse(response, HTTPStatus.NOT_FOUND)

    def assertEmailWithCredentials(self, message, subject, mail_to):
        self.assertEqual(message.subject, subject)
        self.assertEqual(message.to, [mail_to])
        self.assertTrue(message.alternatives)
        self.assertTrue(message.attachments[0][1]
                        .startswith('Role,Login,Password\r\nsle_admin,the school nickname sle admin,'))

    def test_activate_users_after_accept_activation(self):
        registration_request = self._create_registration_request()
        registration_request.registered_school = self.location
        registration_request.status = RegistrationRequest.Status.ACTIVATION_PENDING
        registration_request.save()

        sle_admin = self.sle_admin
        sle_admin.is_active = False
        sle_admin.save()

        self.client.force_login(self.admin)
        self.assertResponse(self.client.post(self.get_url(registration_request.id, 'accept-activation')))
        self.assertTrue(self.sle_admin.is_active)

    def test_accept_trial_by_not_staff(self):
        registration_request = self._create_registration_request()

        self.client.force_login(self.get_user())
        response = self.client.post(self.get_url(registration_request.id, 'accept-trial'))

        self.assertResponse(response, HTTPStatus.FORBIDDEN)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_accept_reject_actions(self, mock: MagicMock, __: MagicMock):
        registration_request = self._create_registration_request()
        registration_request.registered_school = self.location

        for status_before, status_after, action_url, message_subject, mail_to, request_body in (
                (
                        RegistrationRequest.Status.TRIAL_PENDING,
                        RegistrationRequest.Status.TRIAL_REJECTED,
                        'reject-trial',
                        f'{registration_request.school_name} registration request was declined',
                        "user@example.com",
                        {'registration_reject_reason': '1234567890'},
                ),
                (
                        RegistrationRequest.Status.ACTIVATION_PENDING,
                        RegistrationRequest.Status.ACTIVATION_ACCEPTED,
                        'accept-activation',
                        f'{registration_request.school_name} registration request was accepted',
                        "user@example.com",
                        {}
                ),
                (
                        RegistrationRequest.Status.ACTIVATION_PENDING,
                        RegistrationRequest.Status.ACTIVATION_REJECTED,
                        'reject-activation',
                        f'{registration_request.school_name} activation request was declined',
                        "user@example.com",
                        {'activation_reject_reason': '1234567890'},
                ),
        ):
            with self.subTest(f'{action_url}: wrong status'):
                self.client.force_login(self.admin)

                for status in RegistrationRequest.Status:
                    if status is status_before:
                        continue

                    registration_request.status = status
                    registration_request.save()

                    self.assertResponse(
                        self.client.post(self.get_url(registration_request.id, action_url), request_body),
                        HTTPStatus.NOT_FOUND
                    )

            with self.subTest(f'{action_url}: wrong user'):
                registration_request.status = status_before
                registration_request.save()
                self.client.force_login(self.sle_admin)

                self.assertResponse(
                    self.client.post(self.get_url(registration_request.id, action_url), request_body),
                    HTTPStatus.FORBIDDEN
                )

            registration_request.status = status_before
            registration_request.save()
            self.client.force_login(self.admin)
            mail.outbox.clear()

            with self.subTest(f'{action_url}: request'):
                self.assertResponse(self.client.post(self.get_url(registration_request.id, action_url), request_body))

            registration_request.refresh_from_db()

            with self.subTest(f'{action_url}: Validate status in database'):
                self.assertEqual(status_after, registration_request.status)

            with self.subTest(f'{action_url}: Validate email'):
                self.assertEqual(len(mail.outbox), 1)
                self.assertEqual(mail.outbox[0].subject, message_subject)
                self.assertEqual(mail.outbox[0].to, [mail_to])
                self.assertTrue(mail.outbox[0].alternatives)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_upload_questionnaire(self, _: MagicMock, __: MagicMock):
        self.client.force_login(self.sle_admin)

        registration_request = self._create_registration_request()
        registration_request.status = RegistrationRequest.Status.TRIAL_ACCEPTED
        registration_request.registered_school = self.location
        registration_request.save()

        content = self._get_questionnaire_data()

        with self.subTest('without loa'):
            content_without_loa = content.copy()
            content_without_loa.pop('signed_loa')
            self._put_questionnaire(registration_request.id, content_without_loa, HTTPStatus.BAD_REQUEST)

        with self.subTest('full data'):
            self._put_questionnaire(registration_request.id, content)
            registration_request.refresh_from_db()

            self.assertIsNotNone(registration_request.questionnaire.signed_loa)
            self.assertEqual(RegistrationRequest.Status.ACTIVATION_PENDING, registration_request.status)

    @staticmethod
    def _get_questionnaire_data():
        file_mock = MagicMock(spec=File, filename='loa.png')
        content = dict(
            had_energy_audit=True,
            want_energy_audit=True,
            want_use_lessons_materials=True,
            want_install_energy_monitoring=True,
            want_participate_energy_management_interview=True,
            allow_smart_dcc_data_access_to_third_party=True,
            use_artificial_benchmark_for_first_year=True,
            signed_loa=file_mock,
        )
        return content

    def _put_questionnaire(
            self,
            registration_request_id: int,
            content: Dict[str, Any],
            expected_status: HTTPStatus = HTTPStatus.OK,
            **kwargs
    ):
        response = self.client.put(
            path=self.get_url(registration_request_id, 'questionnaire'),
            data=encode_multipart('BoUnDaRyStRiNg', content),
            content_type='multipart/form-data; boundary=BoUnDaRyStRiNg',
            **kwargs,
        )
        self.assertResponse(response, expected_status)

    def test_check_registration_request_status_authentication(self):
        registration_request = self._create_registration_request()

        with self.subTest('as anonymous user'):
            self.client.logout()
            self.assertResponse(
                self.client.get(self.get_url(registration_request.id, 'status')),
                HTTPStatus.UNAUTHORIZED
            )

        with self.subTest('as sle admin'):
            self.client.force_login(self.sle_admin)
            self.assertResponse(
                self.client.get(self.get_url(registration_request.id, 'status')),
                HTTPStatus.UNAUTHORIZED
            )

        with self.subTest('with user less auth token'):
            self.client.logout()

            access_token = CheckStatusAuth.obtain_token(
                CheckStatusAuth.Payload(
                    registration_request_id=registration_request.id,
                )
            )

            response = self.client.get(
                self.get_url(registration_request.id, 'status'),
                HTTP_AUTHORIZATION=f'Bearer {access_token}'
            )

            self.assertResponse(response)
            self.assertEqual(registration_request.status.value, response.data)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_registration_request_status_in_token(self, _: MagicMock, __: MagicMock):
        registration_request = self._create_registration_request()

        registration_request.registered_school = self.location
        registration_request.status = RegistrationRequest.Status.TRIAL_ACCEPTED
        registration_request.save()

        response = self.client.post(
            path='/api/v1/token/',
            data=dict(
                username=self.sle_admin.username,
                password=self.USER_PASSWORD,
            )
        )

        token = AccessToken(token=response.json()['access'])

        self.assertEqual(RegistrationRequest.Status.TRIAL_ACCEPTED.value, token['registration_status'])
        self.assertEqual(registration_request.trial_periods_ends_on, parse(token['trial_ends_on']).date())

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_disable_schools_after_trial(self, _: MagicMock, __: MagicMock):
        registration_request = self._create_registration_request()

        location = self.location
        location.created_at = datetime.now(tz=timezone.utc) - TRIAL_DURATION - timedelta(days=1)
        location.save()
        registration_request.status = RegistrationRequest.Status.TRIAL_ACCEPTED
        registration_request.registered_school = location
        registration_request.save()

        with self.subTest('disable_schools_after_trial'), patch(
                'apps.registration_requests.tasks.disable_school_after_trial.delay'
        ) as disable_school_after_trial_mock:
            disable_schools_after_trial()
            disable_school_after_trial_mock.assert_called_once_with(registration_request.id)

        with self.subTest('disable_school_after_trial(registration_request_id)'):
            disable_school_after_trial(registration_request.id)

            self.assertFalse(any(self.get_user(role_name).is_active for role_name in RoleName.get_all_schools_roles()))

            self.assertEqual(1, len(mail.outbox))
            self.assertEqual(f'{registration_request.school_name} trial period ended', mail.outbox[0].subject)
            self.assertEqual([self.sle_admin.email], mail.outbox[0].to)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=123)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_submit_questionnaire_after_trial(self, _: MagicMock, __: MagicMock):
        registration_request = self._create_registration_request()
        registration_request.status = RegistrationRequest.Status.TRIAL_ACCEPTED
        registration_request.registered_school = self.location
        registration_request.save()

        # noinspection PyCallByClass
        access_token = SubmitQuestionnaireAuth.obtain_token(
            SubmitQuestionnaireAuth.Payload(
                registration_request_id=registration_request.id,
            )
        )

        self._put_questionnaire(
            registration_request.id,
            self._get_questionnaire_data(),
            HTTP_AUTHORIZATION=f'Bearer {access_token}'

        )

        registration_request.refresh_from_db()
        self.assertEqual(RegistrationRequest.Status.ACTIVATION_PENDING, registration_request.status)

    @patch('apps.mug_service.api_client.MUGApiClient.request_add_customer', return_value=444)
    @patch('apps.mug_service.api_client.MUGApiClient.request_add_site', return_value=123)
    def test_create_mug_customer_and_site(self, site_mock: MagicMock, customer_mock: MagicMock):
        registration_request = self._create_registration_request()

        with self.subTest("Called only for status TRIAL_ACCEPTED"):
            registration_request.status = RegistrationRequest.Status.ACTIVATION_PENDING
            registration_request.save()
            customer_mock.assert_not_called()
            site_mock.assert_not_called()

        with self.subTest("Creation method called once with correct parameters"):
            registration_request.registered_school = self.location
            registration_request.status = RegistrationRequest.Status.TRIAL_ACCEPTED
            registration_request.save()
            customer_mock.assert_called_once_with(
                json.dumps({
                    "companyName": registration_request.school_name,
                    "mobile": registration_request.school_manager.phone_number,
                    "email": registration_request.email,
                    "companyRegistrationNumber": registration_request.registration_number,
                    "registeredAddress": {
                        "line1": registration_request.address.line_1,
                        "line2": registration_request.address.line_2,
                        "city": registration_request.address.city,
                        "postcode": registration_request.address.post_code
                    }
                })
            )
            site_mock.assert_called_once_with(
                444,
                json.dumps({
                    "siteName": self.location.name,
                    "address": {
                        "line1": self.location.address.line_1,
                        "line2": self.location.address.line_2,
                        "city": self.location.address.city,
                        "postcode": self.location.address.post_code,
                    }
                })
            )
            registration_request.save()
            customer_mock.assert_called_once()
            site_mock.assert_called_once()

        with self.subTest("Customer and site created"):
            self.assertTrue(
                Customer.objects.filter(registration_request=registration_request, mug_customer_id=444).exists()
            )
            self.assertEqual(444, registration_request.mug_customer.mug_customer_id)
            self.assertTrue(
                Site.objects.filter(sub_location=registration_request.registered_school, mug_site_id=123).exists()
            )

    def _get_expected_response_data(self, registration_request: RegistrationRequest) -> Dict[str, Any]:
        expected_data = self.REQUEST_RESPONSE.copy()
        expected_data['id'] = registration_request.id
        expected_data['created_at'] = self.format_datetime(registration_request.created_at)
        expected_data['updated_at'] = self.format_datetime(registration_request.updated_at)
        return expected_data

    def _create_registration_request(self) -> RegistrationRequest:
        return RegistrationRequestSerializer().create(validated_data=self.REQUEST_DATA.copy())
