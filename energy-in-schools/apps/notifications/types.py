import operator
from datetime import datetime, timedelta, timezone

from enumfields import Enum, EnumField

from apps.energy_providers.providers.abstract import MeterType


class NotificationStatus(Enum):
    ACTIVE = 'active'
    RESOLVED = 'resolved'


class NotificationsType(Enum):
    ACTIVE = 'active', None
    EXPIRED = 'expired', timedelta(days=3)

    def __new__(cls, value, expiration_period):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._expiration_period_ = expiration_period

        return obj

    @property
    def expiration_period(self):
        return self._expiration_period_


class TriggerType(Enum):
    ELECTRICITY_CONSUMPTION_LEVEL = 'electricity_consumption_level'
    GAS_CONSUMPTION_LEVEL = 'gas_consumption_level'
    TEMPERATURE_LEVEL = 'temperature_level'

    DAILY_ELECTRICITY_USAGE = 'daily_electricity_usage'
    DAILY_GAS_USAGE = 'daily_gas_usage'


TRIGGER_DATA_RESPONSE_MESSAGE = 'Abnormal value ({}) appeared for resource {} ({})'
SUBSCRIPTION_RESPONSE_MESSAGE = '{} was successfully {} (daily report emails)'


class AbnormalValueTriggerType(Enum):
    """Default abnormal values is provided by Tim (Slack) - 10/12/19
       Tim asked to change gas value to 500kW (Slack) - 29/01/20
    """
    ELECTRICITY = 'electricity', 2_000_000, -1
    GAS = 'gas', 500_000, -1
    SOLAR = 'solar', 2_000_000, -1
    SMART_PLUG = 'smart_plug', 2_000_000, -1,
    UNKNOWN = 'unknown', 2_000_000, -1

    def __new__(cls, value, abnormal_max_value, abnormal_min_value):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._abnormal_max_value_ = abnormal_max_value
        obj._abnormal_min_value_ = abnormal_min_value

        return obj

    @property
    def abnormal_max_value(self):
        return self._abnormal_max_value_

    @property
    def abnormal_min_value(self):
        return self._abnormal_min_value_


class Condition(Enum):
    GREATER = 'greater', operator.gt
    LESS = 'less', operator.lt

    def __new__(cls, value, duration):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._operator_ = duration
        return obj

    @property
    def operator(self):
        return self._operator_


class MaxNotifyFrequency(Enum):
    ONE_PER_HOUR = 'one_per_hour', timedelta(hours=1)
    ONE_PER_DAY = 'one_per_day', timedelta(days=1)

    def __new__(cls, value: str, period_duration: timedelta):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._period_duration_ = period_duration
        return obj

    @property
    def period_duration(self):
        """
        It is used for cut data set before aggregations
        :return:
        """
        return self._period_duration_

    def get_current_period_start(self):
        return datetime.fromtimestamp(
            (datetime.now(tz=timezone.utc).timestamp() //
             self.period_duration.total_seconds() *
             self.period_duration.total_seconds()),
            tz=timezone.utc
        )


class ActiveDays(Enum):
    SCHOOL_DAYS = 'school_days'
    NON_SCHOOL_DAYS = 'non_school_days'
    ALL_DAYS = 'all_days'


RESOURCE_TYPE_TO_ABNORMAL_VALUE_TRIGGER_TYPE__MAP = {
    MeterType.ELECTRICITY: AbnormalValueTriggerType.ELECTRICITY,
    MeterType.GAS: AbnormalValueTriggerType.GAS,
    MeterType.SOLAR: AbnormalValueTriggerType.SOLAR,
    MeterType.SMART_PLUG: AbnormalValueTriggerType.SMART_PLUG,
    MeterType.UNKNOWN: AbnormalValueTriggerType.UNKNOWN
}
