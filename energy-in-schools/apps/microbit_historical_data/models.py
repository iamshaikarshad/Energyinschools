from django.db import models

from apps.hubs.models import Hub
from apps.resources.models import Resource
from apps.resources.types import DataCollectionMethod, ResourceChildType, TimeResolution, Unit


class MicrobitHistoricalDataSet(Resource):
    resource_ptr = models.OneToOneField(
        to=Resource,
        parent_link=True,
        related_name=ResourceChildType.MICROBIT_HISTORICAL_DATA_SET.value,
        on_delete=models.CASCADE
    )

    namespace = models.CharField(max_length=100, db_index=True)
    type = models.IntegerField(db_index=True)
    unit_label = models.CharField(max_length=20)

    hub = models.ForeignKey(Hub, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.child_type = ResourceChildType.MICROBIT_HISTORICAL_DATA_SET

        self.supported_data_collection_methods = [DataCollectionMethod.PUSH]
        self.preferred_data_collection_method = DataCollectionMethod.PUSH

        self.detailed_time_resolution = TimeResolution.SECOND
        self.long_term_time_resolution = TimeResolution.HALF_HOUR
        self.detailed_data_live_time = None

        self.unit = Unit.UNKNOWN

        try:
            unit = Unit(self.unit_label)

            if unit.is_base_unit:
                self.unit = unit

        except ValueError:
            pass

        super().save(*args, **kwargs)
