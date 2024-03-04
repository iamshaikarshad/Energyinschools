import random
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Union

from apps.energy_providers.providers.abstract import AbstractProviderConnection, Meter
from apps.resources.types import ResourceValue, Unit


if TYPE_CHECKING:
    from apps.energy_meters.models import EnergyMeter
    from apps.energy_providers.providers.abstract import Meter


class DummyProviderConnection(AbstractProviderConnection):
    def get_consumption(self, meter: 'Union[EnergyMeter, Meter]') -> ResourceValue:
        return ResourceValue(
            time=datetime.now(tz=timezone.utc),
            value=random.random() * 100 + abs((datetime.now().hour + 12) % 24 - 12) * 100,
            unit=Unit.WATT,
        )

    def validate(self):
        pass
