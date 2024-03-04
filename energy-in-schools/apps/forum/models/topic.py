from django.db import models
from enumfields import Enum, EnumField
from taggit.managers import TaggableManager

from apps.accounts.models import User
from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.main.models import BaseModel


class TopicType(Enum):
    FEEDBACK = 'feedback'
    QUESTION = 'question'
    ISSUE = 'issue'


class Topic(BaseModel):
    objects = InLocationQuerySet.as_manager()

    type = EnumField(TopicType, max_length=20)
    content = models.CharField(max_length=500)
    tags = TaggableManager()
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    STR_ATTRIBUTES = (
        'id',
        'type',
    )
