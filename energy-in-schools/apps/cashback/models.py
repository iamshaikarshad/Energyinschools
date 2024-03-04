import logging
from datetime import datetime, timezone, timedelta

from django.conf import settings
from django.db import models, IntegrityError
from django.db.models import Sum
from django.core.validators import MinValueValidator

from apps.cashback.cashback_calculation import calculate_daily_cash_back_for_location
from apps.locations.models import Location
from apps.main.models import BaseModel


logger = logging.getLogger(__name__)


class OffPeakyPoint(BaseModel):
    class Meta:
        unique_together = ('location', 'day')

    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    day = models.DateField()
    value = models.FloatField(blank=True, validators=[MinValueValidator(0.0)])

    @classmethod
    def create_or_update_for_location(cls, location: Location, day: datetime.date, recalculate_value: bool = False):
        off_peaky_value = calculate_daily_cash_back_for_location(location, day)
        off_peaky_model_entry = None
        created = False
        updated = False
        if cls.objects.filter(location=location, day=day).exists():
            if recalculate_value:
                off_peaky_model_entry = cls.objects.get(
                    location=location,
                    day=day)
                off_peaky_model_entry.value = off_peaky_value
                off_peaky_model_entry.save()
                updated = True
            else:
                logger.error(f'Off Peaky Points for school {location.uid} and day {day} already exist')
        else:
            off_peaky_model_entry = cls.objects.create(
                location=location,
                day=day,
                value=off_peaky_value
            )
            created = True
        return off_peaky_model_entry, created, updated

    @classmethod
    def get_cash_back_for_location(
            cls, location: Location, from_: datetime.date = None, to: datetime.date = None) -> float:

        queryset = cls.get_queryset_for_location(location, from_, to)
        cash_back = queryset.aggregate(Sum('value'))['value__sum']
        return cash_back if cash_back else 0.0

    @classmethod
    def get_yesterday_value_for_location(
            cls, location: Location, from_: datetime.date = None, to: datetime.date = None):
        yesterday = datetime.now(tz=timezone.utc).date() - timedelta(days=1)

        try:
            queryset = cls.get_queryset_for_location(location, from_, to)
            return queryset.get(location=location, day=yesterday).value

        except cls.DoesNotExist:
            return None

    @classmethod
    def get_earliest_day_for_location(
            cls, location: Location, from_: datetime.date = None, to: datetime.date = None):
        try:
            queryset = cls.get_queryset_for_location(location, from_, to)
            return queryset.earliest('day').day

        except cls.DoesNotExist:
            return None

    @classmethod
    def get_days_with_positive_value_for_location(
            cls, location: Location, from_: datetime.date = None, to: datetime.date = None) -> int:

        return cls.get_queryset_for_location(location, from_, to).filter(value__gt=0.0).count()

    @classmethod
    def get_queryset_for_location(cls, location: Location, from_: datetime.date = None, to: datetime.date = None):
        from_ = from_ if from_ else settings.OFF_PEAKY_POINTS_START_DATE

        if from_ and to:
            assert from_ <= to

        queryset = cls.objects.filter(location=location)

        if from_:
            queryset = queryset.filter(day__gte=from_)

        if to:
            queryset = queryset.filter(day__lte=to)

        return queryset

    def save(self, *args, **kwargs):
        if self.value is None:
            self.value = calculate_daily_cash_back_for_location(self.location, self.day)
        super().save(**kwargs)
