from datetime import datetime, timezone
from functools import partial

from django.core.validators import BaseValidator, MinValueValidator
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy
from rest_framework import serializers

from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from utilities.serializer_helpers import get_serializer_fields


@deconstructible
class NotEarlierValidator(MinValueValidator):
    message = gettext_lazy('Ensure this value is not earlier than at %(limit_value)s.')
    code = 'min_timedelta'

    def compare(self, value, max_timedelta):
        return datetime.now(tz=timezone.utc) - value > max_timedelta


@deconstructible
class PastOnlyValidator(BaseValidator):
    message = gettext_lazy('Ensure the time is not in future.')
    code = 'past_time'

    def __init__(self, message=None):
        limit_value = None
        super().__init__(limit_value, message)

    def compare(self, value, max_timedelta):
        return datetime.now(tz=timezone.utc) < value


class MicrobitHistoricalDataAddDataSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(
        required=False,
        validators=[NotEarlierValidator, PastOnlyValidator],
        default=partial(datetime.now, tz=timezone.utc),
    )
    value = serializers.FloatField(required=True)
    unit = serializers.CharField(max_length=20)

    class Meta:
        model = MicrobitHistoricalDataSet
        fields = get_serializer_fields(
            MicrobitHistoricalDataSet.namespace,
            MicrobitHistoricalDataSet.name,
            MicrobitHistoricalDataSet.type,
            MicrobitHistoricalDataSet.unit,
            'time',
            'value',
            add_id=False
        )
