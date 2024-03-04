from typing import TYPE_CHECKING, Tuple, Type

import funcy
from django.db import models
from encrypted_model_fields.fields import EncryptedCharField
from enumfields import Enum, EnumField
from safedelete.managers import SafeDeleteAllManager, SafeDeleteDeletedManager, SafeDeleteManager

from apps.energy_providers.providers.abstract import ProviderModelConfigContainer
from apps.energy_providers.providers.chameleon import ChameleonProviderConnection
from apps.energy_providers.providers.dummy import DummyProviderConnection
from apps.energy_providers.providers.energy_assets import EnergyAssetsProviderConnection
from apps.energy_providers.providers.geo import GeoProviderConnection
from apps.energy_providers.providers.hildebrand import HildebrandProviderConnection
from apps.energy_providers.providers.mqtt import MqttProviderConnection
from apps.energy_providers.providers.n3rgy import N3RGYProviderConnection
from apps.energy_providers.providers.ovo import OvoProviderConnection
from apps.energy_providers.providers.rest import RestProviderConnection
from apps.locations.models import Location
from apps.locations.querysets import InLocationSafeDeleteQuerySet
from apps.main.model_mixins import NameAndDescriptionMixin
from apps.main.models import SafeDeleteBaseModel
from apps.resources.types import DataCollectionMethod

if TYPE_CHECKING:
    from apps.energy_providers.providers.abstract import AbstractProviderConnection


class Provider(Enum):
    DUMMY = 'Dummy', DummyProviderConnection
    OVO = 'OVO', OvoProviderConnection
    GEO = 'GEO', GeoProviderConnection
    CHAMELEON = 'CHAMELEON', ChameleonProviderConnection
    N3RGY = 'N3RGY', N3RGYProviderConnection
    ENERGY_ASSETS = 'ENERGY_ASSETS', EnergyAssetsProviderConnection
    HILDEBRAND = 'HILDEBRAND', HildebrandProviderConnection

    def __new__(cls, value, connection_class):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._connection_class_ = connection_class
        return obj

    @property
    def connection_class(self) -> 'Type[AbstractProviderConnection]':
        return self._connection_class_

    @property
    def is_support_rest_api(self) -> bool:
        return issubclass(self.connection_class, RestProviderConnection)

    @property
    def is_support_mqtt(self) -> bool:
        return issubclass(self.connection_class, MqttProviderConnection)

    @property
    def is_dummy(self) -> bool:
        return self == Provider.DUMMY

    @funcy.cached_property
    @funcy.post_processing(tuple)
    def data_collection_methods(self) -> Tuple[DataCollectionMethod, ...]:
        if self.is_support_rest_api or self.is_dummy:
            yield DataCollectionMethod.PULL

        if self.is_support_mqtt:
            yield DataCollectionMethod.PUSH


class EnergyProviderAccount(SafeDeleteBaseModel, NameAndDescriptionMixin):  # todo: rename to EnergyProviderProfile
    class Meta:
        unique_together = ('location', 'name')

    objects = SafeDeleteManager.from_queryset(queryset_class=InLocationSafeDeleteQuerySet)()
    all_objects = SafeDeleteAllManager.from_queryset(queryset_class=InLocationSafeDeleteQuerySet)()
    deleted_objects = SafeDeleteDeletedManager.from_queryset(queryset_class=InLocationSafeDeleteQuerySet)()

    Provider = Provider

    provider: Provider = EnumField(Provider, max_length=20, blank=False, null=False)
    location = models.ForeignKey(Location, models.CASCADE, null=False, db_index=True)
    credentials = EncryptedCharField(max_length=1024, blank=False, null=False)
    session_payload = EncryptedCharField(max_length=1024)

    STR_ATTRIBUTES = (
        'name',
        'location_id',
        'provider',
    )

    @property
    def connection(self) -> 'AbstractProviderConnection':
        return self.get_connection_class(self.provider)(ProviderModelConfigContainer(self))

    @classmethod
    def get_connection_class(cls, provider: 'EnergyProviderAccount.Provider') -> 'Type[AbstractProviderConnection]':
        return provider.connection_class
