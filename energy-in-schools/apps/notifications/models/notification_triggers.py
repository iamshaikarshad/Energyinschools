import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, Iterator, List, Optional, Type, TypeVar, Union

import funcy
from aldjemy.orm import get_session
from django.db import models
from enumfields import Enum, EnumField
from sqlalchemy import Boolean, Column, DateTime, Interval, and_, case, func, over
from sqlalchemy.orm import Query
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.sql.elements import or_

from apps.energy_providers.providers.abstract import MeterType
from apps.historical_data.models import AbstractHistoricalData, DetailedHistoricalData
from apps.historical_data.utils.aggregation_params_manager import AggregationParamsManager
from apps.historical_data.utils.aggregations import TimeValuePair, aggregate_to_one, get_aggregate_by_time_query, \
    get_aggregate_to_list_query
from apps.learning_days.models import LearningDay
from apps.locations.models import Location
from apps.locations.querysets import InLocationQuerySet
from apps.main.models import BaseModel
from apps.notifications.types import *
from apps.resources.models import Resource
from apps.resources.types import ResourceChildType, ResourceValue, Unit
from apps.smart_things_devices.types import Capability


logger = logging.getLogger(__name__)

ModelType = TypeVar('ModelType', bound='ParentModelMixin')

DAILY_USAGE_RELATED_TO_DAYS = 5


class ParentModelMixin:
    Type: Type[Enum]
    type: Enum
    CHILD_MODELS_FIELDS_MAP = {}

    @property
    def concrete_instance(self: ModelType) -> ModelType:
        assert hasattr(self, self.CHILD_MODELS_FIELDS_MAP[self.type]), \
            f'"{self.__class__.__name__}" must have one to one field "{self.CHILD_MODELS_FIELDS_MAP[self.type]}"'

        return getattr(self, self.CHILD_MODELS_FIELDS_MAP[self.type])

    @classmethod
    def get_concrete_model_by_type(cls: Type[ModelType], type_: Enum) -> Type[ModelType]:
        assert hasattr(cls, cls.CHILD_MODELS_FIELDS_MAP[type_]), \
            f'"{cls.__name__}" must have one to one field "{cls.CHILD_MODELS_FIELDS_MAP[type_]}"'

        return getattr(cls, cls.CHILD_MODELS_FIELDS_MAP[type_]).related.related_model


class NotificationTrigger(ParentModelMixin, BaseModel):
    Type = TriggerType
    Condition = Condition
    MaxNotifyFrequency = MaxNotifyFrequency
    objects = InLocationQuerySet.as_manager()

    CHILD_MODELS_FIELDS_MAP = {
        Type.ELECTRICITY_CONSUMPTION_LEVEL: 'value_level',
        Type.GAS_CONSUMPTION_LEVEL: 'value_level',
        Type.TEMPERATURE_LEVEL: 'value_level',
        Type.DAILY_ELECTRICITY_USAGE: 'daily_usage',
        Type.DAILY_GAS_USAGE: 'daily_usage',
    }

    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=False)

    type = EnumField(Type, max_length=30)
    source_location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='source_for_triggers',
        null=True,
        default=None
    )
    source_resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='source_for_triggers',
        null=True,
        default=None
    )
    max_notification_frequency: Union[EnumField, MaxNotifyFrequency] = EnumField(MaxNotifyFrequency, max_length=30)

    active_days: Union[EnumField, ActiveDays] = EnumField(ActiveDays, max_length=20, default=ActiveDays.ALL_DAYS)

    active_time_range_start = models.TimeField(null=True)
    active_time_range_end = models.TimeField(null=True)

    is_active = models.BooleanField(default=True)
    name = models.CharField(max_length=128, blank=True)
    last_action_time = models.DateTimeField(default=None, null=True)

    @classmethod
    def process_all_triggers(cls):
        for notification_trigger in cls.objects.all():
            notification_trigger.process_trigger()

    def process_trigger(self):
        is_accepted_frequency = self.last_action_time is None or \
                                self.last_action_time < self.max_notification_frequency.get_current_period_start()
        if self.is_active and is_accepted_frequency and self._is_triggered():
            self._send_notification()

    def get_format_data(self) -> Dict[str, Any]:
        return dict(
            resource_name=self.source_resource.name if self.source_resource else None,
            location_name=self.source_location.name if self.source_resource else None,
            **self.concrete_instance.get_format_data(),
        )

    @classmethod
    def get_source_resources_query(
            cls,
            trigger_type: 'TriggerType',
            source_location: Location = None,
            source_resource: Resource = None
    ):
        queryset = Resource.objects.all()

        if source_resource:
            queryset = queryset.filter(id=source_resource.id)

        if source_location:
            queryset = queryset.in_location(source_location)

        if trigger_type in (
                TriggerType.ELECTRICITY_CONSUMPTION_LEVEL,
                TriggerType.DAILY_ELECTRICITY_USAGE
        ):
            queryset = queryset.filter(energy_meter__type=MeterType.ELECTRICITY)

        elif trigger_type in (
                TriggerType.GAS_CONSUMPTION_LEVEL,
                TriggerType.DAILY_GAS_USAGE,
        ):
            queryset = queryset.filter(energy_meter__type=MeterType.GAS)

        elif trigger_type is TriggerType.TEMPERATURE_LEVEL:
            queryset = queryset.filter(smartthingssensor__capability=Capability.TEMPERATURE)

        else:
            raise NotImplementedError

        return queryset

    @property
    def source_resources(self) -> List[Resource]:
        return list(self.get_source_resources_query(self.type, self.source_location, self.source_resource))

    def _send_notification(self):
        from apps.notifications.settings import WARNING_TITLES_BY_TRIGGER_TYPE, WARNING_MESSAGE_BY_TRIGGER_TYPE

        for notification_target in self.notification_targets.all():
            notification_target.send_notification(
                WARNING_TITLES_BY_TRIGGER_TYPE[self.type].format(**self.get_format_data()),
                WARNING_MESSAGE_BY_TRIGGER_TYPE[self.type].format(**self.get_format_data()),
            )

    def _is_triggered(self) -> bool:
        # noinspection PyProtectedMember
        return self.concrete_instance._is_triggered()

    def _save_action_log(self):
        from apps.notifications.models.notification_logs import NotificationEventLog

        self.last_action_time = datetime.now(tz=timezone.utc)
        self.save()
        NotificationEventLog.create_log_record(
            notification_trigger=self,
            event_time=self.last_action_time
        )

    def _get_active_period_query_filter(self, sa: Any) -> Iterator[Any]:
        if self.active_time_range_start:
            yield or_(
                func.date_part('hour', sa.time) > self.active_time_range_start.hour,
                and_(
                    func.date_part('hour', sa.time) == self.active_time_range_start.hour,
                    func.date_part('minute', sa.time) >= self.active_time_range_start.minute
                )
            )

        if self.active_time_range_end:
            yield or_(
                func.date_part('hour', sa.time) < self.active_time_range_end.hour,
                and_(
                    func.date_part('hour', sa.time) == self.active_time_range_end.hour,
                    func.date_part('minute', sa.time) < self.active_time_range_end.minute
                )
            )


class DailyUsageTrigger(NotificationTrigger):
    base_trigger = models.OneToOneField(
        to=NotificationTrigger,
        parent_link=True,
        related_name='daily_usage',
        on_delete=models.CASCADE
    )

    threshold_in_percents = models.FloatField(null=False)

    def get_format_data(self):
        return dict(
            value=self.threshold_in_percents
        )

    def _is_triggered(self) -> bool:
        average_usage = self._get_average_usage_until_this_time()
        today_usage = self._get_today_usage()

        is_triggered = \
            average_usage and today_usage and \
            (today_usage / average_usage - 1) * 100 > self.threshold_in_percents

        if is_triggered:
            self._save_action_log()

        return is_triggered

    def _get_today_usage(self) -> Optional[float]:
        start_of_the_day = datetime.now(tz=timezone.utc).replace(hour=0, minute=0, microsecond=0)
        try:
            return aggregate_to_one(
                resources=self.source_resources,
                unit=Unit.WATT_HOUR,
                from_=start_of_the_day
            ).value
        except NoResultFound:
            return None

    def _get_average_usage_until_this_time(self):
        days = self.get_days_for_comparison()
        now = datetime.now(tz=timezone.utc)

        if len(days) < DAILY_USAGE_RELATED_TO_DAYS:
            return None

        aggregation_rules = AggregationParamsManager().get_aggregation_rules(
            resources=self.source_resources,
            unit=Unit.WATT_HOUR,
        )
        sa = aggregation_rules.model.sa

        try:
            aggregate_by_time_query = get_aggregate_by_time_query(
                aggregation_rules=aggregation_rules
            ).filter(
                func.date(sa.time).in_(days),
                or_(
                    func.date_part('hour', sa.time) < now.hour,
                    and_(
                        func.date_part('hour', sa.time) == now.hour,
                        func.date_part('minute', sa.time) < now.minute
                    )
                )
            )

            query = get_aggregate_to_list_query(
                aggregate_by_time_query=aggregate_by_time_query,
                aggregation_rules=aggregation_rules
            )
            daily_usage: TimeValuePair = query.one()

            return daily_usage.value / DAILY_USAGE_RELATED_TO_DAYS

        except NoResultFound:
            return None

    def get_days_for_comparison(self):
        """Get list of days that will be used in filter"""

        today = datetime.now(tz=timezone.utc).date()

        # Select all learning days(queries did not executed)
        learning_days = LearningDay.objects \
            .filter(location=self.location, date__lt=today) \
            .order_by('-date') \
            .values_list('date', flat=True) \
            .all()

        # Handle different types of active_days followed enum types

        if self.active_days == ActiveDays.SCHOOL_DAYS:
            # Return last DAILY_USAGE_RELATED_TO_DAYS learning days for school_days type
            return learning_days[:DAILY_USAGE_RELATED_TO_DAYS]

        elif self.active_days == ActiveDays.NON_SCHOOL_DAYS:
            # init non_school_days and cursor day
            non_school_days = []
            cursor_day = (today - timedelta(days=1))

            for last_learning_day in learning_days:  # for reducing count of queries iterate over learning days
                while cursor_day > last_learning_day:  # non_school days will be if learning day greater than cursor day
                    non_school_days.append(cursor_day)  # Added new non_school day
                    cursor_day -= timedelta(days=1)  # Iterate to next day

                    if len(non_school_days) >= DAILY_USAGE_RELATED_TO_DAYS:  # Check non_school_days size
                        return non_school_days

                else:
                    cursor_day -= timedelta(days=1)  # iterate over days after while

            while len(non_school_days) < DAILY_USAGE_RELATED_TO_DAYS:  # Fill days if learning days is not enought
                non_school_days.append(cursor_day)
                cursor_day -= timedelta(days=1)

            return non_school_days

        else:  # return latest DAILY_USAGE_RELATED_TO_DAYS
            return [(today - timedelta(days=day_delta)) for day_delta in range(1, DAILY_USAGE_RELATED_TO_DAYS + 1)]


class ValueLevelTrigger(NotificationTrigger):
    base_trigger = models.OneToOneField(
        to=NotificationTrigger,
        parent_link=True,
        related_name='value_level',
        on_delete=models.CASCADE
    )

    condition = EnumField(Condition)
    argument = models.FloatField(null=False)
    min_duration = models.DurationField(null=True)

    def get_format_data(self):
        value = self.argument

        if self.type == self.Type.ELECTRICITY_CONSUMPTION_LEVEL:
            value /= 1000  # W -> kW

        return dict(
            operator=self.condition.value,
            value=value
        )

    def _is_triggered(self):
        is_today_school_day = bool(LearningDay.objects.filter(location=self.location, date=date.today()).count())
        if (self.active_days == ActiveDays.NON_SCHOOL_DAYS and is_today_school_day) or \
                (self.active_days == ActiveDays.SCHOOL_DAYS and not is_today_school_day):
            return False

        if not self.is_in_active_time_range():
            return False

        trigger = self._get_trigger_row()

        if trigger:
            self._save_action_log()
            return True

        return False

    def is_in_active_time_range(self):
        now = datetime.now(tz=timezone.utc).time()
        return \
            (self.active_time_range_start is None or self.active_time_range_start <= now) and \
            (self.active_time_range_end is None or self.active_time_range_end >= now)

    def _get_trigger_row(self):
        mark_edges_query = self._get_mark_edges_query(
            DetailedHistoricalData.sa,
            self._data_query_start_time,
            self._data_query_end_time
        )
        event_duration_query = self._get_event_duration_query(mark_edges_query)
        get_trigger_query = self._get_trigger_query(event_duration_query)
        trigger = get_trigger_query.first()
        return trigger

    @property
    def _data_query_start_time(self):
        if self.active_time_range_start:
            return max(
                # leave one hour bound for background jobs:
                self.max_notification_frequency.get_current_period_start() - timedelta(hours=1),
                datetime.combine(date=date.today(), time=self.active_time_range_start, tzinfo=timezone.utc)
            )

    @property
    def _data_query_end_time(self):
        if self.active_time_range_end:
            return datetime.combine(date=date.today(), time=self.active_time_range_end, tzinfo=timezone.utc)

    def _get_mark_edges_query(
            self,
            sa: Union[Any, 'AbstractHistoricalData'],
            start_time: datetime = None,
            end_time: datetime = None,
    ) -> Query:
        is_fit = funcy.rpartial(self.condition.operator, self.argument)
        # noinspection PyUnresolvedReferences
        mark_edges_query = sa.query(
            sa.time,
            is_fit(sa.value).label('is_fit'),
            func.coalesce(
                (is_fit(over(func.lead(sa.value), order_by=sa.time)) != is_fit(sa.value)) |
                (is_fit(over(func.lag(sa.value), order_by=sa.time)) != is_fit(sa.value)),
                True
            ).label('is_on_edge')
        ).filter(
            sa.resource_id.in_([resource.id for resource in self.source_resources]),
            *((sa.time >= start_time,) if start_time else ()),
            *((sa.time < end_time,) if end_time else ()),
            *self._get_active_period_query_filter(sa)
        )
        return mark_edges_query

    @staticmethod
    def _get_event_duration_query(mark_edges_query: Query) -> Query:
        time_field = Column(name='marked.time', type_=DateTime, quote=False).label('time')
        is_current_row_fit_col = Column(name='marked.is_fit', type_=Boolean, quote=False)
        is_on_edge_field = Column(name='marked.is_on_edge', type_=Boolean, quote=False)
        is_prev_row_fit_col = over(func.lag(is_current_row_fit_col), order_by=time_field)
        event_duration_query = get_session().query(
            time_field,
            case(
                (
                    (
                        and_(is_current_row_fit_col, is_prev_row_fit_col),  # if there two edges of fit range
                        time_field - over(func.lag(time_field), order_by=time_field)  # then calculate duration
                    ),
                    (
                        is_current_row_fit_col,  # if there only one edge of fit range
                        timedelta(0)  # then the duration is 0
                    ),
                ),
                else_=None,
            ).label('duration')
        ).select_from(
            mark_edges_query.subquery('marked')
        ).filter(
            is_on_edge_field
        )
        return event_duration_query

    def _get_trigger_query(self, event_duration_query: Query) -> Query:
        trigger_time_field = Column(name='durations.time', type_=DateTime, quote=False, key='time')
        duration_field = Column(name='durations.duration', type_=Interval, quote=False)
        get_trigger_query = get_session().query(
            trigger_time_field,
        ).select_from(
            event_duration_query.subquery('durations')
        ).filter(
            *((duration_field.isnot(None),)
              if self.min_duration is None else
              (duration_field >= self.min_duration,))
        ).order_by(
            trigger_time_field.desc()
        )
        return get_trigger_query


class AbnormalValueTrigger(BaseModel):
    """
    Class uses for providing notification to portal users (e.g. Admin) only
    Doesn't require any notification target (email or mobile number)
    """
    Type = AbnormalValueTriggerType

    type = EnumField(Type, max_length=20, unique=True)
    abnormal_max_value = models.FloatField(null=False, blank=False)
    abnormal_min_value = models.FloatField(null=False, blank=False)

    @staticmethod
    def get_trigger_for_resource(resource: Resource) -> 'Optional[AbnormalValueTrigger]':
        if resource.child_type in (ResourceChildType.ENERGY_METER,
                                   ResourceChildType.SMART_THINGS_ENERGY_METER):
            try:
                meter = getattr(resource, 'energy_meter', None) or \
                    getattr(resource, 'smart_things_energy_meter', None)
                
                if not meter:
                    return

                trigger_type = RESOURCE_TYPE_TO_ABNORMAL_VALUE_TRIGGER_TYPE__MAP[meter.type]

                trigger = AbnormalValueTrigger.objects.get(type=trigger_type)
                return trigger

            except AbnormalValueTrigger.DoesNotExist:
                logger.error(f'Abnormal value trigger for type {trigger_type} doesn\'t exist')

            except Exception as err:
                logger.error(
                    f'Error appeared while getting trigger for resource. Error: {str(err)}')

        return

    def check_value(self, resource: Resource, resource_value: ResourceValue):
        # Code wrapping with try-except blocks is really necessary because adding resource value to database
        # is one of the main feature and creating notification logs is just additional bonus for portal users
        try:
            value = resource_value.value

            if value <= self.abnormal_min_value or value >= self.abnormal_max_value:
                self.create_notification_log(value, resource)

        except Exception as err:
            logger.error(
                f'Error appeared while triggering abnormal value. Error: {str(err)}')

    def create_notification_log(self, abnormal_value: float, resource: Resource):
        from apps.notifications.models.notification_logs import UserNotificationEventLog
        from apps.notifications.serializers.notification_trigger import TriggerDataSerializer

        serializer = TriggerDataSerializer(data=dict(
            trigger_id=self.id,
            resource_id=resource.id,
            abnormal_value=abnormal_value,
        ))
        serializer.is_valid(True)

        notification_log = UserNotificationEventLog.objects.create(
            event_time=datetime.now(timezone.utc),
            location=resource.sub_location,
            trigger_data=serializer.data
        )
        return notification_log
