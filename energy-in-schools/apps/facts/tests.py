import json
from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.facts.models import Fact
from apps.main.base_test_case import BaseTestCase
from apps.themes.models import Theme


class TestFacts(BaseTestCase):
    URL = '/api/v1/facts/'
    NUMBER_OF_FACTS = 3
    KEYS_TO_CHECK = ['id', 'text', 'location', 'theme']

    def setUp(self):
        """Create facts and themes"""

        for _ in range(self.NUMBER_OF_FACTS):
            theme = Theme(name="test")
            theme.save()
            Fact.objects.create(
                theme=theme,
                location=self.es_admin.location,
                text="test fact"
            )

        Fact.objects.create(location=self.es_admin.location, text="fact without theme")

    def test_get_facts(self):
        """Try to get listing of facts"""
        self.client.force_login(self.es_admin)

        response = self.client.get(self.get_url())

        for fact in response.json():
            self.assertEqual(list(fact.keys()), self.KEYS_TO_CHECK)

    def test_get_facts_per_school(self):
        """Filter by school"""
        self.client.force_login(self.es_admin)

        response = self.client.get(self.get_url(query_param=dict(schoold_id=self.es_admin.location)))

        for fact in response.json():
            self.assertEqual(list(fact.keys()), self.KEYS_TO_CHECK)

    def test_create_fact(self):
        """Create fact from JSON"""
        self.client.force_login(self.es_admin)

        theme = Theme.objects.first()

        request_body = {
            'school_id': self.es_admin.location.id,
            'text': 'test text',
            'theme': theme.id
        }

        response = self.client.post(self.get_url(), request_body)

        self.assertEqual(response.status_code, HTTPStatus.CREATED)
        self.assertEqual(list(response.json().keys()), self.KEYS_TO_CHECK)

    def test_get_detail(self):
        """Test get detail"""
        fact = Fact.objects.first()

        self.client.force_login(self.get_user(RoleName.ES_USER))

        response = self.client.get(self.get_url(fact.id))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(list(response.json().keys()), self.KEYS_TO_CHECK)

    def test_patch_fact(self):
        self.client.force_login(self.es_admin)

        """Change text in fact"""
        fact = Fact.objects.first()

        request_body = {
            'text': 'super new text'
        }

        response = self.client.patch(self.get_url(fact.id), json.dumps(request_body), content_type='application/json')

        self.assertEqual(response.json()['text'], request_body['text'])

    def test_bad_permission(self):
        """Try to get as SLE Admin"""
        self.client.force_login(self.sle_admin)

        fact = Fact.objects.first()

        request_body = {
            'text': 'super new text'
        }

        response = self.client.patch(self.get_url(fact.id), json.dumps(request_body), content_type='application/json')

        self.assertEqual(response.status_code, HTTPStatus.FORBIDDEN)
