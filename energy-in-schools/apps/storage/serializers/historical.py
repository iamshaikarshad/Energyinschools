from datetime import datetime, timezone
from functools import partial
from typing import Any, Dict

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from apps.historical_data.models import DetailedHistoricalData
from apps.historical_data.serializers import HistoricalDataQuerySerializerSet
from apps.hubs.models import Hub
from apps.locations.serializer_fileds import InOwnLocationSlugRelatedField, OwnSubLocationField
from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.microbit_historical_data.serializers import NotEarlierValidator, PastOnlyValidator
from utilities.serializer_helpers import get_serializer_fields, get_serializer_kwargs


class MicrobitHistoricalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailedHistoricalData

        fields = get_serializer_fields(
            DetailedHistoricalData.time,
            DetailedHistoricalData.value,
            add_id=False,
        )

        extra_kwargs = get_serializer_kwargs({
            DetailedHistoricalData.time: dict(
                required=False,
                validators=[NotEarlierValidator, PastOnlyValidator],
                default=partial(datetime.now, tz=timezone.utc)
            )
        })


class MicrobitHistoricalDataSetSerializer(serializers.ModelSerializer):
    # todo: hub_uid -> hub_id
    hub_uid = InOwnLocationSlugRelatedField(
        queryset=Hub.objects.all(),
        slug_field='uid',
        read_only=False,
        source='hub'
    )
    sub_location_id = OwnSubLocationField(
        source='sub_location',
        required=False,
    )
    latest_item = MicrobitHistoricalDataSerializer(source='get_latest_value', read_only=True)

    class Meta:
        model = MicrobitHistoricalDataSet

        fields = get_serializer_fields(
            model.namespace,
            model.name,
            model.type,
            model.unit_label,
            model.updated_at,
            model.sub_location,
            'latest_item',
            'hub_uid',
        )

        validators = [
            UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=get_serializer_fields(
                    model.namespace,
                    model.name,
                    model.type,
                    add_id=False
                )
            )
        ]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if (attrs.get('sub_location') or self.instance and self.instance.sub_location) is None:
            attrs['sub_location_id'] = (attrs.get('hub') or self.instance.hub).sub_location

        return attrs


serializer_set = HistoricalDataQuerySerializerSet('MicrobitHistoricalDataSet')
