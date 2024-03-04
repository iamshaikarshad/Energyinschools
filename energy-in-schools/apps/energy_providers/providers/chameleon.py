from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Union

import funcy
import requests
from requests import RequestException

from apps.energy_providers.providers.abstract import AbstractProviderConnection, Meter, ProviderCredentials, \
    RETRY_COUNT, \
    SECONDS_BETWEEN_ATTEMPTS, UnknownProviderRequestError
from apps.resources.types import ResourceDataNotAvailable, ResourceValue


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter


class ChameleonApiUrls:
    USAGE = 'https://chiotests-fkdeov345.mybluemix.net/raw/api/cad/events'


CHAMELEON_REQUEST_TIMEDELTA = timedelta(
    minutes=10)  # XXX TODO should be discussed and accepted by Chameleon team


class ChameleonProviderConnection(AbstractProviderConnection):
    credentials_class = ProviderCredentials

    @classmethod
    @funcy.cache(CHAMELEON_REQUEST_TIMEDELTA)
    def call_api(cls):
        """
            moved api call to separate method for creating cache
        :return:
            cached parsed response
        """
        response = requests.post(
            ChameleonApiUrls.USAGE,
            json={
                'eventType': 'power',
                'timestamp': int(datetime.now().timestamp())
            },
            headers={'Authorization': 'Basic cmF3ZGF0YXRlc3QxOkFMUVAxMjNeRCTCoy4+Zm9yMQ=='}  # XXX TODO move to attr
        )  # XXX TODO Handle 4xx

        values = list(
            reversed([entry for doc in response.json()['result']['docs'] for entry in doc['payload']['power']]))

        return values

    @funcy.retry(RETRY_COUNT, (UnknownProviderRequestError, RequestException, ResourceDataNotAvailable),
                 SECONDS_BETWEEN_ATTEMPTS)
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        """

        Retry on MeterDataNotFound is required because a response with an empty power field can be returned at the
        first attempt.
        """

        try:
            fetched_value = self.call_api().pop()  # XXX TODO pass meter ID for request NOW Chameleon did not implement it
            live_power_in_watts = fetched_value['power']  # XXX TODO replace it
            power_timestamp = fetched_value['time']

            return ResourceValue(value=live_power_in_watts,
                                 time=datetime.fromtimestamp(power_timestamp),
                                 )

        except Exception:  # XXX TODO REPLACE
            raise ResourceDataNotAvailable('Data not available')

    def validate(self):
        """
        XXX TODO ADD VALIDATION
        :return:
        """
        pass
