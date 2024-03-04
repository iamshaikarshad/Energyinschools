from datetime import datetime, timezone
from http import HTTPStatus

from apps.accounts.permissions import RoleName
from apps.historical_data.models import DetailedHistoricalData
from apps.hubs.base_test_case import HubBaseTestCase
from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.resources.types import Unit


class TestHistoricalDataVariables(HubBaseTestCase):
    URL = '/api/v1/storage/historical/'
    FORCE_LOGIN_AS = RoleName.SLE_ADMIN

    def setUp(self):
        super().setUp()
        self.data_set = self._create_data_set()
        self._create_data_set_value(self.data_set)

    def test_get_historical_variables(self):
        response = self.client.get(self.get_url())
        self.assertResponse(response)
        self.assertEqual(1, len(response.data))

        latest_item = response.data[0]['latest_item']
        self.assertIsNotNone(latest_item)
        self.assertEqual(5, latest_item['value'])

    def test_download_historical_data(self):
        response = self.client.get(self.get_url(self.data_set.id, 'data', query_param={'format': 'csv'}))
        self.assertResponse(response)
        self.assertEqual(response.get('Content-Type'), 'text/csv; charset=utf-8')
        self.assertEqual(
            response.get('Content-Disposition'),
            'attachment; filename=the namespace_test_32_historical_data.csv'
        )
        self.assertEqual(len(response.content), 45)

    def test_create_data_set(self):
        body = dict(
            namespace='the name space',
            type=3,
            name='the_test',
            unit_label='the label',
            value=10,
            hub_uid=self.hub.uid
        )
        response = self.client.post(self.get_url(), body)
        self.assertResponse(response, HTTPStatus.CREATED)

        response = self.client.get(self.get_url())
        self.assertResponse(response, HTTPStatus.OK)
        self.assertEqual(2, len(response.data))

        created_dataset = next((item for item in response.data if item['name'] == 'the_test'), None)
        self.assertIsNotNone(created_dataset)
        self.assertIsNone(created_dataset['latest_item'])
        self.assertEqual(self.hub.sub_location.id, created_dataset['sub_location_id'])

    def test_update_data_set(self):
        new_dataset_location = self.location.sub_locations.first()
        body = dict(
            sub_location_id=new_dataset_location.id,
            namespace='the new space',
            type=5,
            name='new_name',
            unit_label='new label',
        )
        response = self.client.patch(self.get_url(self.data_set.id), body, content_type='application/json')
        self.assertResponse(response)

        response = self.client.get(self.get_url(self.data_set.id))
        self.assertResponse(response, HTTPStatus.OK)
        for key, value in body.items():
            self.assertEqual(value, response.data[key])

    def test_update_data_set_with_not_own_location_(self):
        new_dataset_location = self.get_user(school_number=1).location
        body = dict(
            sub_location_id=new_dataset_location.id
        )
        response = self.client.patch(self.get_url(self.data_set.id), body, content_type='application/json')
        self.assertResponse(response, HTTPStatus.BAD_REQUEST)

    def test_create_duplicated(self):
        body = dict(
            namespace='the name space',
            type=3,
            name='the_test',
            unit_label='the label',
            value=10,
            hub_uid=self.hub.uid
        )
        self.assertResponse(self.client.post(self.get_url(), body), HTTPStatus.CREATED)
        self.assertResponse(self.client.post(self.get_url(), body), HTTPStatus.BAD_REQUEST)

    def test_restore_data_set(self):
        self.assertResponse(self.client.delete(self.get_url(self.data_set.id)), HTTPStatus.NO_CONTENT)
        self.assertFalse(MicrobitHistoricalDataSet.objects.exists())

        response = self.client.post(self.get_url(), dict(
            namespace=self.data_set.namespace,
            name=self.data_set.name,
            type=self.data_set.type,
            hub_uid=self.data_set.hub.uid,

            unit_label='the label',
            value=10,
        ))
        self.assertResponse(response, HTTPStatus.CREATED)
        self.assertEqual(self.data_set.id, response.data['id'])

    def test_add_value_to_data_set(self):
        body = {
            "value": 10,
        }
        response = self.client.post(self.get_url(self.data_set.id, 'data'), body)
        self.assertResponse(response, HTTPStatus.CREATED)

        response = self.client.get(self.get_url(self.data_set.id, 'data'))
        self.assertResponse(response)
        self.assertEqual(2, len(response.data))

    def test_remove_variable(self):
        response = self.client.delete(self.get_url(self.data_set.id))
        self.assertResponse(response, HTTPStatus.NO_CONTENT)

    def _create_data_set(self, unit_label='the unit'):
        return MicrobitHistoricalDataSet.objects.create(
            name='test',
            namespace='the namespace',
            type=32,
            unit_label=unit_label,
            sub_location=self.get_user().location,
            hub=self.hub
        )

    @staticmethod
    def _create_data_set_value(data_set: MicrobitHistoricalDataSet, value=5):
        DetailedHistoricalData.objects.create(
            resource=data_set,
            time=datetime.now(timezone.utc),
            value=value,
        )

    def test_data_live(self):
        wrong_data_set = self._create_data_set()
        energy_data_set = self._create_data_set(Unit.WATT.value)
        temperature_data_set = self._create_data_set(Unit.CELSIUS.value)

        for label, data_set, excepted_status in (
                ('Wrong unit', wrong_data_set, HTTPStatus.OK),
                ('Energy', energy_data_set, HTTPStatus.OK),
                ('Temperature', temperature_data_set, HTTPStatus.OK),
        ):
            self._create_data_set_value(data_set, 5)
            self._create_data_set_value(data_set, 10)

            with self.subTest(label):
                response = self.client.get(self.get_url(data_set.id, 'data', 'live'))
                self.assertResponse(response, excepted_status)

                if excepted_status == HTTPStatus.OK:
                    self.assertEqual(7.5, response.data['value'])
