from apps.forum.models.comment import Comment
from apps.forum.models.topic import Topic, TopicType
from apps.main.base_test_case import BaseTestCase


class ForumBaseTestCase(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.topic = Topic.objects.create(type=TopicType.FEEDBACK, content="test", tags=["bug"], location=self.location,
                                          author=self.teacher)
        self.comment = Comment.objects.create(topic=self.topic, content="test", author=self.teacher)
