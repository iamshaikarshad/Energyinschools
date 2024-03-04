from enum import Enum

from django.conf import settings
from django.db import models
from enumfields import EnumField
from martor.models import MartorField

from apps.main.models import BaseModel
from utilities.private_files_utils import get_file_path_maker

manuals_file_path = get_file_path_maker(settings.MANUALS_STORAGE_FOLDER, 'manuals_file_path', __name__)
manuals_avatars_file_path = get_file_path_maker(settings.MANUALS_AVATARS_STORAGE_FOLDER, 'manuals_avatars_file_path',
                                                __name__)


class Category(BaseModel):
    class Meta:
        verbose_name_plural = "categories"
        ordering = ('priority',)

    title = models.CharField(max_length=150, unique=True, null=False, blank=False)
    priority = models.IntegerField(default=0, null=False, blank=False)

    STR_ATTRIBUTES = (
        'title',
        'priority',
    )


class Manual(BaseModel):
    class Meta:
        ordering = ('category', 'priority', 'created_at')

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=150, null=False, blank=False)
    avatar_image = models.CharField(max_length=512, blank=True, null=True)
    avatar_video = models.CharField(max_length=512, blank=True, null=True)
    body = MartorField()
    priority = models.IntegerField(default=0, null=False, blank=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='manuals')

    STR_ATTRIBUTES = (
        'title',
        'priority',
        'category',
        'avatar_image',
        'avatar_video',
    )


class MediaFileType(Enum):
    IMAGE = 'image'
    VIDEO = 'video'
    PRESENTATION = 'presentation'
    OTHER = 'other'


class ManualMediaFile(BaseModel):
    media_file = models.CharField(max_length=512, blank=True, null=True)
    manual = models.ForeignKey(Manual, on_delete=models.CASCADE, related_name='attachments')
    type = EnumField(MediaFileType, null=False, default=MediaFileType.OTHER, max_length=12)
