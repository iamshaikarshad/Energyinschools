import json
from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.addresses.models import Address
from apps.forum.models.topic import Topic, TopicType
from apps.forum.serializers.topic import VALID_TOPIC_TAGS
from apps.forum.tests.base_test_case import ForumBaseTestCase
from apps.locations.models import Location


class TestTopics(ForumBaseTestCase):
    URL = '/api/v1/forum/topics/'
    FORCE_LOGIN_AS = RoleName.TEACHER

    def test_create(self):
        request_data = {
            'content': 'some feedback',
            'type': 'feedback',
            'location': self.location.uid,
            'tags': ["bug"],
        }

        with self.subTest('Create'):
            response = self.client.post(self.get_url(), json.dumps(request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.CREATED)

            for key in request_data:
                self.assertEqual(request_data.get(key), response.data.get(key))

        with self.subTest('Create post as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.patch(self.get_url(), json.dumps(request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

        with self.subTest('Create as Admin'):
            self.client.force_login(self.admin)
            response = self.client.post(self.get_url(), json.dumps(request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.CREATED)

            self.assertEqual(request_data['type'], response.data['type'])
            self.assertEqual(None, response.data['location'])

        with self.subTest('Create with wrong tags'):
            wrond_request_data = {**request_data, 'tags': ['wrong tags']}
            response = self.client.post(self.get_url(), json.dumps(wrond_request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.BAD_REQUEST)
            self.assertEqual(f'Only {VALID_TOPIC_TAGS} tags are allowed', response.data['tags'][0])

    def test_list(self):
        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual(1, len(response.data))

        with self.subTest('View as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.get(self.get_url())
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

    def test_list_only_own(self):
        another_location = Location.objects.create(name='Some location',
                                                   description='Some description',
                                                   address=Address.objects.create(line_1='Some address'))
        Topic.objects.create(type=TopicType.FEEDBACK, content="test", tags=["bug"],
                             location=another_location,
                             author=self.teacher)

        response = self.client.get(self.get_url(query_param=dict(own_location_only=True)))

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(1, len(response.data))

    def test_update(self):
        request_data = {
            'content': 'some updated feedback',
        }

        with self.subTest('Update'):
            response = self.client.patch(self.get_url(self.topic.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.OK)

            self.assertEqual(request_data['content'], response.data['content'])

        with self.subTest('Update not own post'):
            self.client.force_login(self.get_user(RoleName.SLE_ADMIN))
            response = self.client.patch(self.get_url(self.topic.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('Only author can modify topic', response.data['detail'])

        with self.subTest('Update post as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.patch(self.get_url(self.topic.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

        with self.subTest('Update post as Admin'):
            self.client.force_login(self.admin)
            response = self.client.patch(self.get_url(self.topic.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.OK)
            self.assertEqual(request_data['content'], response.data['content'])

    def test_delete(self):
        response = self.client.delete(self.get_url(self.topic.id))
        self.assertResponse(response, HTTPStatus.NO_CONTENT)
        self.assertEqual(0, len(Topic.objects.all()))

        with self.subTest('Delete post as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.delete(self.get_url(self.topic.id))
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

    def test_vote(self):
        response = self.client.post(self.get_url(self.topic.id, 'upvote'))
        self.assertResponse(response, HTTPStatus.OK)
        self.assertEqual(1, response.data['vote_total'])

        response = self.client.post(self.get_url(self.topic.id, 'upvote'))
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)
        self.assertEqual("You have already voted", response.data)
