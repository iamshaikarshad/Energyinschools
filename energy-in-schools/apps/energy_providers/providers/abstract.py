import json
from abc import ABCMeta, abstractmethod
from datetime import datetime, timedelta
from typing import List, NamedTuple, Optional, TYPE_CHECKING, Union

import funcy
from enumfields import Enum

from apps.resources.types import ResourceDataNotAvailable, ResourceValue, TimeResolution


if TYPE_CHECKING:
    from apps.energy_providers.models import EnergyProviderAccount
    from apps.energy_meters.models import EnergyMeter

METER_VALUE_CACHE = timedelta(seconds=1)
ENERGY_METER_CACHE = timedelta(minutes=1)
RETRY_COUNT = 3
SECONDS_BETWEEN_ATTEMPTS = timedelta(milliseconds=300).total_seconds()


class ProviderError(Exception):
    pass


class UnknownProviderRequestError(ProviderError):
    pass


class ProviderAuthError(ProviderError):
    pass


class ProviderValidateError(ProviderError):
    pass


class TimeResolutionIsUnsupportedError(ProviderError):
    pass


class TimeRangeIsTooLargeError(ProviderError):
    pass


class MeterType(Enum):
    ELECTRICITY = 'ELECTRICITY'
    GAS = 'GAS'
    SOLAR = 'SOLAR'
    SMART_PLUG = 'SMART_PLUG'
    UNKNOWN = 'UNKNOWN'


class Meter(NamedTuple):
    meter_id: str
    type: MeterType
    provider_account_id: int = None

    name: Optional[str] = None
    description: Optional[str] = None

    def get_only_unique_fields(self: 'Union[EnergyMeter, Meter]') -> 'Meter':
        return Meter(
            meter_id=self.meter_id,
            type=self.type,
            provider_account_id=self.provider_account_id,
        )

    @funcy.cache(ENERGY_METER_CACHE)
    def get_energy_meter(self) -> 'EnergyMeter':
        from apps.energy_meters.models import EnergyMeter

        return EnergyMeter.objects.get(
            meter_id=self.meter_id,
            type=self.type,
            provider_account_id=self.provider_account_id,
        )


class ProviderConfigContainer:
    def __init__(self, credentials: str = None):
        self.session_payload: str = None
        self.credentials: str = credentials


class ProviderModelConfigContainer(ProviderConfigContainer):
    def __init__(self, instance: 'EnergyProviderAccount'):
        object.__init__(self)
        self.__instance = instance

    @property
    def session_payload(self) -> Optional[str]:
        return self.__instance.session_payload

    @session_payload.setter
    def session_payload(self, session_payload: str):
        self.__instance.session_payload = session_payload
        self.__instance.save()

    @property
    def credentials(self) -> str:
        return self.__instance.credentials


class ProviderCredentials(NamedTuple):
    login: str
    password: str

    @staticmethod
    def from_json(json_data: str):
        return ProviderCredentials(**json.loads(json_data))

    def to_json(self):
        return json.dumps(self._asdict())


class AbstractProviderConnection(metaclass=ABCMeta):
    session_payload_class = None
    credentials_class = ProviderCredentials
    supported_time_resolutions = frozenset()

    def __init__(self, config_container: ProviderConfigContainer):
        self.__config_container = config_container

    @abstractmethod
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        pass

    def get_historical_consumption(self, meter: 'Union[EnergyMeter, Meter]',
                                   from_date: datetime, to_date: Optional[datetime] = None,
                                   time_resolution: TimeResolution = TimeResolution.DAY) \
            -> List[ResourceValue]:
        return []  # this method is not required any more

    def get_meters(self) -> List[Meter]:
        return []

    @abstractmethod
    def validate(self):
        pass

    def validate_meter(self, meter: 'Union[EnergyMeter, Meter]'):
        try:
            self.get_consumption(meter)
        except (ProviderError, ResourceDataNotAvailable) as error:
            raise ProviderValidateError from error

    @property
    def _session_payload(self):
        if self.__config_container.session_payload:
            return self.session_payload_class.from_json(self.__config_container.session_payload)

    @_session_payload.setter
    def _session_payload(self, session_payload):
        self.__config_container.session_payload = session_payload.to_json()

    @property
    def credentials(self):
        return self.credentials_class.from_json(self.__config_container.credentials)

    def _validate_time_resolution(self, time_resolution: TimeResolution):
        if time_resolution not in self.supported_time_resolutions:
            raise TimeResolutionIsUnsupportedError


def cache_meter_value(func):
    def cache_key(_, meter: 'EnergyMeter', *args, **kwargs):
        keys = (meter.meter_id, meter.type, meter.provider_account_id)

        if args:
            keys += args

        if kwargs:
            keys += tuple(sorted(kwargs.items()))

        return keys

    return funcy.cache(METER_VALUE_CACHE, cache_key)(func)
