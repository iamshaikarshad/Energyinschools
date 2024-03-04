from enumfields import Enum

from apps.energy_providers.providers.abstract import MeterType
from apps.energy_tariffs.types import SingleTariff, DayNightTariff, DayEveningWeekendTariff,\
    DayNightEveningWeekendTariff, SchoolTOUTariff


BANK_VALIDATION_ERROR_MESSAGE = 'Bank information is not valid'


class MUGMeterType(Enum):
    GAS = 'gas'
    ELECTRIC = 'electric'


METER_TYPE__MUG_METER_TYPE__MAP = {
    MeterType.ELECTRICITY: MUGMeterType.ELECTRIC,
    MeterType.GAS: MUGMeterType.GAS,
}


class HHDataRequestErrorMessages(Enum):
    DATE_IN_FUTURE = 'This date can\'t be in future'
    TOO_BIG_INTERVAL = 'The interval between dates shouldn\'t be more than one year'
    INCORRECT_ORDER = 'Date FROM should be less than date TO!'


class PaymentType(Enum):
    MONTHLY_DIRECT_DEBIT = 'monthly_direct_debit'
    PAY_ON_RECEIPT_OF_BILL = 'pay_on_receipt_of_bill'


class SwitchStatus(Enum):
    SENT_TO_MUG = 'Sent to MUG', 0
    SUPPLIER_DOWNLOADED_CONTRACT = 'Supplier Downloaded Contract', 1
    SWITCH_ACCEPTED = 'Switch accepted', 2
    LIVE_SWITCH_COMPLETE = 'Live – Switch Complete', 3
    FAILED_CONTRACT = 'Failed contract', 3

    def __new__(cls, value, order):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._order_ = order
        return obj

    @property
    def order(self):
        return self._order_


class MUGMeterRateTypes(Enum):
    SINGLE = 'Single', 0, SingleTariff
    DAY_AND_NIGHT = 'DayAndNight', 1, DayNightTariff
    WEEKDAY_AND_EVENING_WEEKEND = 'WeekdayAndEveningWeekend', 2, DayEveningWeekendTariff
    WEEKDAY_AND_NIGHT_AND_EVENING_AND_WEEKEND = 'WeekdayAndNightAndEveningAndWeekend', 3, DayNightEveningWeekendTariff
    MUG_SCHOOL_TOU_TARIFF = 'MugSchoolTouTariff', 4, SchoolTOUTariff
    UNKNOWN = 'Unknown', 10, None

    def __new__(cls, value, order, related_tariff):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._order_ = order
        obj._related_tariff_ = related_tariff
        return obj

    @property
    def related_tariff(self):
        return self._related_tariff_


class MUGMeterRatePeriod(Enum):
    DAY = 'Day', 'day'
    NIGHT = 'Night', 'night'
    EVENING_AND_WEEKEND = 'Evening and Weekend', 'evening_and_weekend'
    PEAK = 'Peak', 'peak'

    def __new__(cls, value, period_name):
        obj = object.__new__(cls)
        obj._value_ = value
        obj._period_name_ = period_name
        return obj

    @property
    def period_name(self):
        return self._period_name_

PeriodsByRateType = {
    MUGMeterRateTypes.SINGLE.value: [MUGMeterRatePeriod.DAY],
    MUGMeterRateTypes.DAY_AND_NIGHT.value: [MUGMeterRatePeriod.DAY, MUGMeterRatePeriod.NIGHT],
    MUGMeterRateTypes.WEEKDAY_AND_EVENING_WEEKEND.value:
        [MUGMeterRatePeriod.DAY, MUGMeterRatePeriod.EVENING_AND_WEEKEND],
    MUGMeterRateTypes.WEEKDAY_AND_NIGHT_AND_EVENING_AND_WEEKEND.value:
        [MUGMeterRatePeriod.DAY, MUGMeterRatePeriod.NIGHT, MUGMeterRatePeriod.EVENING_AND_WEEKEND],
    MUGMeterRateTypes.MUG_SCHOOL_TOU_TARIFF.value:
        [MUGMeterRatePeriod.DAY, MUGMeterRatePeriod.NIGHT, MUGMeterRatePeriod.PEAK],
    MUGMeterRateTypes.UNKNOWN.value: []
}
