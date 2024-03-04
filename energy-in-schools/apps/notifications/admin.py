from django.contrib import admin, messages
from django.urls import path
from django.http import HttpResponseRedirect

from apps.notifications.models.notification_logs import NotificationEventLog, UserNotificationEventLog
from apps.notifications.models.notification_target import EmailNotification
from apps.notifications.models.notification_triggers import (
    NotificationTrigger, DailyUsageTrigger,
    ValueLevelTrigger, AbnormalValueTrigger
)
from apps.notifications.models.daily_report_subscription import DailyReportSubscription
from apps.notifications.types import NotificationsType


class AbnormalValueNotificationsAdmin(admin.ModelAdmin):
    list_display = ('pk', 'location', 'event_time', 'trigger_data', 'status')
    change_list_template = 'abnormal_value_notifications_changelist.html'

    def get_urls(self):
        return [path('resolve-notifications/', self.resolve_all_active_notifications)] + super().get_urls()

    def resolve_all_active_notifications(self, request):
        UserNotificationEventLog.resolve_notifications(NotificationsType.ACTIVE)
        messages.add_message(request,
                             messages.SUCCESS,
                             'All active notifications resolved successfully!')
        return HttpResponseRedirect('../')


admin.site.register(ValueLevelTrigger, ValueLevelTrigger.get_model_admin())
admin.site.register(AbnormalValueTrigger, AbnormalValueTrigger.get_model_admin())
admin.site.register(NotificationTrigger, NotificationTrigger.get_model_admin())
admin.site.register(DailyUsageTrigger, DailyUsageTrigger.get_model_admin())
admin.site.register(EmailNotification, EmailNotification.get_model_admin())
admin.site.register(NotificationEventLog, NotificationEventLog.get_model_admin())
admin.site.register(UserNotificationEventLog, AbnormalValueNotificationsAdmin)
admin.site.register(DailyReportSubscription, DailyReportSubscription.get_model_admin())
