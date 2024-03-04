from datetime import datetime, timezone
from http import HTTPStatus

from apps.energy_meters.models import EnergyMeter
from apps.energy_meters.tests.base_test_case import EnergyHistoryBaseTestCase
from apps.energy_providers.providers.abstract import MeterType
from apps.hubs.authentication import RaspberryPiAuthentication
from apps.hubs.base_test_case import HubBaseTestCase
from apps.locations.models import Location
from apps.resources.types import Unit
from apps.smart_things_sensors.base_test_case import SmartThingsSensorsBaseTestCase


class TestMicrobitEnergy(EnergyHistoryBaseTestCase, HubBaseTestCase, SmartThingsSensorsBaseTestCase):
    URL = '/api/v1/micro-bit/energy/consumption/'

    def test_retrieve_own_location(self):
        fresh_history_time = self.create_detailed_history_fresh_data()

        response = self.client.get(
            self.get_url(query_param=dict(meter_type=MeterType.ELECTRICITY.value)),
            **self.get_hub_headers()
        )

        self.assertResponse(response)
        self.assertEqual(dict(value=100,
                              time=self.format_datetime(fresh_history_time),
                              unit=Unit.WATT.value),
                         dict(response.data.items()))

    def test_retrieve_another_location(self):
        location = self.get_user(school_number=1).location
        energy_meter = EnergyMeter.objects.create(
            meter_id='the best id',
            type=EnergyMeter.Type.GAS,
            provider_account=self.energy_provider,
            sub_location=location,
        )
        fresh_history_time = self.create_detailed_history_fresh_data(energy_meter)

        response = self.client.get(
            self.get_url(query_param=dict(energy_type=MeterType.GAS.value, location_uid=location.uid)),
            **self.get_hub_headers()
        )

        self.assertResponse(response)
        self.assertEqual(dict(value=100,
                              time=self.format_datetime(fresh_history_time),
                              unit=Unit.WATT.value),
                         dict(response.data.items()))

    def test_retrieve_historical_value(self):
        self.create_energy_history()

        response = self.client.get(
            self.get_url(query_param={'from': datetime(2000, 10, 10, 10, 10, 30, tzinfo=timezone.utc).isoformat(),
                                      'to': datetime(2000, 10, 10, 10, 11, 40, tzinfo=timezone.utc).isoformat()}),
            **self.get_hub_headers()
        )
        self.assertResponse(response)
        self.assertEqual(dict(
            time=self.format_datetime(datetime(2000, 10, 10, 10, 11, 30, tzinfo=timezone.utc)),
            value=50,
            unit=Unit.WATT.value,
        ), response.data)

    def test_auth(self):  # todo: auth test can be moved to hub app
        self.create_detailed_history_fresh_data()

        for status_code, title, headers in (
                (HTTPStatus.UNAUTHORIZED, 'Without headers', {}),
                (HTTPStatus.UNAUTHORIZED, 'Wrong hub uid', self.get_hub_headers(
                    hub_uid='wrong',
                    location_uid=self.location.uid
                )),
                (HTTPStatus.UNAUTHORIZED, 'Wrong school uid', self.get_hub_headers(
                    hub_uid=self.hub.uid,
                    location_uid='wrong'
                )),
                (HTTPStatus.UNAUTHORIZED, 'Wrong relation school and hub', self.get_hub_headers(
                    hub_uid=self.hub.uid,
                    location_uid=self.get_user(school_number=1).location.uid
                )),
                (HTTPStatus.OK, 'Right school and hub', self.get_hub_headers(
                    hub_uid=self.hub.uid,
                    location_uid=self.location.uid
                )),
                (HTTPStatus.OK, 'Right school and hub from sub location', self.get_hub_headers(
                    hub_uid=self.hub_in_sub_location.uid,
                    location_uid=self.location.uid
                )),
        ):
            with self.subTest(title):
                RaspberryPiAuthentication.get_auth_data.invalidate_all()

                response = self.client.get(
                    self.get_url(),
                    **headers
                )

                self.assertEqual(status_code, response.status_code)

    def test_retrieve_electricity_without_data(self):
        self.create_energy_history()

        response = self.client.get(
            self.get_url(query_param=dict(location_uid=self.location.uid)),
            **self.get_hub_headers(
                hub_uid=self.location.hubs.first().uid,
                location_uid=self.location.uid
            )
        )
        self.assertEqual(HTTPStatus.NO_CONTENT, response.status_code, response.data)

    def test_smart_things_energy_meter_included(self):
        smart_things_energy_meter = self.create_smart_things_energy_meter()
        another_location = Location.objects.create(share_energy_consumption=True)
        another_location_meter = self.create_energy_meter(sub_location=another_location)

        fresh_history_time = self.create_detailed_history_fresh_data(smart_things_energy_meter)
        self.create_detailed_history_fresh_data(another_location_meter)  # Shouldn't be included

        response = self.client.get(
            self.get_url(query_param=dict(energy_type=MeterType.ELECTRICITY.value)),
            **self.get_hub_headers(),
        )
        self.assertResponse(response)
        self.assertEqual(dict(value=100,
                              time=self.format_datetime(fresh_history_time),
                              unit=Unit.WATT.value),
                         dict(response.data.items()))
