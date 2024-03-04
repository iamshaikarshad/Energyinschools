import json
from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.main.base_test_case import BaseTestCase
from apps.themes.models import Theme

class TestThemes(BaseTestCase):
    URL = '/api/v1/themes/'
    NUMBER_OF_THEMES = 3
    KEYS_TO_CHECK = ['id', 'name']

    def setUp(self):
        """Create themes"""

        self.client.force_login(self.es_admin)

        for _ in range(self.NUMBER_OF_THEMES):
            theme = Theme(name="test") # XXX TODO unique
            theme.save()
    

    def test_get_themes(self):
        """Try to get list of themes"""
        response = self.client.get(self.get_url())

        for theme in response.json():
            self.assertEqual(list(theme.keys()), self.KEYS_TO_CHECK)
    
    def test_create_theme(self):
        """Try to create theme"""
        request_body = {'name': 'test theme'}
        response = self.client.post(self.get_url(), request_body)

        self.assertEqual(response.status_code, HTTPStatus.CREATED)
        self.assertEqual(list(response.json().keys()), self.KEYS_TO_CHECK)
    
    def test_get_detail(self):
        """Test get detail"""
        theme = Theme.objects.first()

        response = self.client.get(self.get_url(theme.id))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(list(response.json().keys()), self.KEYS_TO_CHECK)
    
    def test_patch_fact(self):
        """Change text in fact"""
        theme = Theme.objects.first()

        request_body = {
            'name': 'super new name'
        }

        response = self.client.patch(self.get_url(theme.id), json.dumps(request_body), content_type='application/json')

        self.assertEqual(response.json()['name'], request_body['name'])

    def test_bad_permission(self):
        """Try to get as SLE Admin"""
        self.client.force_login(self.sle_admin)

        response = self.client.get(self.get_url())

        self.assertEqual(response.status_code, HTTPStatus.FORBIDDEN)