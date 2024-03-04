import logging
from datetime import datetime, timezone
from typing import Any, Union

import funcy
from django.db import models
from django.db.models import F

from apps.main.model_mixins import ReprMixin
from apps.resources.models import Resource
from apps.resources.types import TimeResolution


logger = logging.getLogger(__name__)


class AbstractHistoricalData(ReprMixin, models.Model):
    class Meta:
        abstract = True
        unique_together = ('resource', 'time')

    sa: 'Union[AbstractHistoricalData, Any]'  # SQLAlchemy provided by aldjemy

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=False)
    time = models.DateTimeField(null=False)
    value = models.FloatField(null=False)

    STR_ATTRIBUTES = (
        'resource_id',
        'time',
        'value'
    )

    def save(self, *args, **kwargs):
        self.value = round(self.value, 6)  # TODO: Maybe it can be made in another better place, not before saving to DB
        super(AbstractHistoricalData, self).save(*args, **kwargs)


class DetailedHistoricalData(AbstractHistoricalData):
    class Meta:
        unique_together = ('resource', 'time')
        verbose_name_plural = "Detailed historical data"

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        null=False,
        related_name='detailed_historical_data'
    )

    @classmethod
    @funcy.log_durations(logger.info)
    def remove_old_rows(cls):
        cls.objects.filter(time__lt=datetime.now(timezone.utc) - F('resource__detailed_data_live_time')).delete()


class LongTermHistoricalData(AbstractHistoricalData):
    class Meta:
        unique_together = ('resource', 'time')
        verbose_name_plural = "Long term historical data"

    default_time_resolution = TimeResolution.HALF_HOUR

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        null=False,
        related_name='long_term_historical_data'
    )
