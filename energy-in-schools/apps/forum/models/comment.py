from django.db import models

from apps.accounts.models import User
from apps.forum.models.topic import Topic
from apps.main.models import BaseModel


class Comment(BaseModel):
    content = models.CharField(max_length=500)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_admin = models.BooleanField(default=False)  # todo: change this to role?
    topic = models.ForeignKey(
        to=Topic,
        on_delete=models.CASCADE,
        null=False,
        related_name='comments'
    )

    STR_ATTRIBUTES = (
        'id',
        'author',
        'topic',
    )
