# Create your tests here.
import json
from http import HTTPStatus

from apps.accounts.models import User
from apps.accounts.permissions import RoleName
from apps.accounts.tools import ResetPasswordToken
from apps.main.base_test_case import BaseTestCase


class TestUsers(BaseTestCase):
    NEW_PASSWORD = 'newPa$$word'

    def test_get_self_by_id(self):
        for role_name in RoleName.get_all():
            with self.subTest(f'Get {role_name}'):
                if role_name == RoleName.ADMIN:
                    user = self.admin
                elif role_name == RoleName.MUG_USER:
                    user = self.mug_user
                else:
                    user = self.get_user(role_name=role_name)

                self.client.force_login(user)
                response = self.client.get(f'/api/v1/users/{user.id}/')

                self.assertEqual(HTTPStatus.OK, response.status_code)

                if role_name in (RoleName.SLE_ADMIN, RoleName.ADMIN):
                    self.assertEqual(user.email, response.data['email'])

                self.assertEqual(user.location_id, response.data['location_id'])
                self.assertEqual(role_name, response.data['role'])
                self.assertIn('last_login', response.data)

    def test_list_for_school_members(self):
        for group_name in (
                RoleName.SLE_ADMIN,
                RoleName.SEM_ADMIN,
                RoleName.TEACHER,
                RoleName.PUPIL,
        ):
            with self.subTest(f'Login as {group_name}'):
                user = self.get_user(group_name)
                self.client.force_login(user)

                response = self.client.get('/api/v1/users/')
                self.assertEqual(HTTPStatus.OK, response.status_code)
                self.assertEqual(User.objects.filter(location=user.location).count(), len(response.data))

    def test_list_for_not_authorization(self):
        response = self.client.get('/api/v1/users/')
        self.assertEqual(HTTPStatus.UNAUTHORIZED, response.status_code)

    def test_change_email(self):
        self.client.force_login(self.get_user())
        response = self.client.patch(f'/api/v1/users/{self.get_user().id}/', json.dumps({
            'email': 'new@email.com'
        }), content_type='application/json')

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual('new@email.com', self.get_user().email)

    def test_change_password(self):
        self.client.force_login(self.get_user())

        response = self.client.post(f'/api/v1/users/{self.get_user().id}/change-password/', {
            'current_password': self.USER_PASSWORD,
            'new_password': self.NEW_PASSWORD
        })

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertTrue(self.get_user().check_password(self.NEW_PASSWORD))

    def test_change_password_with_wrong_current_password(self):
        self.client.force_login(self.get_user())

        response = self.client.post(f'/api/v1/users/{self.get_user().id}/change-password/', {
            'current_password': 'wrong',
            'new_password': self.NEW_PASSWORD
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertTrue(self.get_user().check_password(self.USER_PASSWORD))

    def test_change_password_for_managed_user(self):
        self.client.force_login(self.get_user())
        pk = self.get_user(RoleName.PUPIL).pk

        response = self.client.post(f'/api/v1/users/{pk}/change-password/', {
            'current_password': self.USER_PASSWORD,
            'new_password': self.NEW_PASSWORD
        })

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertTrue(self.get_user(RoleName.PUPIL).check_password(self.NEW_PASSWORD))

    def test_change_password_for_foreign_user(self):
        self.client.force_login(self.get_user())
        pk = self.get_user(RoleName.PUPIL, school_number=1).pk
        response = self.client.post(f'/api/v1/users/{pk}/change-password/', {
            'current_password': self.USER_PASSWORD,
            'new_password': self.NEW_PASSWORD
        })

        self.assertEqual(HTTPStatus.NOT_FOUND, response.status_code)
        self.assertTrue(self.get_user(RoleName.PUPIL, school_number=1).check_password(self.USER_PASSWORD))

    def test_reset_password_link(self):
        sle = self.get_user(RoleName.SLE_ADMIN, school_number=1)
        response = self.client.post(f'/api/v1/users/reset-password/', {
            'email': sle.email,
        })

        self.assertEqual(HTTPStatus.OK, response.status_code)

    def test_reset_password_wrong_email(self):
        response = self.client.post(f'/api/v1/users/reset-password/', {
            'email': 'not_found@404.com',
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual("There is no user associated with this e-mail address or username",
                         response.json()['message'])

    def test_reset_password_wrong_username(self):
        response = self.client.post(f'/api/v1/users/reset-password/', {
            'email': 'not_found@404.com',
            'username': '404'
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual("There is no user associated with this e-mail address or username",
                         response.json()['message'])

    def test_reset_password_change(self):
        new_password = 'pupilpupil'
        pupil = self.get_user(RoleName.PUPIL, school_number=1)
        token = ResetPasswordToken(
            password_version=int(str(pupil.password_version)),
            user_id=int(str(pupil.id))
        )

        response = self.client.post(f'/api/v1/users/reset-password/confirm/', {
            "confirm_password": new_password,
            "password": new_password,
            "token": token.encode(),
        })

        pupil = self.get_user(RoleName.PUPIL, school_number=1)
        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertTrue(pupil.check_password(new_password))

    def test_reset_password_change_missing_token(self):
        new_password = 'pupilpupil'
        response = self.client.post(f'/api/v1/users/reset-password/confirm/', {
            "confirm_password": new_password,
            "password": new_password,
            "token": "i`m missing",
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertTrue(response.json()['non_field_errors'][0].startswith('Invalid token:'))

    def test_reset_password_change_expired_token(self):
        new_password = 'pupilpupil'
        pupil = self.get_user(RoleName.PUPIL, school_number=1)
        token = ResetPasswordToken(
            password_version=int(str(pupil.password_version)),
            user_id=int(str(pupil.id))
        )
        pupil.password_version += 1
        pupil.save()

        response = self.client.post(f'/api/v1/users/reset-password/confirm/', {
            "confirm_password": new_password,
            "password": new_password,
            "token": token.encode(),
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual('Provided token has expired', response.json()['non_field_errors'][0])

    def test_reset_password_passwords_not_match(self):
        new_password = 'pupilpupil'
        pupil = self.get_user(RoleName.PUPIL, school_number=1)
        token = ResetPasswordToken(
            password_version=int(str(pupil.password_version)),
            user_id=int(str(pupil.id))
        )

        response = self.client.post(f'/api/v1/users/reset-password/confirm/', {
            "confirm_password": new_password + "test",
            "password": new_password,
            "token": token.encode(),
        })

        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
        self.assertEqual('Passwords do not match', response.json()['non_field_errors'][0])
