from rest_framework import serializers

from apps.learning_days.models import LearningDay
from utilities.serializer_helpers import get_serializer_fields


class LearningDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningDay
        fields = get_serializer_fields(
            LearningDay.date
        )
