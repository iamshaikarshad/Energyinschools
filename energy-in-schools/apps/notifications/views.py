import logging
from http import HTTPStatus

from django.db.models import F
from django.contrib.auth.models import AnonymousUser
from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet, ModelViewSet

from apps.locations.decorators import own_location_only
from apps.locations.serializers import LocationIdRequiredQueryParamSerializer
from apps.notifications.models import NotificationTarget, NotificationTrigger
from apps.notifications.models.notification_logs import NotificationEventLog, UserNotificationEventLog
from apps.notifications.models.daily_report_subscription import DailyReportSubscription
from apps.notifications.types import NotificationStatus, SUBSCRIPTION_RESPONSE_MESSAGE
from apps.notifications.serializers.notification_target import NotificationTargetSerializer
from apps.notifications.serializers.notification_trigger import NotificationTriggerSerializer
from apps.notifications.serializers.notifications_logs import (
    NotificationEventLogSerializer, AbnormalValueEventLogSerializer
)
from apps.notifications.serializers.daily_report import (
    DailyReportSubscriptionSerializer, DailyReportUnsubscribeEmailSerializer
)


logger = logging.getLogger(__name__)


class NotificationTriggerViewSet(ModelViewSet):
    serializer_class = NotificationTriggerSerializer

    @own_location_only
    def get_queryset(self):
        return NotificationTrigger.objects.all()


class NotificationTargetViewSet(ModelViewSet):
    serializer_class = NotificationTargetSerializer

    def get_queryset(self):
        if isinstance(self.request.user, AnonymousUser):
            return NotificationTrigger.objects.none()

        return NotificationTarget.objects.filter(trigger__location=self.request.user.location).all()


class NotificationEventLogViewSet(mixins.ListModelMixin,
                                  GenericViewSet):
    serializer_class = NotificationEventLogSerializer

    @own_location_only
    def get_queryset(self):
        return NotificationEventLog.objects.order_by('event_time').reverse().all()

    def remove_all(self, *_, **__):
        NotificationEventLog.objects.in_location(self.request.user.location).delete()
        return Response(status=HTTPStatus.NO_CONTENT)


class AbnormalValueNotificationPagination(PageNumberPagination):
    page_size = 10

    def get_locations_with_active_notifications(self):
        return list(UserNotificationEventLog.objects \
            .filter(status=NotificationStatus.ACTIVE) \
            .values('location_id', location_name=F('location__name')) \
            .distinct())

    def get_paginated_response(self, data):
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'results': data,
            'locations': self.get_locations_with_active_notifications(),
        })


class AbnormalValueNotificationViewSet(ModelViewSet):
    serializer_class = AbnormalValueEventLogSerializer
    pagination_class = AbnormalValueNotificationPagination
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return UserNotificationEventLog.objects.filter(status=NotificationStatus.ACTIVE).order_by('-event_time')

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase},
                         operation_description='Returns total count of active (unresolved) notifications')
    @action(methods=['get'], detail=False, url_path='total')
    def get_total(self, request):
        total: int = self.get_queryset().count()
        return Response({ 'total': total })

    @swagger_auto_schema(method='post',
                         request_body=LocationIdRequiredQueryParamSerializer,
                         responses={HTTPStatus.OK.value: HTTPStatus.OK.phrase,
                                    HTTPStatus.BAD_REQUEST.value: HTTPStatus.BAD_REQUEST.phrase})
    @action(methods=['post'], detail=False, url_path='resolve-notifications-in-location')
    def resolve_notifications_in_location(self, request):

        serializer = LocationIdRequiredQueryParamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        location_id = serializer.validated_data['location_id']
        notifications_query = UserNotificationEventLog.objects \
                                .filter(location__id=location_id, status=NotificationStatus.ACTIVE)

        if not notifications_query.exists():
            return Response('Active notifications not found for selected school', status=HTTPStatus.NOT_FOUND)

        else:
            notifications_query.update(status=NotificationStatus.RESOLVED)
            return Response('Notifications resolved successfully')


class DailyReportSubscriptionViewSet(ModelViewSet):
    serializer_class = DailyReportSubscriptionSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        return DailyReportSubscription.objects.all().order_by('-is_subscribed')

    def create(self, request, *args, **kwargs):

        serializer = DailyReportSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        obj, created = DailyReportSubscription.objects.update_or_create(
            email=email, defaults={'is_subscribed': True}
        )

        if created:
            return Response(SUBSCRIPTION_RESPONSE_MESSAGE.format(email, 'subscribed'), HTTPStatus.CREATED)
        else:
            return Response(SUBSCRIPTION_RESPONSE_MESSAGE.format(email, 'subscribed'))

    @action(methods=['post'], detail=False, url_path='unsubscribe-email')
    def unsubscribe_email(self, request):

        serializer = DailyReportUnsubscribeEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        DailyReportSubscription.unsubscribe_email(email)

        return Response(SUBSCRIPTION_RESPONSE_MESSAGE.format(email, 'unsubscribed'))
