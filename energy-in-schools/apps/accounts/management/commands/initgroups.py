from django.core.management import BaseCommand

from apps.accounts.management import init_groups


class Command(BaseCommand):
    def handle(self, *args, **options):
        init_groups()
