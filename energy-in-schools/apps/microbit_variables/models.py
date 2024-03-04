from django.db.models import CASCADE, CharField, ForeignKey
from enumfields import Enum, EnumField

from apps.hubs.models import Hub
from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.main.models import BaseModel


class ShareType(Enum):
    NOBODY = ''
    MY_SCHOOL = 'SCHOOL'
    ALL_SCHOOLS = 'ALL'


class MicrobitVariable(BaseModel):
    class Meta:
        verbose_name = "Variable"
        verbose_name_plural = "Variables"

        unique_together = ("key", "location")

    ShareType = ShareType
    objects = InLocationQuerySet.as_manager()

    key = CharField(max_length=100, blank=False)
    location = ForeignKey(Location, on_delete=CASCADE, related_name='variables')
    # TODO: rename to hub
    raspberry = ForeignKey(Hub, on_delete=CASCADE, related_name='variables')
    value = CharField(max_length=15, blank=False, null=False)
    shared_with = EnumField(ShareType, blank=True, null=False, default=ShareType.NOBODY)

    STR_ATTRIBUTES = (
        'raspberry__uid',
        'key',
        'value'
    )
