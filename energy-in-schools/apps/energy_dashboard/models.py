from django.db import models
from enumfields import Enum, EnumField

from apps.main.models import BaseModel
from apps.locations.models import Location

DEFAULT_DASHBOARD_SCREEN_NAMES = [
    'Off-peak points',
    'Carbon',
    'Electricity usage',
    'Gas usage',
    'Facts',
]


class DashboardScreen(BaseModel):
    name = models.CharField(max_length=500, null=False, blank=False, unique=True)

    STR_ATTRIBUTES = (
        'name',
    )

    def delete(self, using=None, keep_parents=False):
        if self.name in DEFAULT_DASHBOARD_SCREEN_NAMES:
            return
        super().delete(using, keep_parents)


class DashboardMessage(BaseModel):
    text = models.TextField(max_length=1000, null=False, blank=False)
    screen = models.ForeignKey(DashboardScreen, null=True, blank=False, on_delete=models.SET_NULL,
                               related_name='messages')

    STR_ATTRIBUTES = (
        'text',
        'screen'
    )


class DashboardType(Enum):
    DASHBOARD_V0 = 'energy_dashboard_v0'
    DASHBOARD_V1 = 'energy_dashboard_v1'
    DASHBOARD_V1_LEGACY = 'energy_dashboard_legacy_v1'
    DASHBOARD_V2 = 'energy_dashboard_v2'
    DASHBOARD_V2_LEGACY = 'energy_dashboard_legacy_v2'
    DASHBOARD_V3 = 'energy_dashboard_v3'
    DASHBOARD_V3_LEGACY = 'energy_dashboard_legacy_v3'


class DashboardPing(BaseModel):
    class Meta:
        unique_together = ('type', 'location')

    Type = DashboardType

    type = EnumField(Type, max_length=40)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    last_ping = models.DateTimeField()

    @classmethod
    def get_dashboard_pings_in_location(cls, location: Location) -> 'QuerySet':
        return cls.objects.filter(location=location).order_by('type')


class Tip(BaseModel):
    text = models.TextField(max_length=500, null=False, blank=False)
    school_name = models.TextField(max_length=500, null=False, blank=False)
    city = models.TextField(max_length=500, null=True, blank=True)
