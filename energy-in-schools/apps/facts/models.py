from django.db import models

from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.main.models import BaseModel
from apps.themes.models import Theme


class Fact(BaseModel):
    """Fact model for saving facts that will be displaying at screen in fun facts section"""

    objects = InLocationQuerySet.as_manager()

    theme = models.ForeignKey(Theme, null=True, blank=False, on_delete=models.SET_NULL)
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)
    text = models.TextField(max_length=500, null=False, blank=False)

    # XXX TODO Here should be imageURL and threshold facts extra fields

    STR_ATTRIBUTES = (
        'theme__name',
        'text'
    )

