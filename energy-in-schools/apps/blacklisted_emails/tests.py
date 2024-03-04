from http import HTTPStatus

from apps.blacklisted_emails.models import BlacklistedEmail
from apps.blacklisted_emails.tools import AddEmailToBlackListToken
from apps.main.base_test_case import BaseTestCase


class TestBlacklistedEmail(BaseTestCase):
    def test_create(self):
        response = self.client.post('/api/v1/blacklisted-emails/', {
            'token': AddEmailToBlackListToken(email='example@example.example').encode()
        })
        self.assertEqual(HTTPStatus.CREATED, response.status_code)
        self.assertEqual(BlacklistedEmail.objects.get().email, 'example@example.example')

    def test_create_duplicate(self):
        response = self.client.post('/api/v1/blacklisted-emails/', {
            'token': AddEmailToBlackListToken(email='example@example.example').encode()
        })
        self.assertEqual(HTTPStatus.CREATED, response.status_code)

        response = self.client.post('/api/v1/blacklisted-emails/', {
            'token': AddEmailToBlackListToken(email='example@example.example').encode()
        })
        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)

    def test_create_with_wrong_token(self):

        token = AddEmailToBlackListToken(email='example@example.example').encode()[:5] + 'wrong'
        token += "=" * ((4 - len(token) % 4) % 4) # You can't just add wrong to token !

        response = self.client.post('/api/v1/blacklisted-emails/', {
            'token': token
        })
        self.assertEqual(HTTPStatus.BAD_REQUEST, response.status_code)
