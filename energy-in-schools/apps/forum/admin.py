from django.contrib import admin

from apps.forum.models.comment import Comment
from apps.forum.models.topic import Topic


admin.site.register(Topic, Topic.get_model_admin())
admin.site.register(Comment, Comment.get_model_admin())
