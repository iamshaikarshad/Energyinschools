from datetime import datetime, timedelta, timezone
from http import HTTPStatus

from apps.hubs.base_test_case import HubBaseTestCase
from apps.microbit_historical_data.models import MicrobitHistoricalDataSet
from apps.resources.types import Unit


class TestMicrobitHistoricalDataSet(HubBaseTestCase):
    URL = '/api/v1/micro-bit/historical-data/'

    def test_create(self):
        with self.subTest('Create'):
            response = self.client.post(self.get_url(), dict(
                namespace='ns',
                name='NamE',
                type=42,
                unit='watt',
                value=24,
            ), **self.get_hub_headers(self.hub_in_sub_location.uid))

            self.assertResponse(response, HTTPStatus.CREATED)
            instance = MicrobitHistoricalDataSet.objects.get()
            self.assertEqual('ns', instance.namespace)
            self.assertEqual('NamE', instance.name)
            self.assertEqual(42, instance.type)
            self.assertEqual(Unit.WATT, instance.unit)
            self.assertEqual('watt', instance.unit_label)
            self.assertEqual(self.hub_in_sub_location, instance.hub)
            self.assertEqual(self.hub_in_sub_location.sub_location, instance.sub_location)

        with self.subTest('Add value and change unit'):
            response = self.client.post(self.get_url(), dict(
                namespace='ns',
                name='NamE',
                type=42,
                unit='unit2',
                value=244,
                time=self.format_datetime(datetime.now(tz=timezone.utc) + timedelta(seconds=2)),
            ), **self.get_hub_headers(self.hub_in_sub_location.uid))
            self.assertResponse(response, HTTPStatus.CREATED)

            instance = MicrobitHistoricalDataSet.objects.get()
            self.assertEqual('ns', instance.namespace)
            self.assertEqual('NamE', instance.name)
            self.assertEqual(42, instance.type)
            self.assertEqual(Unit.UNKNOWN, instance.unit)
            self.assertEqual('unit2', instance.unit_label)
            self.assertEqual(self.hub_in_sub_location, instance.hub)
            self.assertEqual(self.hub_in_sub_location.sub_location, instance.sub_location)

            self.assertEqual([24., 244.], list(instance.detailed_historical_data.values_list('value', flat=True)))
