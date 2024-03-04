import secretballot
from django.apps import AppConfig


class ForumConfig(AppConfig):
    name = 'apps.forum'

    def ready(self):
        topic_model = self.get_model("Topic")
        secretballot.enable_voting_on(topic_model)
