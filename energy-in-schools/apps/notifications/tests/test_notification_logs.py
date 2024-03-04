import json
from datetime import datetime, timedelta, timezone
from typing import Union
from http import HTTPStatus
from unittest.mock import patch

from apps.accounts.permissions import RoleName
from apps.notifications.base_test_case import NotificationBaseTestCase
from apps.notifications.models.notification_logs import NotificationEventLog, UserNotificationEventLog
from apps.notifications.models.notification_triggers import AbnormalValueTrigger
from apps.notifications.serializers.notification_trigger import NotificationTriggerSerializer
from apps.notifications.types import (
    NotificationStatus, NotificationsType,
    AbnormalValueTriggerType, TRIGGER_DATA_RESPONSE_MESSAGE
)
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase
from apps.resources.models import Resource
from apps.resources.types import ResourceValue
from apps.locations.models import Location


class TestNotificationLogs(NotificationBaseTestCase):
    URL = '/api/v1/notifications/event-logs/'
    FORCE_LOGIN_AS = RoleName.SEM_ADMIN

    def setUp(self):
        super().setUp()
        self.notification_log = NotificationEventLog.objects.create(
            event_time=datetime.now(tz=timezone.utc),
            location=self.notification_trigger.location,
            trigger_data=NotificationTriggerSerializer(self.notification_trigger).data
        )

    def test_list(self):
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(1, len(response.data))

    def test_delete_logs(self):
        response = self.client.delete(self.get_url())
        self.assertResponse(response, HTTPStatus.NO_CONTENT)

        logs = NotificationEventLog.objects.in_location(self.location).all()
        self.assertEqual(0, len(logs))


class TestAbnormalValueNotificationEventLog(EnergyProviderBaseTestCase,
                                            SmartThingsSensorsBaseTestCase):
    URL = '/api/v1/notifications/abnormal-usage/'
    FORCE_LOGIN_AS = RoleName.ADMIN
    PARENT_LOCATION_NAME = 'MAIN_BUILDING'

    def setUp(self):
        super().setUp()

        # AbnormalValueTrigger (all types) creates in migration operations
        self.energy_meter_electricity = self.create_energy_meter(type_=MeterType.ELECTRICITY)
        self.energy_meter_gas = self.create_energy_meter(type_=MeterType.GAS)
        self.smart_things_energy_meter_electricity = self.create_smart_things_energy_meter(
            type_=MeterType.ELECTRICITY,
            device_id=self.create_smart_things_device(smart_things_id=f'id_{MeterType.ELECTRICITY.value}').id
        )
        self.smart_things_energy_meter_gas = self.create_smart_things_energy_meter(
            type_=MeterType.GAS,
            device_id=self.create_smart_things_device(smart_things_id=f'id_{MeterType.GAS.value}').id
        )
        self.resources = [self.energy_meter_electricity, self.energy_meter_gas,
                          self.smart_things_energy_meter_electricity, self.smart_things_energy_meter_gas]

    def test_create(self):
        notifications_created = self._create_notifications()

        with self.subTest('Check notification data'):
            self._check_notification_data(notifications_created)

        with self.subTest('Check notification data with parent location'):
            # adding parent location to user location
            Location.objects.filter(name=self.location.name) \
                .update(parent_location=Location.objects.create(name=self.PARENT_LOCATION_NAME))

            self._check_notification_data(notifications_created)

    def test_update(self):
        notification = UserNotificationEventLog.objects.create(
            location=self.location,
            event_time=datetime.now(timezone.utc),
            trigger_data={},
        )

        response = self.client.get(self.get_url())

        self.assertResponse(response)
        self.assertEqual(1, len(response.data.get('results')))

        response = self.client.patch(
            self.get_url(notification.id), data=dict(status=NotificationStatus.RESOLVED.value),
            content_type='application/json'
        )
        self.assertResponse(response)

        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(0, len(response.data.get('results')))

    def test_resolve_notifications_in_location(self):
        self._create_notifications()
        correct_location_id = self.location.id
        incorrect_location_id = correct_location_id + 99

        for sub_test_message, location_id, expected_response, expected_notification_status in (
            ('Request with wrong location ID', incorrect_location_id,
             HTTPStatus.BAD_REQUEST, NotificationStatus.ACTIVE),
            ('Request with correct location ID', correct_location_id, 
             HTTPStatus.OK, NotificationStatus.RESOLVED),
        ):
            with self.subTest(sub_test_message):
                response = self.client.post(self.get_url('resolve-notifications-in-location'),
                                            json.dumps({ 'location_id': location_id }),
                                            content_type='application/json')
                self.assertResponse(response, expected_response)
                self.assertTrue(all(
                    notification.status == expected_notification_status
                    for notification in UserNotificationEventLog.objects.all()
                ))

    def test_resolve_expired_notifications(self):
        # Expiration period for now is 3 days (find in NotificationsType)
        [UserNotificationEventLog.objects.create(
            location=self.location,
            event_time=datetime.now(tz=timezone.utc) - timedelta(days=days),
            trigger_data={},
            status=NotificationStatus.ACTIVE
        ) for days in range(6)]

        active_notifications = UserNotificationEventLog.objects.filter(status=NotificationStatus.ACTIVE)
        self.assertEqual(active_notifications.count(), 6)

        UserNotificationEventLog.resolve_notifications(NotificationsType.EXPIRED)
        self.assertEqual(active_notifications.count(), 3)

    def test_get_total(self):
        notifications_created = self._create_notifications()
        response = self.client.get(self.get_url('total'))

        self.assertResponse(response)
        self.assertDictEqual(
            response.data,
            { 'total': notifications_created },
        )

    def test_non_admin_access(self):
        self.client.force_login(self.sle_admin)
        response = self.client.get(self.get_url())

        self.assertResponse(response, HTTPStatus.FORBIDDEN)

    def _create_notifications(self):
        for index, resource in enumerate(self.resources):
            resource.add_value(self._get_abnormal_value(resource))
        return index + 1

    def _get_abnormal_value(self, resource: Resource):
        trigger = AbnormalValueTrigger.get_trigger_for_resource(resource)
        return ResourceValue(time=datetime.now(timezone.utc), value=trigger.abnormal_max_value + 0.5)

    @patch('apps.notifications.views.AbnormalValueNotificationPagination.page_size', 2)
    def _check_notification_data(self, notifications_created):
        location_has_parent_location = bool(self.location.parent_location)

        response = self.client.get(self.get_url(query_param=dict(page=1)))
        data = response.data

        self.assertResponse(response)
        self.assertDictEqual(
            dict(count=data.get('count'),
                 next=data.get('next'),
                 previous=data.get('previous'),
                 locations=data.get('locations')),
            dict(count=notifications_created,
                 next=f'http://{response.wsgi_request.get_host()}{self.get_url(query_param=dict(page=2))}',
                 previous=None,
                 locations=[dict(location_id=self.location.id,
                                 location_name=self.location.name)]))

        notifications = data.get('results')

        for notification, resource, trigger in zip(
            notifications, reversed(self.resources), (AbnormalValueTriggerType.GAS,
                                                      AbnormalValueTriggerType.ELECTRICITY,
                                                      AbnormalValueTriggerType.GAS,
                                                      AbnormalValueTriggerType.ELECTRICITY)
        ):
            self.assertDictEqual(
                dict(location=notification.get('location'),
                     parent_location=notification.get('parent_location'),
                     trigger_data=notification.get('trigger_data')
                    ),
                dict(location=self.location.name,
                     parent_location=self.location.parent_location.name
                        if location_has_parent_location else None,
                     trigger_data=TRIGGER_DATA_RESPONSE_MESSAGE.format(
                        self._get_abnormal_value(resource).value,
                        resource.name,
                        trigger.value.capitalize()
                    ))
            )
