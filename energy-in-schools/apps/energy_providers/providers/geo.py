import logging
from datetime import datetime, timezone
from http import HTTPStatus
from typing import List, TYPE_CHECKING, Union

import funcy
import requests
from requests import RequestException

from apps.energy_providers.providers.abstract import Meter, MeterType, RETRY_COUNT, SECONDS_BETWEEN_ATTEMPTS, \
    TimeRangeIsTooLargeError, UnknownProviderRequestError, cache_meter_value
from apps.energy_providers.providers.rest import RestProviderConnection
from utilities.rest import RestSessionPayload
from apps.resources.types import ResourceDataNotAvailable, ResourceValue, TimeResolution, Unit


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter

logger = logging.getLogger(__name__)


class GeoApiUrls:
    LOGIN = 'https://solo3.energynote.eu/api/userapi/account/login'
    USER_SYSTEMS = 'https://solo3.energynote.eu/api/userapi/user/systems'
    LIVE_USAGE = 'https://solo3.energynote.eu/api/userapi/system/smets2-live-data/{system_id}'
    HISTORICAL_USAGE = 'https://solo3.energynote.eu/api/userapi/system/smets2-historic-{time_part}/{system_id}'


METER_TYPE_TO_LABEL = {
    MeterType.ELECTRICITY: 'ELECTRICITY',
    MeterType.SOLAR: 'ELECTRICITY',
    MeterType.GAS: 'GAS_ENERGY'
}


class GeoProviderConnection(RestProviderConnection):
    supported_time_resolutions = frozenset((TimeResolution.DAY, TimeResolution.WEEK, TimeResolution.MONTH))
    USE_NOW_INSTEAD_REAL_TIMESTAMP = True  # todo: remote this when GEO will be fixed

    def login(self):
        response = requests.post(
            GeoApiUrls.LOGIN,
            json={'emailAddress': self.credentials.login, 'password': self.credentials.password},
            headers={'Content-type': 'application/json'}
        )
        self._check_response(response)

        json_data = response.json()
        return RestSessionPayload.from_jwt_token(json_data['token'])

    @cache_meter_value
    @funcy.retry(RETRY_COUNT, (UnknownProviderRequestError, RequestException, ResourceDataNotAvailable),
                 SECONDS_BETWEEN_ATTEMPTS)
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        """

        Retry on MeterDataNotFound is required because a response with an empty power field can be returned at the
        first attempt.
        """
        response = requests.get(
            GeoApiUrls.LIVE_USAGE.format(system_id=meter.meter_id),
            headers=self.get_auth_headers()
        )
        self._check_response(response)

        content = response.json()
        for meter_info in content.get('power') or ():  # power can be None
            if meter_info['valueAvailable'] and meter_info['type'] == METER_TYPE_TO_LABEL[meter.type]:
                return ResourceValue(value=meter_info['watts'],
                                     time=(datetime.now(tz=timezone.utc) if self.USE_NOW_INSTEAD_REAL_TIMESTAMP else
                                           datetime.fromtimestamp(content['powerTimestamp'], tz=timezone.utc)),
                                     unit=Unit.WATT,
                                     )

        msg = 'Geo API data is not available'
        logger.warning(msg)
        raise ResourceDataNotAvailable(msg)

    @cache_meter_value
    @funcy.retry(RETRY_COUNT, (UnknownProviderRequestError, RequestException), SECONDS_BETWEEN_ATTEMPTS)
    def get_historical_consumption(self, meter: 'Union[EnergyMeter, Meter]',
                                   from_date: datetime, to_date: datetime = None,
                                   time_resolution: TimeResolution = TimeResolution.HOUR) -> List[ResourceValue]:
        """XXX TODO DEPRECATED!!!"""
        self._validate_time_resolution(time_resolution)

        time_url_part = {
            TimeResolution.DAY: 'day',
            TimeResolution.WEEK: 'week',
            TimeResolution.MONTH: 'month'
        }[time_resolution]

        response = requests.get(
            GeoApiUrls.HISTORICAL_USAGE.format(time_part=time_url_part, system_id=meter.meter_id),
            headers=self.get_auth_headers(),
            params={
                'fromMonth': from_date.month,
                'fromYear': from_date.year,
                'toMonth': to_date.month,
                'toYear': to_date.year
            } if time_resolution is TimeResolution.MONTH else {
                'from': from_date.strftime('%Y-%m-%d'),
                'to': to_date.strftime('%Y-%m-%d')
            }
        )

        if response.status_code == HTTPStatus.BAD_REQUEST and \
                'max search limit exceeded' in response.json()['reason']:
            raise TimeRangeIsTooLargeError('Time range is too large for the provider_account!')

        self._check_response(response)

        return [
            ResourceValue(
                value=meter_data['energyKWh'],
                time=datetime(daily_data['year'], daily_data['month'], daily_data['day'], tzinfo=timezone.utc),
                unit=Unit.WATT,
            )
            for daily_data in response.json()['totalsList']
            for meter_data in daily_data['commodityTotalsList']
            if meter_data['commodityType'] == METER_TYPE_TO_LABEL[meter.type]
        ]

    def get_meters(self) -> List[Meter]:
        response = requests.get(GeoApiUrls.USER_SYSTEMS, headers=self.get_auth_headers())
        self._check_response(response)

        return [
            Meter(
                meter_id=user['systemId'],
                type=meter_type,
                name=user['name'],
            )
            for user in response.json()['users']
            for meter_type in (MeterType.ELECTRICITY, MeterType.GAS)
        ]
