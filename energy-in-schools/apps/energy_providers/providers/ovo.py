from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Dict, List

import funcy
import requests

from apps.energy_providers.providers.abstract import Meter, MeterType, ProviderError, cache_meter_value
from apps.energy_providers.providers.rest import RestProviderConnection
from utilities.rest import RestSessionPayload
from apps.resources.types import TimeResolution


# todo: write unittests

class OvoApiUrls:
    LOGIN = 'https://my.ovoenergy.com/api/auth/login'
    ACCOUNTS = 'https://paym.ovoenergy.com/api/paym/accounts'
    LIVE_USAGE = 'https://live.ovoenergy.com/api/live/meters/{meter_id}/consumptions/instant'
    AGGREGATE_USAGE = 'https://live.ovoenergy.com/api/live/meters/{}/consumptions/aggregated?from={}&to={}' \
                      '&granularity={}'


TYPE_LABEL_TO_METER_TYPE = {
    'ELECTRICITY': MeterType.ELECTRICITY,
    'GAS': MeterType.GAS,
}


class OvoProviderConnection(RestProviderConnection):
    def login(self):
        response = requests.post(
            OvoApiUrls.LOGIN,
            json={'rememberMe': True, 'username': self.credentials.login, 'password': self.credentials.password},
            headers={'Content-type': 'application/json'}
        )
        self._check_response(response)

        json_data = response.json()
        return RestSessionPayload.from_custom_token(json_data['token'], timedelta(minutes=5))

    @cache_meter_value
    @funcy.retry(3)
    def get_consumption(self, meter_id: str) -> float:
        url = OvoApiUrls.LIVE_USAGE.format(meter_id=meter_id)
        response = requests.get(url, headers=self.get_auth_headers())

        if response.status_code != HTTPStatus.OK:
            raise ProviderError(response.text or response.status_code)

        return response.json()

    def get_historical_consumption(self, meter_id: str, from_date: datetime, to_date: datetime = None,
                                   time_resolution: TimeResolution = TimeResolution.HOUR) -> Dict[datetime, float]:
        raise NotImplementedError

    def get_meters(self) -> List[Meter]:
        response = requests.get(OvoApiUrls.ACCOUNTS, headers=self.get_auth_headers())

        return [
            Meter(
                type=TYPE_LABEL_TO_METER_TYPE[meter['utilityType']],
                meter_id=meter['mpan']
            )
            for account in response.json()
            for meter in account['consumers']
        ]
