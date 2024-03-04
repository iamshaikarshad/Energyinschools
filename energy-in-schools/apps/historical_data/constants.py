from datetime import timedelta


LATEST_VALUE_AGGREGATION_TIME = timedelta(minutes=15)
DETAILED_HISTORY_LIVE_TIME = timedelta(days=4)
MAX_MISSED_PERIODS_FOR_INTERPOLATION = 19
MAX_PERIODS_FOR_INTERPOLATION = MAX_MISSED_PERIODS_FOR_INTERPOLATION + 2  # + current and next periods
EXPORT_ENERGY_DATA_RANGE_LIMIT_DAYS = 365
ENERGY_DATA_EXPORT_ACCEPTED_FORMATS = ('csv', 'json')