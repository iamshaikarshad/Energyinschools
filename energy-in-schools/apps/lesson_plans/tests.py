import io

from django.test.client import Client
from django.core.files import File
from django.db.utils import IntegrityError
from django.db import transaction

from utilities.private_files_utils import signer
from apps.lesson_plans.models import LessonPlan, LessonGroup, LessonObjective, SuccessCriteria
from apps.main.base_test_case import BaseTestCase
from samsung_school.settings.base import ROOT_URL


class LessonPlanTests(BaseTestCase):
    URL = '/api/v1/lessons/'
    PRIVATE_URL = 'api/v1/private-media/'
    IMAGE_CONTENT = b"\x00\x00\x00\x00\x00\x00\x00\x00\x01\x01\x01\x01\x01\x01"
    PRIVATE_MEDIA_URL = f'{ROOT_URL}{PRIVATE_URL}'
    PRIVATE_STORAGE_CLIENT = Client(HTTP_USER_AGENT='Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)AppleWebKit'
                                                    '/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Mobile Safari'
                                                    '/537.36')

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.lesson_group = cls.create_lesson_group()
        cls.lesson_plan = cls.create_lesson(1, cls.lesson_group)
        cls.create_lesson_objectives()
        cls.create_success_criteria()

    def test_listing_lessons(self):
        response = self.client.get(self.get_url('lesson-plans'))
        self.assertResponse(response)
        self.assertEqual(len(response.json()), LessonPlan.objects.count())

        self.create_lesson_group()
        self.create_lesson(2, self.lesson_group)

        for lesson_group in LessonGroup.objects.all():
            with self.subTest('Get lessons list per group'):
                response = self.client.get(self.get_url('lesson-plans', query_param={'lesson_group': lesson_group.id}))
                self.assertResponse(response)
                self.assertEqual(len(response.json()), LessonPlan.objects.filter(lesson_group=lesson_group).count())

    def test_listing_lesson_groups(self):
        response = self.client.get(self.get_url('lesson-groups'))
        self.assertResponse(response)
        self.assertEqual(len(response.json()), LessonGroup.objects.count())

    def test_get_private_lesson_material(self):
        lesson = LessonPlan.objects.get()
        lesson_material_title = lesson.plan_material
        signature = signer.sign("signature=")
        private_private_media_file_url_with_valid_signature = f'{self.PRIVATE_MEDIA_URL}{lesson_material_title}?{signature}'
        response = self.PRIVATE_STORAGE_CLIENT.get(private_private_media_file_url_with_valid_signature)
        self.assertResponse(response)
        self.assertEqual(self.IMAGE_CONTENT, response.getvalue())

    def test_get_lesson_group_materials(self):
        lesson_group = LessonGroup.objects.get()
        lesson_material_title = lesson_group.materials
        signature = signer.sign("signature=")
        private_media_file_url_with_valid_signature = f'{self.PRIVATE_MEDIA_URL}{lesson_material_title}?{signature}'
        response = self.PRIVATE_STORAGE_CLIENT.get(private_media_file_url_with_valid_signature)
        self.assertResponse(response)
        self.assertEqual(self.IMAGE_CONTENT, response.getvalue())

    def test_create_same_session_lesson(self):
        lesson_quantity = LessonPlan.objects.filter(lesson_group__id=1).count()
        try:
            with transaction.atomic():
                self.create_lesson(1, self.lesson_group)
        except IntegrityError:
            pass
        self.assertEqual(LessonPlan.objects.filter(lesson_group__id=1).count(), lesson_quantity)

    @classmethod
    def create_lesson_group(cls):
        return LessonGroup.objects.create(
            title="Test lesson group",
            overview="Test lesson overview",
            materials=File(io.BytesIO(cls.IMAGE_CONTENT), 'lesson_group_materials.zip')
        )

    @classmethod
    def create_lesson_objectives(cls):
        return LessonObjective.objects.create(
            description='lesson objective description',
            lesson_plan=cls.lesson_plan
        )

    @classmethod
    def create_success_criteria(cls):
        return SuccessCriteria.objects.create(
            description='lesson success criteria',
            lesson_plan=cls.lesson_plan
        )

    @classmethod
    def create_lesson(cls, session_number, lesson_group, include_plan_material=True):
        return LessonPlan.objects.create(
            plan_material=File(io.BytesIO(cls.IMAGE_CONTENT), 'lesson_plan.zip') if include_plan_material else '',
            session_number=session_number,
            title='Test lesson',
            content='<p>some HTML content</p>',
            lesson_group=lesson_group,
            duration='55 minutes',
            overview='lesson\'s overview',
            key_information='lesson\'s key information',
            lesson_topics='lesson\'s topics',
            description='lesson plan description',
            lesson_label='lesson'
        )
