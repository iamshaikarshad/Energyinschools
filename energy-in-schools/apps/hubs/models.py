from enum import Enum

from django.db.models import CASCADE, CharField, ForeignKey
from enumfields import EnumField
from safedelete.managers import SafeDeleteAllManager, SafeDeleteDeletedManager, SafeDeleteManager

from apps.locations.models import Location
from apps.locations.querysets import InSubLocationSafeDeleteQuerySet
from apps.main.model_mixins import NameAndDescriptionMixin
from apps.main.models import SafeDeleteBaseModel
from utilities.alphanumeric import generate_alphanumeric


class HubType(Enum):
    RASPBERRY = 'raspberry'
    ANDROID = 'android'
    BROWSER = 'browser'


class Hub(NameAndDescriptionMixin, SafeDeleteBaseModel):
    class Meta:
        verbose_name = "Hub"
        verbose_name_plural = "Hubs"

    objects = SafeDeleteManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()
    all_objects = SafeDeleteAllManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()
    deleted_objects = SafeDeleteDeletedManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()

    type = EnumField(HubType, null=False, default=HubType.RASPBERRY)
    sub_location = ForeignKey(Location,
                              on_delete=CASCADE,
                              related_name='hubs')

    uid = CharField(max_length=5,
                    unique=True,
                    blank=False,
                    null=False,
                    db_index=True,
                    default=generate_alphanumeric)

    STR_ATTRIBUTES = (
        'name',
        'uid',
        'type'
    )
