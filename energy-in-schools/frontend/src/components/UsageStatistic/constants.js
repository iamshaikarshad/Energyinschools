import moment from 'moment';

import { ENERGY_DATA, MICROBIT_STATISTIC_DATA, TEMPERATURE_STATISTIC_DATA } from '../../constants/actionTypes';
import { SMART_THINGS_SENSOR_CAPABILITY, TIME_RESOLUTION } from '../../constants/config';

export const energyTypeTab = Object.freeze({
  electricity: 'electricity',
  gas: 'gas',
  smartPlug: 'smart plug',
  solar: 'solar',
  unknown: 'unknown',
});

export const MIN_POINTS_COUNT_TO_DISPLAY_BRUSH = 60; // one hour if time resolution = minute
export const MAX_POINTS_COUNT_TO_DISPLAY_BRUSH = 1440; // one day if time resolution = minute

export const MAX_HISTORICAL_DATA_LENGTH_NOT_TO_FILTER = 360;

export const PERIOD = Object.freeze({
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
});

export const PERIOD_LABEL = Object.freeze({
  [PERIOD.day]: 'Days',
  [PERIOD.week]: 'Weeks',
  [PERIOD.month]: 'Months',
  [PERIOD.year]: 'Years',
});

export const PERIODS = Object.values(PERIOD).map(value => ({ value, label: PERIOD_LABEL[value] }));

export const CUSTOM_PERIOD = 'custom';

export const CUSTOM_PERIOD_LABEL = 'Custom';

export const CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION = Object.freeze({
  [TIME_RESOLUTION.minute]: {
    value: TIME_RESOLUTION.minute,
    label: 'Minutes',
  },
  [TIME_RESOLUTION.halfHour]: {
    value: TIME_RESOLUTION.halfHour,
    label: 'Half-hours',
  },
  [TIME_RESOLUTION.hour]: {
    value: TIME_RESOLUTION.hour,
    label: 'Hours',
  },
  [TIME_RESOLUTION.day]: {
    value: TIME_RESOLUTION.day,
    label: 'Days',
  },
  [TIME_RESOLUTION.week]: {
    value: TIME_RESOLUTION.week,
    label: 'Weeks',
  },
  [TIME_RESOLUTION.month]: {
    value: TIME_RESOLUTION.month,
    label: 'Months',
  },
  [TIME_RESOLUTION.year]: {
    value: TIME_RESOLUTION.year,
    label: 'Years',
  },
});

export const CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS = Object.freeze({
  year: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.year],
  ],
  yearMonth: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.year],
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.month],
  ],
  month: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.month],
  ],
  monthDay: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.month],
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.day],
  ],
  day: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.day],
  ],
  dayHour: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.day],
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.hour],
  ],
  hour: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.hour],
  ],
  halfHourHourDayMonth: [
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.halfHour],
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.hour],
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.day],
    CUSTOM_PERIOD_TIME_RESOLUTION_SELECT_OPTION[TIME_RESOLUTION.month],
  ],
});

export const TIME_RESOLUTION_BY_CUSTOM_PERIOD_DURATION_DETERMINE_RULES = [ // the order of rules is important!
  {
    getCountFromMomentObjFuncName: 'asDays',
    getResolutionByCountRulesConfigs: [
      {
        checkingConditionRule: value => value <= 1,
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.hour,
      },
      {
        checkingConditionRule: value => (value > 1 && value <= 5), // 5 days = 120 hours - max bars count to display
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.dayHour,
      },
    ],
  },
  {
    getCountFromMomentObjFuncName: 'asMonths',
    getResolutionByCountRulesConfigs: [
      {
        checkingConditionRule: value => value <= 1,
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.day,
      },
      {
        checkingConditionRule: value => (value > 1 && value <= 4), // 4 months = 120 days - max bars count to display
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.monthDay,
      },
    ],
  },
  {
    getCountFromMomentObjFuncName: 'asYears',
    getResolutionByCountRulesConfigs: [
      {
        checkingConditionRule: value => value <= 1,
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.month,
      },
      {
        checkingConditionRule: value => (value > 1 && value <= 8), // 8 years = 96 months - max bars count to display
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.yearMonth,
      },
      {
        checkingConditionRule: value => value > 8,
        valueToReturnOnSuccess: CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.year,
      },
    ],
  },
];

export const COMMON_COMPARISON = Object.freeze({
  disabled: 'disabled',
  one_period: 'one_period',
  two_periods: 'two_periods',
  three_periods: 'three_periods',
});

export const COMMON_COMPARISONS = Object.values(COMMON_COMPARISON);

export const COMMON_COMPARISON_OPTION = Object.freeze({
  [COMMON_COMPARISON.disabled]: {
    key: COMMON_COMPARISON.disabled,
    label: () => 'Disabled',
    getValue: () => 0,
  },
  [COMMON_COMPARISON.one_period]: {
    key: COMMON_COMPARISON.one_period,
    label: period => `One ${period} ago`,
    getValue: () => 1,
  },
  [COMMON_COMPARISON.two_periods]: {
    key: COMMON_COMPARISON.two_periods,
    label: period => `Two ${period}s ago`,
    getValue: () => 2,
  },
  [COMMON_COMPARISON.three_periods]: {
    key: COMMON_COMPARISON.three_periods,
    label: period => `Three ${period}s ago`,
    getValue: () => 3,
  },
});

export const COMPARISON_DEFAULT_STATE = Object.freeze({
  key: COMMON_COMPARISON.disabled,
  value: COMMON_COMPARISON_OPTION[COMMON_COMPARISON.disabled].getValue(),
});

export const COMMON_COMPARISON_OPTIONS = Object.values(COMMON_COMPARISON_OPTION);

export const PREDEFINED_COMPARISON = Object.freeze({
  sameDayWeekAgo: 'sameDayWeekAgo',
  sameDayMonthAgo: 'sameDayMonthAgo',
  sameDayYearAgo: 'sameDayYearAgo',
  sameMonthYearAgo: 'sameMonthYearAgo',
});

export const COMPARISON = Object.freeze({
  ...COMMON_COMPARISON,
  ...PREDEFINED_COMPARISON,
});

export const PREDEFINED_COMPARISONS = Object.values(PREDEFINED_COMPARISON);

export const PREDEFINED_COMPARISON_OPTION = Object.freeze({
  [PREDEFINED_COMPARISON.sameDayWeekAgo]: {
    key: PREDEFINED_COMPARISON.sameDayWeekAgo,
    label: 'A week ago',
    getValue: () => 7,
  },
  [PREDEFINED_COMPARISON.sameDayMonthAgo]: {
    key: PREDEFINED_COMPARISON.sameDayMonthAgo,
    label: 'A month ago',
    getValue: () => {
      const dateToStartCount = moment().startOf('day');
      const targetDate = dateToStartCount.clone().subtract(1, 'months').startOf('day');
      return dateToStartCount.diff(targetDate, 'days');
    },
  },
  [PREDEFINED_COMPARISON.sameDayYearAgo]: {
    key: PREDEFINED_COMPARISON.sameDayYearAgo,
    label: 'A year ago',
    getValue: () => {
      const dateToStartCount = moment().startOf('day');
      const targetDate = dateToStartCount.clone().subtract(1, 'years').startOf('day');
      return dateToStartCount.diff(targetDate, 'days');
    },
  },
  [PREDEFINED_COMPARISON.sameMonthYearAgo]: {
    key: PREDEFINED_COMPARISON.sameMonthYearAgo,
    label: 'A year ago',
    getValue: () => {
      const dateToStartCount = moment().startOf('month');
      const targetDate = dateToStartCount.clone().subtract(1, 'years').startOf('month');
      return dateToStartCount.diff(targetDate, 'months');
    },
  },
});

export const COMPARISON_OPTION = Object.freeze({
  ...COMMON_COMPARISON_OPTION,
  ...PREDEFINED_COMPARISON_OPTION,
});

export const CUSTOM_COMPARISON = Object.freeze({
  selectDay: 'selectDay',
  selectMonth: 'selectMonth',
});

export const CUSTOM_COMPARISONS = Object.values(CUSTOM_COMPARISON);

export const CUSTOM_COMPARISON_OPTION = Object.freeze({
  [CUSTOM_COMPARISON.selectDay]: {
    key: CUSTOM_COMPARISON.selectDay,
    label: 'Select day',
    getValue: (comparisonDate, dateToStartCount) => moment(dateToStartCount).startOf('day').diff(moment(comparisonDate).startOf('day'), 'days'),
  },
  [CUSTOM_COMPARISON.selectMonth]: {
    key: CUSTOM_COMPARISON.selectMonth,
    label: 'Select month',
    getValue: (comparisonDate, dateToStartCount) => moment(dateToStartCount).startOf('month').diff(moment(comparisonDate).startOf('month'), 'months'),
  },
});

export const PERIOD_CUSTOM_COMPARISON_OPTION = Object.freeze({
  [PERIOD.day]: CUSTOM_COMPARISON_OPTION[CUSTOM_COMPARISON.selectDay],
  [PERIOD.month]: CUSTOM_COMPARISON_OPTION[CUSTOM_COMPARISON.selectMonth],
});

export const PERIOD_PREDEFINED_COMPARISON_OPTIONS = Object.freeze({
  [PERIOD.day]: [
    PREDEFINED_COMPARISON_OPTION[PREDEFINED_COMPARISON.sameDayWeekAgo],
    PREDEFINED_COMPARISON_OPTION[PREDEFINED_COMPARISON.sameDayMonthAgo],
    PREDEFINED_COMPARISON_OPTION[PREDEFINED_COMPARISON.sameDayYearAgo],
  ],
  [PERIOD.month]: [
    PREDEFINED_COMPARISON_OPTION[PREDEFINED_COMPARISON.sameMonthYearAgo],
  ],
});

export const CHART_COMPONENT_DATA_KEY = Object.freeze({
  cmpValue: 'cmp_value',
  highlightValue: 'highlightValue',
  value: 'value',
});

export const CHART_COMPONENT_DATA_KEY_TOOLTIP_LABEL_KEY_MAP = Object.freeze({
  [CHART_COMPONENT_DATA_KEY.value]: 'mainDataDateLabel',
  [CHART_COMPONENT_DATA_KEY.cmpValue]: 'comparisonDataDateLabel',
});

export const HISTORICAL_BY_LOCATION = {
  energy: {
    path: '/energy-meters/aggregated-consumption/historical/',
    eventType: ENERGY_DATA.historyByLocation,
  },
  temperature: {
    path: '/smart-things/sensors/aggregated-data/historical/',
    eventType: TEMPERATURE_STATISTIC_DATA.historyByLocation,
    queryParams: { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  },
};

export const HISTORICAL_FOR_METER = {
  energy: {
    path: '/resources/{id}/data/historical/',
    eventType: ENERGY_DATA.historyByMeter,
  },
  temperature: {
    path: '/smart-things/sensors/{id}/data/historical/',
    eventType: TEMPERATURE_STATISTIC_DATA.historyByMeter,
    queryParams: { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  },
  microbit: {
    path: '/storage/historical/{id}/data/historical/',
    eventType: MICROBIT_STATISTIC_DATA.historyByMeter,
  },
  resource: {
    path: '/resources/{id}/data/historical/',
    eventType: null,
  },
};

export const TOTAL_HISTORICAL_FOR_METER = {
  energy: {
    path: '/resources/{id}/data/total/',
    eventType: ENERGY_DATA.totalByMeter,
  },
  temperature: {
    path: '/smart-things/sensors/{id}/data/total/',
    eventType: TEMPERATURE_STATISTIC_DATA.totalByMeter,
    queryParams: { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  },
};

export const TOTAL_HISTORICAL_BY_LOCATION = {
  energy: {
    path: '/energy-meters/aggregated-consumption/total/',
    eventType: ENERGY_DATA.totalByLocation,
  },
  temperature: {
    path: '/smart-things/sensors/aggregated-data/total/',
    eventType: TEMPERATURE_STATISTIC_DATA.totalByLocation,
    queryParams: { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  },
};

export const LIVE_FOR_METER = {
  energy: {
    path: '/resources/{id}/data/live/',
    eventType: ENERGY_DATA.liveByMeter,
  },
  temperature: {
    path: '/smart-things/sensors/{id}/data/live/',
    eventType: TEMPERATURE_STATISTIC_DATA.liveByMeter,
    queryParams: { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  },
  microbit: {
    path: '/storage/historical/{id}/data/live/',
    eventType: MICROBIT_STATISTIC_DATA.liveByMeter,
  },
};

export const LIVE_BY_LOCATION = {
  energy: {
    path: '/energy-meters/aggregated-consumption/live/',
    eventType: ENERGY_DATA.liveByLocation,
  },
  temperature: {
    path: '/smart-things/sensors/aggregated-data/live/',
    eventType: TEMPERATURE_STATISTIC_DATA.liveByLocation,
    queryParams: { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  },
};

export const HISTORICAL_DATA_UPDATE_TIME_INTERVAL = Object.freeze({
  timeValue: 30,
  timeUnit: 'minutes',
});

export const HISTORICAL_DATA_TIME_RESOLUTION = Object.freeze({
  timeValue: 1,
  timeUnit: 'hours',
});
