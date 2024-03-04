import json
from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.forum.models.comment import Comment
from apps.forum.tests.base_test_case import ForumBaseTestCase


class TestComments(ForumBaseTestCase):
    URL = '/api/v1/forum/comments/'
    FORCE_LOGIN_AS = RoleName.TEACHER

    def test_create(self):
        request_data = {
            'content': 'some comment',
            'author': self.teacher.id,
            'topic': self.topic.id,
        }

        with self.subTest('Create'):
            response = self.client.post(self.get_url(), json.dumps(request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.CREATED)

            for key in request_data:
                self.assertEqual(request_data.get(key), response.data.get(key))
            self.assertEqual(response.data['is_admin'], False)

        with self.subTest('Create as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.post(self.get_url(), json.dumps(request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

        with self.subTest('Create as Admin'):
            self.client.force_login(self.admin)
            response = self.client.post(self.get_url(), json.dumps(request_data), content_type='application/json')
            self.assertResponse(response, HTTPStatus.CREATED)

            for key in request_data:
                self.assertEqual(request_data.get(key), response.data.get(key))
            self.assertEqual(response.data['is_admin'], True)

    def test_update(self):
        request_data = {
            'content': 'some updated comment',
        }

        with self.subTest('Update'):
            response = self.client.patch(self.get_url(self.comment.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.OK)
            self.assertEqual(request_data['content'], response.data['content'])

        with self.subTest('Update not own comment'):
            self.client.force_login(self.get_user(RoleName.SLE_ADMIN))
            response = self.client.patch(self.get_url(self.comment.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('Only author can modify comment', response.data['detail'])

        with self.subTest('Update as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.patch(self.get_url(self.comment.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

        with self.subTest('Update post as Admin'):
            self.client.force_login(self.admin)
            response = self.client.patch(self.get_url(self.comment.id), json.dumps(request_data),
                                         content_type='application/json')
            self.assertResponse(response, HTTPStatus.OK)
            self.assertEqual(request_data['content'], response.data['content'])

    def test_delete(self):
        response = self.client.delete(self.get_url(self.comment.id))
        self.assertResponse(response, HTTPStatus.NO_CONTENT)
        self.assertEqual(0, len(Comment.objects.all()))

        with self.subTest('Delete as Pupil'):
            self.client.force_login(self.get_user(RoleName.PUPIL))
            response = self.client.delete(self.get_url(self.comment.id))
            self.assertResponse(response, HTTPStatus.FORBIDDEN)
            self.assertEqual('You do not have permission to perform this action.', response.data['detail'])

