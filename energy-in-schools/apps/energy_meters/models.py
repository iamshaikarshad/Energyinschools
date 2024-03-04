from datetime import datetime, timezone, timedelta
from typing import Any, List, Union

from django.db import models
from django.db.models import BooleanField
from django.core.validators import MinValueValidator
from enumfields import EnumField

from apps.energy_providers.models import EnergyProviderAccount
from apps.energy_providers.providers.abstract import MeterType, ProviderValidateError
from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.resources.models import PullSupportedResource, Resource
from apps.resources.types import DataCollectionMethod, ResourceChildType, ResourceValidationError, ResourceValue, \
    TimeResolution, Unit
from apps.smart_things_devices.types import DeviceStatus

Type = MeterType


class EnergyMeter(PullSupportedResource):
    class Meta:
        ordering = ('name',)
        unique_together = (
            'meter_id',
            'type',
            'provider_account',
        )

    sa: Union['EnergyMeter', Any]  # SQLAlchemy provided by aldjemy
    Type = Type

    resource_ptr = models.OneToOneField(
        to=Resource,
        parent_link=True,
        related_name=ResourceChildType.ENERGY_METER.value,
        on_delete=models.CASCADE
    )

    meter_id = models.CharField(max_length=36, blank=False, null=False)
    type = EnumField(Type, max_length=20, blank=False, null=False)
    is_half_hour_meter = BooleanField(null=True, default=None)
    minutes_delay = models.IntegerField(null=True, default=None, validators=[MinValueValidator(0)])
    live_values_meter = models.OneToOneField(
        to='self',
        on_delete=models.DO_NOTHING,
        related_name='hh_values_meter',
        null=True,
        default=None
    )

    provider_account = models.ForeignKey(
        EnergyProviderAccount,
        models.CASCADE,
        null=False,
        related_name='energy_meters'
    )

    STR_ATTRIBUTES = (
        meter_id,
        type,
        'provider_account_id',
        'name'
    )

    def save(self, *args, **kwargs):
        self.child_type = ResourceChildType.ENERGY_METER

        self.supported_data_collection_methods = self.provider_account.provider.data_collection_methods

        if DataCollectionMethod.PUSH in self.supported_data_collection_methods:
            self.preferred_data_collection_method = DataCollectionMethod.PUSH

        elif DataCollectionMethod.PULL in self.supported_data_collection_methods:
            self.preferred_data_collection_method = DataCollectionMethod.PULL

        self.unit = Unit.WATT
        self.detailed_time_resolution = TimeResolution.MINUTE
        self.long_term_time_resolution = TimeResolution.HALF_HOUR

        super().save(*args, **kwargs)

    def validate(self):
        try:
            self.provider_account.connection.validate_meter(self)
        except ProviderValidateError as exception:
            raise ResourceValidationError from exception

    def fetch_current_value(self) -> Union[ResourceValue, List[ResourceValue]]:
        return self.provider_account.connection.get_consumption(self)

    def fetch_tariff(self, tariff_id: str):
        return self.provider_account.connection.get_tariff(tariff_id)

    def fetch_historical_consumption(self, from_date: datetime, to_date: datetime = None,
                                     time_resolution: TimeResolution = TimeResolution.DAY) -> List[ResourceValue]:
        return self.provider_account.connection.get_historical_consumption(self, from_date, to_date, time_resolution)

    @property
    def connectivity_status(self) -> DeviceStatus:
        status = DeviceStatus.ONLINE
        try:
            if self.is_half_hour_meter:
                if not self.live_values_meter:
                    now = datetime.now()
                    yesterday = now - timedelta(days=1)
                    from_time = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
                    to_time = yesterday.replace(hour=23, minute=59, second=59, microsecond=0)
                    yesterday_values = LongTermHistoricalData.objects.filter(
                        resource_id=self.id,
                        time__gte=from_time,
                        time__lte=to_time
                    )
                    if len(yesterday_values) == 0:
                        status = DeviceStatus.OFFLINE
            else:
                last_value = DetailedHistoricalData.objects.filter(resource_id=self.id).latest('time')
                minutes_delay = timedelta(minutes=(self.minutes_delay or 0) + (10 if self.is_half_hour_meter is False else 0))

                if last_value.time < datetime.now(tz=timezone.utc) - self.detailed_time_resolution.duration - minutes_delay:
                    status = DeviceStatus.OFFLINE

        except DetailedHistoricalData.DoesNotExist:
            status = DeviceStatus.OFFLINE

        finally:
            return status
