import json
from datetime import date, datetime, time, timedelta, timezone
from http import HTTPStatus
from typing import Tuple
from unittest.mock import MagicMock, patch

from unittest.mock import Mock

from apps.accounts.permissions import RoleName
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.learning_days.models import LearningDay
from apps.notifications.base_test_case import NotificationBaseTestCase
from apps.notifications.models import NotificationTarget, NotificationTrigger
from apps.notifications.models.notification_target import EmailNotification
from apps.notifications.models.notification_triggers import ActiveDays, DailyUsageTrigger, ValueLevelTrigger


datetime_mock = Mock(wraps=datetime)
datetime_mock.now.return_value = datetime.now(tz=timezone.utc).replace(hour=5, minute=0, second=0, microsecond=0)


class TestNotificationTriggers(NotificationBaseTestCase, EnergyHistoryBaseTestCase):
    URL = '/api/v1/notifications/triggers/'
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN

    def test_create_for_location(self):
        response = self.client.post(self.get_url(), dict(
            name='the trigger',
            source_location_id=self.location.id,
            type=NotificationTrigger.Type.ELECTRICITY_CONSUMPTION_LEVEL.value,
            max_notification_frequency=NotificationTrigger.MaxNotifyFrequency.ONE_PER_HOUR.value,
            value_level=dict(
                condition=ValueLevelTrigger.Condition.GREATER.value,
                argument=0.5,
                min_duration='00:10',
            ),
            active_days=ActiveDays.SCHOOL_DAYS.value
        ), content_type='application/json')

        self.assertResponse(response, HTTPStatus.CREATED)
        self.assertEqual(0.5, NotificationTrigger.objects.get(id=response.data['id']).value_level.argument)

    def test_create_for_resource(self):
        response = self.client.post(self.get_url(), dict(
            name='the trigger',
            source_resource_id=self.energy_meter.id,
            type=NotificationTrigger.Type.ELECTRICITY_CONSUMPTION_LEVEL.value,
            max_notification_frequency=NotificationTrigger.MaxNotifyFrequency.ONE_PER_HOUR.value,
            value_level=dict(
                condition=ValueLevelTrigger.Condition.GREATER.value,
                argument=0.5,
                min_duration='00:10',
            ),
            active_days=ActiveDays.SCHOOL_DAYS.value
        ), content_type='application/json')

        self.assertResponse(response, HTTPStatus.CREATED)
        self.assertEqual(0.5, NotificationTrigger.objects.get(id=response.data['id']).value_level.argument)

    def test_change(self):
        response = self.client.patch(self.get_url(self.notification_trigger.id), data=json.dumps(dict(
            max_notification_frequency=NotificationTrigger.MaxNotifyFrequency.ONE_PER_DAY.value,
            value_level=dict(
                argument=2
            )
        )), content_type='application/json')
        self.assertResponse(response)
        self.assertEqual(
            self.notification_trigger.max_notification_frequency,
            NotificationTrigger.MaxNotifyFrequency.ONE_PER_DAY
        )
        self.assertEqual(
            self.notification_trigger.value_level.argument,
            2
        )

    def test_change_type(self):
        response = self.client.patch(self.get_url(self.notification_trigger.id), data=json.dumps(dict(
            type=NotificationTrigger.Type.DAILY_ELECTRICITY_USAGE.value,
            daily_usage=dict(
                threshold_in_percents=10
            )
        )), content_type='application/json')
        self.assertResponse(response)
        self.assertEqual(
            self.notification_trigger.daily_usage.threshold_in_percents,
            10
        )

    def test_value_level_trigger(self):
        now = datetime.now(tz=timezone.utc).replace(second=0, microsecond=0)
        for index, value in enumerate((0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1)):
            #                                            ^ - start (0)     ^ - end (6)
            DetailedHistoricalData.objects.create(
                resource=self.energy_meter,
                time=now + timedelta(minutes=index - 6),
                value=value
            )

        for days_offset in range(0, 15, 2):
            LearningDay.objects.create(location=self.location, date=date.today() - timedelta(days=days_offset))

        for min_duration, triggered, active_days in (
                (None, True, ActiveDays.ALL_DAYS),
                (timedelta(minutes=1), True, ActiveDays.ALL_DAYS),
                (timedelta(minutes=2), False, ActiveDays.ALL_DAYS),
                (timedelta(minutes=1), False, ActiveDays.NON_SCHOOL_DAYS),
                (timedelta(minutes=1), True, ActiveDays.SCHOOL_DAYS)
        ):
            with self.subTest(f'min_duration: {min_duration}, active_days: {active_days}'):
                trigger = ValueLevelTrigger.objects.create(
                    location=self.location,
                    source_location=self.location,
                    condition=NotificationTrigger.Condition.GREATER,
                    type=NotificationTrigger.Type.ELECTRICITY_CONSUMPTION_LEVEL,
                    max_notification_frequency=NotificationTrigger.MaxNotifyFrequency.ONE_PER_HOUR,
                    active_time_range_start=now.time(),
                    active_time_range_end=(now + timedelta(minutes=6)).time(),
                    argument=0.5,
                    min_duration=min_duration,
                    active_days=active_days
                )

                self.assertEqual(triggered, trigger._is_triggered())

    @patch('apps.notifications.models.notification_triggers.datetime', new=datetime_mock)
    def test__get_average_usage_until_this_time(self):
        trigger, today = self._init_daily_trigger_values()

        self.assertEqual(760, trigger._get_average_usage_until_this_time())

    @patch('apps.notifications.models.notification_triggers.datetime', new=datetime_mock)
    def test__get_today_usage(self):
        trigger, today = self._init_daily_trigger_values()

        self.assertEqual(300, trigger._get_today_usage())

    def _init_daily_trigger_values(self, active_days: ActiveDays = ActiveDays.SCHOOL_DAYS) \
            -> Tuple[DailyUsageTrigger, datetime]:
        today = datetime.now(tz=timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        for days_offset in range(1, 15, 2):
            LearningDay.objects.create(location=self.location, date=date.today() - timedelta(days=days_offset))

        for days_offset in range(1, 15, 2):
            for hour_offset in range(10):
                LongTermHistoricalData.objects.create(
                    resource=self.energy_meter,
                    time=today - timedelta(days=days_offset) + timedelta(hours=hour_offset),
                    value=(100 + days_offset * 10 + hour_offset) * 2
                )

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=today.replace(hour=2),
            value=100 * 2
        )

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=today.replace(hour=3),
            value=200 * 2
        )

        trigger = DailyUsageTrigger.objects.create(
            location=self.location,
            source_location=self.location,
            type=NotificationTrigger.Type.ELECTRICITY_CONSUMPTION_LEVEL,
            max_notification_frequency=NotificationTrigger.MaxNotifyFrequency.ONE_PER_HOUR,
            active_time_range_start=time(hour=2),
            active_time_range_end=time(hour=20),
            threshold_in_percents=10,
            active_days=active_days
        )

        return trigger, today

    @patch('apps.notifications.models.notification_target.NotificationTarget.send_notification')
    def test_send_notifications(self, mock: MagicMock):
        self.create_detailed_history_fresh_data()

        EmailNotification.objects.create(
            trigger=self.notification_trigger,
            type=NotificationTarget.Type.EMAIL,  # todo: remove it from here
            email='aaa@bbb.ccc'
        )

        NotificationTrigger.process_all_triggers()
        NotificationTrigger.process_all_triggers()
        NotificationTrigger.process_all_triggers()
        mock.assert_called_once()

    @patch('apps.notifications.models.notification_triggers.datetime', new=datetime_mock)
    def test_daily_usage_trigger(self):
        trigger, today = self._init_daily_trigger_values()

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=today.replace(hour=3, minute=1),
            value=100
        )

        self.assertFalse(trigger._is_triggered())

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=today.replace(hour=2, minute=1),
            value=600 * 2
        )

        self.assertTrue(trigger._is_triggered())

    @patch('apps.notifications.models.notification_triggers.datetime', new=datetime_mock)
    def test_daily_non_school_day_notification(self):
        trigger, today = self._init_daily_trigger_values(ActiveDays.NON_SCHOOL_DAYS)

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=today,
            value=425
        )

        self.assertFalse(trigger._is_triggered())

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=(today - timedelta(days=2)).replace(hour=0, minute=0),
            value=100
        )

        self.assertTrue(trigger._is_triggered())

    @patch('apps.notifications.models.notification_triggers.datetime', new=datetime_mock)
    def test_daily_all_days_notification(self):
        trigger, today = self._init_daily_trigger_values(ActiveDays.ALL_DAYS)

        LongTermHistoricalData.objects.create(
            resource=self.energy_meter,
            time=today,
            value=900
        )

        self.assertTrue(trigger._is_triggered())
