from rest_framework import serializers
from rest_framework.response import Response

from apps.notifications.models.daily_report_subscription import DailyReportSubscription
from utilities.serializer_helpers import get_serializer_fields


class DailyReportSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReportSubscription

        fields = get_serializer_fields(
            DailyReportSubscription.email,
            DailyReportSubscription.is_subscribed,
        )


class DailyReportUnsubscribeEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email):
        ref = DailyReportSubscription.objects.filter(email=email).first()
        if not ref:
            raise serializers.ValidationError('Email not found')

        return email
