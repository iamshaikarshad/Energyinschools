from django.core.management import BaseCommand

from apps.learning_days.models import LearningDay


class Command(BaseCommand):
    def handle(self, *args, **options):
        LearningDay.create_defaults_for_all_locations()
