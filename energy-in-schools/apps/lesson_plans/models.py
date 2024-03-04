from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from tinymce.models import HTMLField

from apps.main.models import BaseModel
from utilities.private_files_utils import get_file_path_maker


lesson_plan_file_path = get_file_path_maker(settings.LESSON_PLANS_STORAGE_FOLDER, 'lesson_plan_file_path', __name__)
lesson_avatar_file_path = get_file_path_maker(settings.LESSON_AVATARS_FOLDER, 'lesson_avatar_file_path', __name__)
lesson_group_avatar_file_path = get_file_path_maker(settings.LESSON_GROUP_AVATARS_FOLDER, 'lesson_group_avatar_file_path', __name__)
lesson_group_materials_file_path = get_file_path_maker(settings.LESSON_GROUP_MATERIALS_FOLDER, 'lesson_group_materials_file_path', __name__)


class LessonGroup(BaseModel):
    title = models.CharField(max_length=100)
    overview = models.CharField(max_length=512)
    group_avatar = models.CharField(max_length=512, blank=True, null=True)
    materials = models.CharField(max_length=512, blank=True, null=True)
    type = models.CharField(max_length=50, null=True)

    STR_ATTRIBUTES = (
        'title',
        'group_avatar',
        'materials',
        'type',
    )


class LessonPlan(BaseModel):
    session_number = models.PositiveIntegerField(null=False, validators=[MinValueValidator(1)])
    title = models.CharField(max_length=512)
    content = HTMLField(blank=True, null=True)
    plan_material = models.CharField(max_length=512, blank=True, null=True)
    duration = models.CharField(max_length=32, blank=True, null=True)
    overview = HTMLField(blank=True, null=True)
    key_information = HTMLField(blank=True, null=True)
    lesson_topics = models.CharField(max_length=512, blank=True, null=True)
    lesson_avatar = models.CharField(max_length=512, blank=True, null=True)
    lesson_group = models.ForeignKey(LessonGroup, on_delete=models.SET_NULL, blank=True, null=True)
    description = models.CharField(max_length=512, null=True, blank=True)
    lesson_label = models.CharField(max_length=64, null=True, blank=True)

    STR_ATTRIBUTES = (
        'lesson_group',
        'title',
        'session_number',
        'plan_material',
        'lesson_avatar',
    )

    class Meta:
        unique_together = ('session_number', 'lesson_group')


class LessonPlanNew(BaseModel):
    title = models.CharField(max_length=512)
    plan_material = models.CharField(max_length=512, blank=True, null=True)
    lesson_group = models.ForeignKey(LessonGroup, on_delete=models.SET_NULL, blank=True, null=True, related_name="lesson_plans")
    description = models.CharField(max_length=512, null=True, blank=True)

    class Meta:
        ordering = ['title']

    STR_ATTRIBUTES = (
        'lesson_group',
        'title',
        'plan_material',
    )


class LessonObjective(BaseModel):
    description = models.CharField(max_length=512)
    lesson_plan = models.ForeignKey(LessonPlan, on_delete=models.CASCADE, blank=False, null=False, related_name='lesson_objectives')

    class Meta:
        ordering = ['id']

    STR_ATTRIBUTES = (
        'description',
        'lesson_plan__title'
    )


class SuccessCriteria(BaseModel):
    description = models.CharField(max_length=512)
    lesson_plan = models.ForeignKey(LessonPlan, on_delete=models.CASCADE, blank=False, null=False, related_name='success_criteria')

    class Meta:
        ordering = ['id']

    STR_ATTRIBUTES = (
        'description',
        'lesson_plan__title'
    )
