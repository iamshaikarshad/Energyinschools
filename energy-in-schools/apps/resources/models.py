from datetime import datetime, timedelta, timezone
from typing import Any, Iterable, Optional, Sequence, TYPE_CHECKING, Tuple, Union, Collection

import django.db
import funcy
from django.apps import apps
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Q, QuerySet
from django.db.transaction import atomic
from enumfields import EnumField
from safedelete.managers import SafeDeleteAllManager, SafeDeleteDeletedManager, SafeDeleteManager

from apps.energy_providers.models import Provider
from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.constants import DETAILED_HISTORY_LIVE_TIME, MAX_MISSED_PERIODS_FOR_INTERPOLATION, \
    MAX_PERIODS_FOR_INTERPOLATION
from apps.locations.models import Location
from apps.locations.querysets import AbstractInLocationQuerySet, InSubLocationSafeDeleteQuerySet
from apps.main.models import SafeDeleteBaseModel
from apps.resources.types import DataCollectionMethod, InterpolationType, ResourceChildType, ResourceException, \
    ResourceState, ResourceValidationError, ResourceValue, TimeResolution, Unit
from utilities.interpolations import get_line_coefficients

if TYPE_CHECKING:
    from apps.historical_data.models import DetailedHistoricalData, AbstractHistoricalData


class Resource(SafeDeleteBaseModel):
    class Meta:
        ordering = ('name',)

    sa: 'Union[Resource, Any]'

    ChildType = ResourceChildType

    objects: AbstractInLocationQuerySet = \
        SafeDeleteManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()

    all_objects: AbstractInLocationQuerySet = \
        SafeDeleteAllManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()

    deleted_objects: AbstractInLocationQuerySet = \
        SafeDeleteDeletedManager.from_queryset(queryset_class=InSubLocationSafeDeleteQuerySet)()

    name = models.CharField(max_length=100, blank=False, db_index=True)  # some children require db_index
    description = models.TextField(blank=True)

    sub_location = models.ForeignKey(Location, on_delete=models.CASCADE, null=False)
    child_type: ResourceChildType = EnumField(ResourceChildType, max_length=40, null=False)

    supported_data_collection_methods: Collection[DataCollectionMethod] = ArrayField(EnumField(DataCollectionMethod))
    preferred_data_collection_method: DataCollectionMethod = EnumField(DataCollectionMethod)
    unit: Unit = EnumField(Unit, max_length=20)
    detailed_time_resolution: TimeResolution = EnumField(TimeResolution, null=True, max_length=20)
    long_term_time_resolution: TimeResolution = EnumField(TimeResolution, null=True, max_length=20)
    detailed_data_live_time = models.DurationField(default=DETAILED_HISTORY_LIVE_TIME, null=True)
    interpolation_type = EnumField(InterpolationType, default=InterpolationType.LINEAR)

    last_detailed_data_add_time = models.DateTimeField(default=None, null=True)
    last_long_term_data_add_time = models.DateTimeField(default=None, null=True)
    last_value = models.FloatField(null=True)

    def delete(self, **kwargs):
        DetailedHistoricalData = apps.get_model('historical_data.DetailedHistoricalData')
        LongTermHistoricalData = apps.get_model('historical_data.LongTermHistoricalData')

        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        DetailedHistoricalData.objects.filter(resource=self, time__lte=(today - timedelta(days=3))).delete()
        LongTermHistoricalData.objects.filter(resource=self, time__lte=(today - timedelta(days=180))).delete()

        super(Resource, self).delete(**kwargs)

    def save(self, **kwargs):
        self.supported_data_collection_methods = list(set(self.supported_data_collection_methods))

        if self.preferred_data_collection_method not in self.supported_data_collection_methods:
            raise ResourceException('Preferred data collection method not in the supported methods list!')

        if not self.detailed_time_resolution and not self.long_term_time_resolution:
            raise ResourceException('detailed_time_resolution or long_term_time_resolution must be specified!')

        super().save(**kwargs)

    def get_latest_value(self, *, until_to: datetime = None) -> Optional[ResourceValue]:
        if self.last_value is not None and \
                self._last_live_data_add_time and \
                (
                        # if the last data is for current or previous period then is the latest
                        timedelta()
                        <=
                        (
                                self.round_time_to_lower_discrete_period(
                                    until_to or datetime.now(tz=timezone.utc),
                                    self._live_time_resolution
                                ) -
                                self.round_time_to_lower_discrete_period(
                                    self._last_live_data_add_time,
                                    self._live_time_resolution
                                )
                        )
                        <=
                        self._live_time_resolution.duration

                ):
            return ResourceValue(
                time=self._last_live_data_add_time,
                value=self.last_value,
            )

        query = self._live_data.order_by('time')
        if until_to:
            query = query.filter(time__lte=until_to)

        return query.last()

    @property
    def smart_things_energy_meter(self):
        return getattr(
            getattr(self, ResourceChildType.SMART_THINGS_SENSOR.value),
            ResourceChildType.SMART_THINGS_ENERGY_METER.value
        )

    @property
    def abnormal_value_trigger(self):
        from apps.notifications.models.notification_triggers import AbnormalValueTrigger

        trigger = AbnormalValueTrigger.get_trigger_for_resource(self)
        return trigger

    def get_latest_state(self) -> Optional[ResourceState]:
        latest_value = self.get_latest_value()

        if not latest_value:
            return

        if self.unit.values_enum:
            state = self.unit.values_enum.from_int(int(latest_value.value))

        else:
            state = latest_value.value

        return ResourceState(
            time=latest_value.time,
            state=state,
            unit=self.unit,
        )

    def add_value(self, new_value: ResourceValue):
        abnormal_value_trigger = self.abnormal_value_trigger

        if abnormal_value_trigger:
            abnormal_value_trigger.check_value(self, new_value)

        new_value_timestamp = new_value.time.timestamp()
        target_time = datetime.fromtimestamp(
            self.round_timestamp_to_lower_discrete_period(new_value_timestamp, self._live_time_resolution),
            tz=timezone.utc
        )

        new_latest_value = None

        if self._live_time_resolution is TimeResolution.SECOND \
                or self.interpolation_type == InterpolationType.DISABLED:
            prev_value = None  # don't use interpolation when the time resolution is so high

        else:
            prev_value = self.get_latest_value(until_to=new_value.time)

            if prev_value:
                new_latest_value = self._interpolate_prev_values(prev_value, new_value, target_time)

        new_latest_value = self._interpolate_and_commit_new_value(
            prev_value,
            new_value,
            target_time
        ) or new_latest_value

        self._save_latest_value_to_resource(new_latest_value)

    def _interpolate_and_commit_new_value(
            self,
            latest_value: ResourceValue,
            new_value: ResourceValue,
            target_time: datetime,
    ) -> 'Optional[AbstractHistoricalData]':
        corrected_value = self._interpolate_new_value(
            latest_value,
            new_value,
            target_time,
        )

        if corrected_value is None:
            return

        try:
            return self._live_data.create(
                resource=self,
                time=target_time,
                value=corrected_value
            )
        except django.db.utils.IntegrityError as exception:
            if 'duplicate key value violates unique constraint' not in str(exception):
                raise

    def save_data_to_long_term_history(self, *, time_range_start: datetime = None, time_range_end: datetime = None):
        """
        Get all new value from detailed history and calculate average value for long term period
        """
        if not self.detailed_time_resolution or not self.long_term_time_resolution:
            return

        detailed_query, long_term_query = self._get_historical_data_query(time_range_start, time_range_end)

        new_values_query = detailed_query.order_by('time')
        latest = long_term_query.order_by('time').last()

        if latest:
            previous_detailed_value = new_values_query.filter(time__lte=latest.time).last()
            new_values_query = new_values_query.filter(time__gt=latest.time)
            period_start = latest.time + self.long_term_time_resolution.duration

        else:
            previous_detailed_value = new_values_query.first()

            period_start = self.round_time_to_lower_discrete_period(
                previous_detailed_value.time if previous_detailed_value else datetime.now(tz=timezone.utc),
                self.long_term_time_resolution
            )

            if period_start < previous_detailed_value.time:
                previous_detailed_value = None

        period_end = period_start + self.long_term_time_resolution.duration
        integral_per_period = 0
        value_exists = False
        latest_time = None

        for new_value, previous_new_value in funcy.with_prev(new_values_query.all(), previous_detailed_value):
            if new_value.time < period_start:
                continue

            while new_value.time >= period_end:  # XXX TODO refactor
                # unfinished sequence shouldn't be saved
                if value_exists:
                    if previous_new_value.time != period_end:
                        integral_per_period += \
                            self._get_integral_value(previous_new_value, new_value, period_start, period_end)

                    self.long_term_historical_data.create(
                        resource=self,
                        time=period_start,
                        value=integral_per_period / self.long_term_time_resolution.duration.total_seconds()
                    )
                    latest_time = period_start

                value_exists = False
                integral_per_period = 0
                period_start = period_end
                period_end += self.long_term_time_resolution.duration

            integral_per_period += self._get_integral_value(previous_new_value, new_value, period_start, period_end)
            value_exists = True

        if latest_time:
            self.last_long_term_data_add_time = latest_time
            self.save()

    @atomic
    def add_missed_data(self, values: Sequence[ResourceValue]):
        if not values:
            return

        values = sorted(values, key=lambda item: item.time)

        for value in values:
            self.add_value(value)

        self.save_data_to_long_term_history(
            time_range_start=self.round_time_to_lower_discrete_period(
                values[0].time - self.long_term_time_resolution.duration, self.long_term_time_resolution
            ),
            time_range_end=self.round_time_to_lower_discrete_period(
                values[-1].time + self.long_term_time_resolution.duration * 2, self.long_term_time_resolution
            ) - timedelta(milliseconds=1),
        )

    @staticmethod
    def round_timestamp_to_lower_discrete_period(timestamp: float, time_resolution: TimeResolution) -> float:
        time_period_in_seconds = time_resolution.duration.total_seconds()
        return timestamp // time_period_in_seconds * time_period_in_seconds

    @classmethod
    def round_time_to_lower_discrete_period(cls, a_time: datetime, time_resolution: TimeResolution) -> datetime:
        return datetime.fromtimestamp(
            cls.round_timestamp_to_lower_discrete_period(a_time.timestamp(), time_resolution),
            tz=a_time.tzinfo
        )

    @classmethod
    def get_resources_for_collecting_new_value(cls) -> 'Iterable[Resource]':
        for resource in cls.objects.all():
            if resource.preferred_data_collection_method != DataCollectionMethod.PULL:
                continue

            if resource.detailed_time_resolution:
                time_resolution = resource.detailed_time_resolution
                last_data_time = resource.last_detailed_data_add_time

            else:
                time_resolution = resource.long_term_time_resolution
                last_data_time = resource.last_long_term_data_add_time

            if not last_data_time or (datetime.now(tz=timezone.utc) - last_data_time) >= time_resolution.duration:
                yield resource

    @classmethod
    def get_resources_for_saving_values_for_long_term(cls) -> 'Iterable[Resource]':
        for resource in cls.objects.all():
            if not resource.detailed_time_resolution or \
                    not resource.long_term_time_resolution or \
                    not resource.last_detailed_data_add_time:
                continue

            if resource.child_type == ResourceChildType.ENERGY_METER and \
                    not resource.energy_meter.is_half_hour_meter:
                EnergyMeter = apps.get_model('energy_meters.EnergyMeter')
                try:
                    EnergyMeter.objects.get(live_values_meter=resource.id)
                    continue
                except EnergyMeter.DoesNotExist:
                    pass

            if not resource.last_long_term_data_add_time or (
                    resource.round_time_to_lower_discrete_period(
                        resource.last_long_term_data_add_time,
                        resource.long_term_time_resolution,
                    )
                    <
                    resource.round_time_to_lower_discrete_period(
                        resource.last_detailed_data_add_time,
                        resource.long_term_time_resolution,
                    )
            ):
                yield resource

    @property
    def _max_long_term_interpolation_range(self) -> timedelta:
        return self.long_term_time_resolution.duration

    @property
    def _live_time_resolution(self):
        return self.detailed_time_resolution or self.long_term_time_resolution

    @property
    def _live_data(self):
        if self.detailed_time_resolution:
            return self.detailed_historical_data
        else:
            return self.long_term_historical_data

    @property
    def _last_live_data_add_time(self):
        if self.detailed_time_resolution:
            return self.last_detailed_data_add_time
        else:
            return self.last_long_term_data_add_time

    @_last_live_data_add_time.setter
    def _last_live_data_add_time(self, value: datetime):
        if self.detailed_time_resolution:
            self.last_detailed_data_add_time = value
        else:
            self.last_long_term_data_add_time = value

    def _get_integral_value(
            self,
            left: 'Optional[DetailedHistoricalData]',
            right: 'DetailedHistoricalData',
            period_start: datetime,
            period_end: datetime
    ) -> float:
        if left and max(period_start - left.time,
                        right.time - period_end) < self._max_long_term_interpolation_range:
            if left.time < period_start or right.time > period_end:
                # if one row is out of the period we should interpolate the point on the end of the period
                # maximal interpolation range is equal to self._max_long_term_interpolation_range
                a, b = get_line_coefficients(
                    left.time.timestamp(),
                    left.value,
                    right.time.timestamp(),
                    right.value
                )
                left_time = max(period_start, left.time)
                left_value = a + b * left_time.timestamp()
                right_time = min(period_end, right.time)
                right_value = a + b * right_time.timestamp()

            else:
                left_time = left.time
                left_value = left.value
                right_time = right.time
                right_value = right.value

            return (left_value + right_value) / 2 * (right_time - left_time).total_seconds()

        elif right.time <= period_end:
            return right.value * (min(period_end, right.time) - period_start).total_seconds()

        else:
            return left.value * (period_end - left.time).total_seconds()

    def _interpolate_new_value(
            self,
            latest_value: Optional[ResourceValue],
            new_value: ResourceValue,
            target_time: datetime,
    ) -> Optional[float]:
        if latest_value and (new_value.time - latest_value.time) < \
                self._live_time_resolution.duration * MAX_PERIODS_FOR_INTERPOLATION:
            latest_value_timestamp = latest_value.time.timestamp()
            new_value_timestamp = new_value.time.timestamp()
            target_timestamp = target_time.timestamp()

            if latest_value_timestamp == target_timestamp or latest_value_timestamp >= target_timestamp:
                return None  # value for the time is already in the database

            a, b = get_line_coefficients(
                latest_value_timestamp,
                latest_value.value,
                new_value_timestamp,
                new_value.value
            )

            corrected_value = a + b * target_timestamp

        else:
            corrected_value = new_value.value

        return corrected_value

    def _interpolate_prev_values(
            self,
            latest_value: ResourceValue,
            new_value: ResourceValue,
            target_time: datetime
    ) -> 'Optional[AbstractHistoricalData]':
        """
        Example:
            | - start of each period
            n - new data

        period 1 | period 2| period 3| period 4
        ---------|---------|---------|---------
             ^   *          ^         ^-value for period 4
             ^              ^-value for period 3; *value for period 2 will be interpolated between this and period 1
             ^-value for period 1
        """
        missed_periods = int((target_time - latest_value.time) / self._live_time_resolution.duration) - 1

        if missed_periods > MAX_MISSED_PERIODS_FOR_INTERPOLATION:
            return

        new_latest_value = None

        for periods_offset in range(1, missed_periods + 1):
            new_latest_value = self._interpolate_and_commit_new_value(
                latest_value,
                new_value,
                latest_value.time + periods_offset * self._live_time_resolution.duration
            ) or new_latest_value

        return new_latest_value

    def _save_latest_value_to_resource(self, new_latest_value: 'Optional[AbstractHistoricalData]'):
        if not new_latest_value:
            return

        if self.detailed_time_resolution:
            # noinspection PyUnresolvedReferences
            time_field_name = self.__class__.last_detailed_data_add_time.field_name
        else:
            # noinspection PyUnresolvedReferences
            time_field_name = self.__class__.last_long_term_data_add_time.field_name

        if getattr(self, time_field_name) and getattr(self, time_field_name) >= new_latest_value.time:
            return

        setattr(self, time_field_name, new_latest_value.time)
        self.last_value = new_latest_value.value

        Resource.objects.filter(
            Q(**{time_field_name: None}) | Q(**{f'{time_field_name}__lt': new_latest_value.time}),
            id=self.id,
        ).update(
            last_value=new_latest_value.value,
            **{time_field_name: new_latest_value.time}
        )

    def _get_historical_data_query(self, time_range_start: datetime, time_range_end: datetime) \
            -> 'Tuple[QuerySet, QuerySet]':
        if time_range_start and time_range_end:
            time_range_middle = time_range_start + (time_range_end - time_range_start) / 2

            long_term_query = self.long_term_historical_data.filter(
                time__lte=time_range_middle
            )

            last_long_term_value = self.long_term_historical_data \
                .filter(time__gt=time_range_middle) \
                .order_by('time') \
                .first()

            if last_long_term_value:
                detailed_history_time_range_end = min(
                    time_range_end,
                    last_long_term_value.time + self.long_term_time_resolution.duration,
                )

            else:
                detailed_history_time_range_end = time_range_end

            detailed_query = self.detailed_historical_data \
                .filter(time__gte=time_range_start - self._max_long_term_interpolation_range,
                        time__lt=detailed_history_time_range_end)

        elif not (time_range_start or time_range_end):
            long_term_query = self.long_term_historical_data
            detailed_query = self.detailed_historical_data

        else:
            raise NotImplementedError
        return detailed_query, long_term_query

    @staticmethod
    def get_location_energy_meters(location: Location, meter_type: MeterType = None, include_dummy=False):
        queryset = Resource.objects.in_location(location=location).filter(
            Q(child_type=ResourceChildType.ENERGY_METER) |
            Q(child_type=ResourceChildType.SMART_THINGS_ENERGY_METER)
        ).filter(
            Q(energy_meter__type=meter_type) |
            Q(smart_things_sensor__smart_things_energy_meter__type=meter_type)
        )
        if not include_dummy:
            queryset = queryset.filter(
                ~Q(energy_meter__provider_account__provider=Provider.DUMMY) &
                ~Q(smart_things_sensor__smart_things_energy_meter__provider_account__provider=Provider.DUMMY)
            )
        return queryset


class PullSupportedResource(Resource):
    class Meta:
        abstract = True

    def fetch_current_value(self) -> ResourceValue:
        raise NotImplementedError

    def fetch_values(self) -> Iterable[ResourceValue]:
        current_value = self.fetch_current_value()
        return [current_value] if type(current_value) is not list else current_value

    def collect_new_values(self):
        for new_value in self.fetch_values():
            self.add_value(new_value)

    def validate(self):
        try:
            self.fetch_current_value()

        except Exception as exception:
            raise ResourceValidationError from exception
