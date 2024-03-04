import io
from unittest import skip

from django.core.files import File
from django.forms.models import model_to_dict
from rest_framework.status import HTTP_403_FORBIDDEN

from django.test.client import Client

from apps.manuals.models import Category, ManualMediaFile, Manual
from apps.main.base_test_case import BaseTestCase
from utilities.private_files_utils import signer
from samsung_school.settings.base import ROOT_URL


class ManualTests(BaseTestCase):
    URL = '/api/v1/manuals/'
    PRIVATE_URL = 'api/v1/private-media/'
    PRIVATE_MEDIA_URL = f'{ROOT_URL}{PRIVATE_URL}'
    IMAGE_CONTENT = b"\x00\x00\x00\x00\x00\x00\x00\x00\x01\x01\x01\x01\x01\x01"
    VIDEO_CONTENT = b"file_content"
    PRIVATE_STORAGE_CLIENT = Client(HTTP_USER_AGENT='Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)AppleWebKit'
                                                    '/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Mobile Safari'
                                                    '/537.36')

    def setUp(self):
        self.category = Category.objects.create(
            title="Category title",
        )

        self.manual = Manual.objects.create(
            title="Post title",
            slug='post-title',
            avatar_image=File(io.BytesIO(self.IMAGE_CONTENT), 'manual_avatar_image.png'),
            avatar_video=File(io.BytesIO(self.VIDEO_CONTENT), 'manual_avatar_video.mp4'),
            body="xhtmjt\r\n\r\n",
            category=self.category
        )

        self.media_file = ManualMediaFile.objects.create(
            media_file=File(io.BytesIO(self.IMAGE_CONTENT), 'manual_media_file.png'),
            manual=self.manual,
            type='image',
        )

    def test_get_manuals(self):
        manuals = Manual.objects.all()
        media_files_with_current_manual_id = ManualMediaFile.objects.filter(manual_id=self.manual.id)
        manual_response = self.client.get(self.get_url())
        self.assertResponse(manual_response)

        response_content_list = manual_response.json()
        response_content = response_content_list[0]

        response_content_attachments = response_content.get('attachments')
        attachment_url = response_content_attachments[0]['url']
        attachment_file_name = response_content_attachments[0]['file_name']

        correct_attachment_file_name = self.media_file.media_file.name.split('/')[-1]

        self.assertEqual(len(response_content_list), len(manuals))
        self.assertEqual(response_content.get('title'), self.manual.title)
        self.assertEqual(response_content.get('body'), self.manual.body)
        self.assertEqual(response_content.get('category_title'), self.category.title)

        self.assertEqual(len(response_content_attachments), len(media_files_with_current_manual_id))
        self.assertEqual(attachment_file_name, correct_attachment_file_name)

        # XXX TODO Implement correct tests for local behaviour
        # with self.subTest('Avatar image request'):
        #     avatar_image_response = self.PRIVATE_STORAGE_CLIENT.get(response_content.get('avatar_image'))
        #     self.assertResponse(avatar_image_response)
        #     self.assertEqual(self.IMAGE_CONTENT, avatar_image_response.getvalue())
        #
        # with self.subTest('Avatar video request'):
        #     avatar_video_response = self.PRIVATE_STORAGE_CLIENT.get(response_content.get('avatar_video'))
        #     self.assertResponse(avatar_video_response)
        #     self.assertEqual(self.VIDEO_CONTENT, avatar_video_response.getvalue())
        #
        # with self.subTest('Attachments url request'):
        #     attachment_response = self.PRIVATE_STORAGE_CLIENT.get(attachment_url)
        #     self.assertResponse(attachment_response)

    @skip("Manuals media is public now")
    def test_get_private_media_file_with_signature(self):
        media_file = ManualMediaFile.objects.get()
        media_file_name = media_file.media_file
        signature = signer.sign("signature=")
        private_private_media_file_url_with_valid_signature = f'{self.PRIVATE_MEDIA_URL}{media_file_name}?{signature}'
        media_file_response = self.PRIVATE_STORAGE_CLIENT.get(private_private_media_file_url_with_valid_signature)

        self.assertResponse(media_file_response)
        self.assertEqual(self.IMAGE_CONTENT, media_file_response.getvalue())

    def test_get_private_media_file_without_signature(self):
        media_file = ManualMediaFile.objects.get()
        media_file_name = media_file.media_file
        private_private_media_file_url_with_valid_signature = f'{self.PRIVATE_MEDIA_URL}{media_file_name}'
        media_file_response = self.PRIVATE_STORAGE_CLIENT.get(private_private_media_file_url_with_valid_signature)

        self.assertEqual(media_file_response.status_code, HTTP_403_FORBIDDEN)

    def test_get_categories(self):
        categories = Category.objects.all()
        response = self.client.get(self.get_url('categories'))

        self.assertResponse(response)
        data = response.json()
        self.assertEqual(len(data), len(categories))
        self.assertEqual(self.category.title, data[0]['title'])
        self.assertEqual(len(self.category.manuals.all()), len(data[0]['manuals']))

    def test_manual_should_be_accessible_by_slug_field(self):
        manual = Manual.objects.first()
        manual_response = self.client.get(self.get_url(manual.slug))
        self.assertResponse(manual_response)
        response_json = manual_response.json()
        self.assertEqual(manual.id, response_json['id'])
