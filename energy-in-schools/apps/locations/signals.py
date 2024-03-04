from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.locations.models import Location
from apps.mug_service.models import Site


@receiver(post_save, sender=Location, dispatch_uid='create_mug_site')
def create_mug_site(instance: Location, created: bool, **__):
    if not created:
        return

    Site.create_from_location(instance)
