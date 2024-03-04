from datetime import datetime
from typing import Dict, Tuple, List 

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template

from apps.energy_providers.models import Provider
from apps.energy_meters.models import EnergyMeter
from apps.locations.models import Location
from apps.notifications.models.daily_report_subscription import DailyReportSubscription
from apps.schools_metrics.serializers import SchoolsMetricsSerializer
from apps.smart_things_apps.models import SmartThingsApp
from apps.smart_things_apps.types import SmartAppConnectivityStatus
from apps.smart_things_devices.types import DeviceStatus
from apps.smart_things_devices.models import SmartThingsDevice
from apps.smart_things_sensors.models import SmartThingsEnergyMeter


class SchoolsStatusDailyReport:
    @staticmethod
    def get_smart_apps_data() -> Dict[str, List]:
        """ Since SmartThingsApp model doesn't have status field and 
            doesn't store it on DB, we need to check status manually
        """
        location_queryset = Location.objects.filter(parent_location__isnull=True, is_test=False)
        data_template = {status.value: [] for status in SmartAppConnectivityStatus}

        for location in location_queryset:
            smart_app: SmartThingsApp = location.smart_things_apps.first()
            if smart_app:
                smart_app_status: SmartAppConnectivityStatus = smart_app.get_refresh_token_status()
                data_template[smart_app_status.value].append(smart_app.location.name)
            else:
                data_template[SmartAppConnectivityStatus.NO_SMART_APP.value].append(location.name)

        return data_template

    @staticmethod
    def get_energy_meters_data() -> Dict[str, Dict]:
        location_queryset = Location.objects.filter(is_test=False)
        energy_meters_data = {location.name: SchoolsMetricsSerializer.get_energy_meters(location)
                              for location in location_queryset}

        return energy_meters_data

    @staticmethod
    def get_data_flow() -> Tuple[Tuple[str], Dict[str, Dict]]:
        location_queryset = Location.objects.filter(is_test=False)
        data_flow = {location.name: SchoolsMetricsSerializer.get_consumption(location)
                     for location in location_queryset}

        return ('', 'Electricity', 'Gas', 'Smart Plug', 'Unknown'), data_flow

    @staticmethod
    def get_battery_health_data() -> Tuple[Tuple[str], List]:
        keys = ('', 'Device ID', 'Device', 'Battery health, %')
        battery_health_data = list(SmartThingsDevice.objects.filter(battery_health__lte=10) \
                                                            .order_by('sub_location') \
                                                            .values_list('sub_location__name',
                                                                         'id',
                                                                         'label',
                                                                         'battery_health'))
        return keys, battery_health_data

    @classmethod
    def send_report(cls) -> None:
        smart_apps = SchoolsStatusDailyReport.get_smart_apps_data()
        energy_meters = SchoolsStatusDailyReport.get_energy_meters_data()
        data_flow = SchoolsStatusDailyReport.get_data_flow()
        battery_health = SchoolsStatusDailyReport.get_battery_health_data()
        env = settings.CONFIGURATION_NAME.name
        time: datetime = datetime.today().date().strftime('%d, %b %Y')
        email_title = settings.DAILY_REPORT_EMAIL_TITLE.format(time, env)
        email_subject = settings.DAILY_REPORT_EMAIL_SUBJECT.format(env)

        html_content = get_template('daily_report/daily_report_email_template.html').render({
            'email_title': email_title,
            'smart_apps': {
                'data': smart_apps,
            },
            'energy_meters': {
                'data': energy_meters,
            },
            'data_flow': {
                'keys': data_flow[0],
                'data': data_flow[1],
            },
            'battery_health': {
                'keys': battery_health[0],
                'data': battery_health[1],
            },
        })
        message = EmailMultiAlternatives(subject=email_subject,
                                         from_email=settings.NOTIFICATION_SENDING_EMAIL,
                                         to=DailyReportSubscription.get_emails())
        message.attach_alternative(html_content, 'text/html')
        message.send()
