from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Union

import funcy
import requests
from requests import RequestException

from apps.energy_providers.providers.abstract import Meter, RETRY_COUNT, SECONDS_BETWEEN_ATTEMPTS, \
    UnknownProviderRequestError
from apps.energy_providers.providers.rest import RestProviderConnection
from utilities.rest import RestSessionPayload
from apps.resources.types import ResourceDataNotAvailable, ResourceValue, Unit


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter


class N3RGYApiUrls:
    USAGE = 'https://sandboxapi.data.n3rgy.com/{meter_id}/{energy_type}/{resource}/{element}'
    API_KEYS = 'https://customer.data.n3rgy.com/api/keys'


N3RGY_REQUEST_TIMEDELTA = timedelta(minutes=10)  # XXX TODO should be discussed and accepted by N3RGY team


class N3RGYProviderConnection(RestProviderConnection):

    def login(self):
        response = requests.get(
            N3RGYApiUrls.API_KEYS,
            params={
                'email': self.credentials.login,
                'state': 'active'  # XXX TODO REMOVE HARDCODED PARAM
            }
        )
        self._check_response(response)
        json_data = response.json()
        return RestSessionPayload.from_custom_token(
            json_data[0]['token'],
            timedelta(days=360)
        )  # XXX TODO PARSE FROM RESPONSE

    @classmethod
    @funcy.cache(N3RGY_REQUEST_TIMEDELTA)
    def call_api(cls,
                 meter_id,
                 token,
                 energy_type: str = 'ELECTRICITY',  # todo: make constant!
                 resource: str = 'CONSUMPTION',  # todo: make constant!
                 element=1,
                 _from: datetime = (datetime.now() - timedelta(minutes=10)),
                 _to: datetime = datetime.now(),
                 granularity='halfhour'
                 ):
        """
        moved api call to separate method for creating cache
    :return:
        cached parsed response
        curl "https://sandboxapi.data.n3rgy.com/1234567891000/electricity/consumption/1?start=20130501&end=20130514?granularity=day" -H "authorization: bcb5bc36-6826-430d-9cda-e7785d1500d0"
        """
        response = requests.get(
            N3RGYApiUrls.USAGE.format(
                meter_id=meter_id,
                energy_type=energy_type.lower(),
                resource=resource.lower(),
                element=element
            ),
            headers={
                'Authorization': f'{token}',
            },
            params={
                'start': f"{_from.year}{_from.month}{_from.day}{_from.hour}{_from.minute}",
                'end': f"{_to.year}{_to.month}{_to.day}{_to.hour}{_to.minute}",
                'granularity': granularity
            },
        )
        cls._check_response(response)

        content = response.json()['consumptions']

        return list(reversed([entry['value'] for entry in content]))  # XXX TODO CAN NOT FIT IN TIME

    @funcy.retry(RETRY_COUNT, (UnknownProviderRequestError, RequestException, ResourceDataNotAvailable),
                 SECONDS_BETWEEN_ATTEMPTS)
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        try:
            token = self.get_auth_token()
            fetched_value = self.call_api(meter.meter_id, token, energy_type=meter.type.value).pop()
            if not fetched_value:
                self.call_api.invalidate()
                fetched_value = self.call_api(meter.meter_id, token, energy_type=meter.type.value).pop()

            return ResourceValue(value=fetched_value, time=datetime.now(), unit=Unit.WATT)

        except IndexError:
            raise ResourceDataNotAvailable('Data not available')
