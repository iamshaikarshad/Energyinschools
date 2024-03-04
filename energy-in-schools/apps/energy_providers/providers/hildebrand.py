import logging
import requests

from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING, Union, Optional
from operator import itemgetter

from utilities.rest import RestSessionPayload
from apps.resources.types import ResourceValue, Unit, TimeResolution
from apps.energy_providers.providers.abstract import Meter, MeterType, cache_meter_value
from apps.energy_providers.providers.rest import RestProviderConnection

if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter

logger = logging.getLogger(__name__)


class HildebrandApiUrls:
    RETRIEVE_ALL_USERS = 'https://api.glowmarkt.com/api/v0-1/account'
    LOGIN = 'https://api.glowmarkt.com/api/v0-1/devauth'
    GET_VIRTUAL_ENTITY_RESOURCES = 'https://api.glowmarkt.com/api/v0-1/virtualentity/{meter_id}/resources'
    GET_RESOURCE_DATA = 'https://api.glowmarkt.com/api/v0-1/resource/{resource_id}/readings'
    GET_LATEST_RESOURCE_DATA = 'https://api.glowmarkt.com/api/v0-1/resource/{resource_id}/current'
    GET_TARIFF = 'https://api.glowmarkt.com/api/v0-1/resource/{resource_id}/tariff'


class Period:
    PER_MINUTE = 'PT1M'
    PER_30_MINUTES = 'PT30M'
    PER_HOUR = 'PT1H'
    PER_DAY = 'P1D'
    PER_WEEK = 'P1W'
    PER_MONTH = 'P1M'
    PER_YEAR = 'P1Y'


class HildebrandAppInfo:
    # APP_KEY = 'o1fXOY13Ois9k7ynpNeC'
    # APP_SECRET = 'LWzCPwF4tjbeDJvFsy0ncMPLbpEcbe'
    APPLICATION_ID = '8641ae75-573f-41a3-8403-a7f2afd06107'
    ORGANIZATION_ID = 'f7290289-db85-43f7-bc21-8bf3bb593811'
    ELECTRICITY_CONSUMPTION = 'electricity.consumption'


METER_TYPE_TO_LABEL = {
    MeterType.ELECTRICITY: 'ELECTRICITY',
    MeterType.GAS: 'GAS_ENERGY'
}

TIME_RESOLUTION_TO_PERIOD = {
    'year': Period.PER_YEAR,
    'month': Period.PER_MONTH,
    'week': Period.PER_WEEK,
    'day': Period.PER_DAY,
    'hour': Period.PER_HOUR,
    'half_hour': Period.PER_30_MINUTES,
    'minute': Period.PER_MINUTE,
}


class HildebrandProviderConnection(RestProviderConnection):
    def login(self):
        response = requests.post(
            HildebrandApiUrls.LOGIN,
            json={'username': self.credentials.login, 'password': self.credentials.password},
            headers={'Content-type': 'application/json'}
        )
        self._check_response(response)

        json_data = response.json()
        return RestSessionPayload.from_jwt_token(json_data['token'])

    @staticmethod
    def to_watts(val, input_unit, minutes_in_period=1):
        periods_in_hour = 60 / minutes_in_period
        TO_WATTS_CONVERT_RATIO = {
            'kWh': periods_in_hour * 1000,
            'Wh': periods_in_hour,
            'kW': 1000,
        }
        ratio = TO_WATTS_CONVERT_RATIO[input_unit] if input_unit in TO_WATTS_CONVERT_RATIO else 1

        return (val * ratio) if val else 0

    def get_resource_data(
            self,
            resource_id: str,
            period: str,
            from_time: datetime,
            to_time: datetime,
            function: str = 'sum',
            offset: int = 0,
    ):
        response = requests.get(
            HildebrandApiUrls.GET_RESOURCE_DATA.format(resource_id=resource_id),
            headers={
                'token': self.get_auth_token(),
                'ApplicationId': HildebrandAppInfo.APPLICATION_ID
            },
            params={
                'period': period,
                'from': from_time.strftime('%Y-%m-%dT%H:%M:%S'),
                'to': to_time.strftime('%Y-%m-%dT%H:%M:%S'),
                'function': function,
                'offset': offset,
            }
        )
        self._check_response(response)

        return response.json()

    @staticmethod
    def format_tariff_details_from_response(tariff_details):
        tariffs = []
        last_rate = 0
        starts = set()
        ends = set()

        for detail in tariff_details:
            if 'time' in detail and 'tourate' in detail:
                start, end = detail['time'].split('-')
                starts.add(start)
                ends.add(end)
                tariffs.append({
                    'rate': detail['tourate'],
                    'start': f'{start}:00',
                    'end': f'{end}:00',
                })
            else:
                last_rate = detail['rate']

        start = (ends - starts).pop()
        end = (starts - ends).pop()
        tariffs.append({
            'rate': last_rate,
            'start': f'{start}:00',
            'end': f'{end}:00',
        })

        return tariffs

    @staticmethod
    def create_tariff(date_from, standing_charge, rate, start='00:00:00', end=None):
        return {
            'active_date_start': date_from,
            'daily_fixed_cost': standing_charge,
            'watt_hour_cost': rate,
            'active_time_start': start,
            'active_time_end': end,
        }

    @staticmethod
    def first_non_empty_value(data, reverse=lambda x: x):
        return next(index for index, (_, value) in reverse(list(enumerate(data))) if value is not None)

    def get_tariff(self, tariff_id: str):
        response = requests.get(
            HildebrandApiUrls.GET_TARIFF.format(resource_id=tariff_id),
            headers={
                'token': self.get_auth_token(),
                'ApplicationId': HildebrandAppInfo.APPLICATION_ID
            }
        )
        self._check_response(response)
        data = response.json()['data'][0]
        datetime_from, (structure, *_) = itemgetter('from', 'structure')(data)
        date_from = datetime_from.split(' ')[0]
        plan_detail = structure['planDetail']
        try:
            index, standing_charge = next(
                [index, detail['standing']]
                for index, detail in enumerate(plan_detail) if 'standing' in detail
            )
            del plan_detail[index]
        except StopIteration:
            standing_charge = 0

        result = []
        if len(plan_detail) == 1:
            plan_detail = plan_detail[0]
            result.append(self.create_tariff(date_from, standing_charge, plan_detail['rate']))
        else:
            tariffs = self.format_tariff_details_from_response(plan_detail)

            for tariff in tariffs:
                result.append(
                    self.create_tariff(date_from, standing_charge, tariff['rate'], tariff['start'], tariff['end'])
                )

        return result

    def get_historical_consumption(
            self,
            meter: 'Union[EnergyMeter, Meter]',
            from_date: datetime,
            to_date: Optional[datetime] = datetime.now(),
            time_resolution: TimeResolution = TimeResolution.DAY
    ):
        label = time_resolution.value
        duration = time_resolution.duration

        response = self.get_resource_data(meter.meter_id, TIME_RESOLUTION_TO_PERIOD[label], from_date, to_date)

        data, unit = itemgetter('data', 'units')(response)
        result = []

        previous_value = self.to_watts(data[0][1], unit, duration.seconds // 60) if label == 'minute' else 0

        now = datetime.now().replace(second=0, microsecond=0)
        if to_date.replace(second=0, microsecond=0) in [now, now - timedelta(minutes=1)]:
            try:
                last_index = next(
                    index for index, (_, value) in reversed(list(enumerate(data))) if value
                )
                data = data[:last_index + 1]
            except StopIteration:
                pass

        for timestamp, value in data:
            result.append(ResourceValue(
                value=self.to_watts(value, unit, duration.seconds // 60) if value else previous_value,
                time=datetime.fromtimestamp(timestamp, tz=timezone.utc),
                unit=Unit.WATT
            ))
            if value and label == 'minute':
                previous_value = self.to_watts(value, unit, duration.seconds // 60)

        return result

    @cache_meter_value
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]'):
        result = []
        try:
            if meter.is_half_hour_meter:
                result = self.get_half_hour_level_consumption(meter)
            else:
                result = self.get_minute_level_consumption(meter)
        except Exception as e:
            logger.error(e)

        return result

    def get_half_hour_level_consumption(self, meter: 'Union[EnergyMeter, Meter]'):
        now = datetime.now()

        if now.hour not in [7, 8, 9, 10] or now.minute != 0:
            return []

        yesterday = now - timedelta(days=1)
        from_time = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        to_time = yesterday.replace(hour=23, minute=59, second=59, microsecond=0)
        response = self.get_resource_data(meter.meter_id, Period.PER_30_MINUTES, from_time, to_time)

        data, unit = itemgetter('data', 'units')(response)

        values_count = sum(1 if value else 0 for timestamp, value in data)

        return [ResourceValue(
            value=self.to_watts(value, unit, 30) if value else 0,
            time=datetime.fromtimestamp(timestamp, tz=timezone.utc),
            unit=Unit.WATT
        ) for timestamp, value in data] if values_count > 2 else []

    def get_minute_level_consumption(self, meter: 'Union[EnergyMeter, Meter]'):
        now = datetime.now().replace(second=0, microsecond=0)

        if now.minute % 10 not in [1, 6]:
            return []

        from_time = now - timedelta(hours=2)
        to_time = now - timedelta(minutes=1)
        response = self.get_resource_data(meter.meter_id, Period.PER_MINUTE, from_time, to_time)

        data, unit = itemgetter('data', 'units')(response)
        result = []

        if len(data) == 120:
            try:
                last_index = self.first_non_empty_value(data, reversed)
            except StopIteration:
                return result
            try:
                first_index = self.first_non_empty_value(data[:last_index - min(last_index, 5) + 1], reversed)
            except StopIteration:
                first_index_slice = self.first_non_empty_value(data[last_index - min(last_index, 5):last_index + 1])
                first_index = last_index - min(last_index, 5) + first_index_slice

            if last_index - first_index >= 5:
                data_to_add = data[first_index+1:last_index+1]
            else:
                data_to_add = data[first_index:last_index + 1]

            try:
                last_timestamp, _ = data[last_index]
                minutes_delay = (now - datetime.fromtimestamp(last_timestamp)).seconds // 60
                meter.minutes_delay = minutes_delay
                meter.save()
            except Exception as e:
                logger.error(e)

            previous_value = self.to_watts(data[first_index][1], unit)

            for timestamp, value in data_to_add:
                result.append(ResourceValue(
                    value=self.to_watts(value, unit) if value else previous_value,
                    time=datetime.fromtimestamp(timestamp, tz=timezone.utc),
                    unit=Unit.WATT
                ))
                if value:
                    previous_value = self.to_watts(value, unit)

        return result
