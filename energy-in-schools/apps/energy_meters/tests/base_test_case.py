from datetime import datetime, timezone, timedelta
from typing import Union
from itertools import cycle

from apps.addresses.models import Address
from apps.cashback.models import OffPeakyPoint
from apps.energy_meters.models import EnergyMeter
from apps.energy_providers.providers.abstract import MeterType
from apps.energy_providers.tests.base_test_case import EnergyProviderBaseTestCase
from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.locations.models import Location
from apps.smart_things_sensors.models import SmartThingsEnergyMeter


class EnergyHistoryBaseTestCase(EnergyProviderBaseTestCase):
    def create_energy_history(
            self,
            extra_rows=(),
            default_rows: bool = True,
            is_detailed_history: bool = True,
            long_term_history_in_watt_hour: bool = False
    ):
        history_class = DetailedHistoricalData if is_detailed_history else LongTermHistoricalData

        sub_location = Location.objects.create(
            parent_location=self.location,
            address=Address.objects.create(line_1='bla bla'),
        )
        meter_in_sub_location = EnergyMeter.objects.create(
            meter_id='the some id',
            type=MeterType.GAS,
            provider_account=self.energy_provider,
            sub_location=sub_location,
        )
        for index, (energy_meter, time) in enumerate((
                *((
                        (self.energy_meter, datetime(2000, 10, 10, 10, 10, 10, tzinfo=timezone.utc)),
                        (self.energy_meter, datetime(2000, 10, 10, 10, 10, 20, tzinfo=timezone.utc)),
                        (self.energy_meter, datetime(2000, 10, 10, 10, 10, 30, tzinfo=timezone.utc)),
                        (meter_in_sub_location, datetime(2000, 10, 10, 10, 11, 30, tzinfo=timezone.utc)),
                        (meter_in_sub_location, datetime(2000, 10, 10, 10, 11, 40, tzinfo=timezone.utc)),
                        (meter_in_sub_location, datetime(2000, 10, 10, 11, 11, 40, tzinfo=timezone.utc)),
                ) if default_rows else ()),
                *extra_rows,
        )):
            history_class.objects.create(
                resource=energy_meter,
                time=time,
                # todo: hack to live old tests unchanged
                value=10 * index * (2 if not is_detailed_history and long_term_history_in_watt_hour else 1)
            )

    def create_detailed_history_fresh_data(
            self, energy_meter: Union[EnergyMeter, SmartThingsEnergyMeter] = None
    ) -> datetime:
        return DetailedHistoricalData.objects.create(
            resource=energy_meter or self.energy_meter,
            time=datetime.now(tz=timezone.utc),
            value=100
        ).time

    def _create_location_meters_and_energy_data(self, reverse=False, in_middle=False,
                                                energy_type=EnergyMeter.Type.ELECTRICITY):
        location_meters = {}
        for location_id in range(3):
            location: Location = self.get_user(school_number=location_id).location
            location_meter = self.create_energy_meter(
                name=f'{location.name}_{energy_type}',
                type_=energy_type
            )
            location_meter.sub_location = location
            location_meter.save()
            location_meters.setdefault(energy_type, []).append(location_meter)
        if reverse:
            location_meters[energy_type].reverse()
        if in_middle:
            meters = location_meters[energy_type]
            meters[0], meters[1] = meters[1], meters[0]
            location_meters[energy_type] = meters

        now = datetime.now()

        tou_time_zones = cycle((10, 17, 6))  # green, amber, red

        for idx, meter in enumerate(location_meters[energy_type]):

            current_tou_time_zone = next(tou_time_zones)

            LongTermHistoricalData.objects.create(
                resource=meter,
                time=datetime(now.year, now.month, now.day, current_tou_time_zone, tzinfo=timezone.utc) - timedelta(days=1),
                value=1000 * (idx + 1)
            )

            DetailedHistoricalData.objects.create(
                resource=meter,
                time=datetime.now(tz=timezone.utc),
                value=1000 * (idx + 1)
            )

        for location_id in range(3):
            location: Location = self.get_user(school_number=location_id).location
            OffPeakyPoint.create_or_update_for_location(location, now.date() - timedelta(days=1))
