import { UNIT } from '../../constants/config';

export const ENERGY_ALERTS_TYPE = Object.freeze({
  electricity_level: 'electricity_consumption_level',
  gas_level: 'gas_consumption_level',
  electricity_daily: 'daily_electricity_usage',
  gas_daily: 'daily_gas_usage',
  temperature_level: 'temperature_level',
});

export const ENERGY_ALERTS_TYPE_TO_UNIT = Object.freeze({
  [ENERGY_ALERTS_TYPE.temperature_level]: UNIT.celsius,
  [ENERGY_ALERTS_TYPE.electricity_daily]: UNIT.kilowatt,
  [ENERGY_ALERTS_TYPE.electricity_level]: UNIT.kilowatt,
  [ENERGY_ALERTS_TYPE.gas_daily]: UNIT.kilowatt,
  [ENERGY_ALERTS_TYPE.gas_level]: UNIT.kilowatt,
});

export const ALERT_FREQUENCIES = Object.freeze({
  onceHour: 'one_per_hour',
  onceDay: 'one_per_day',
});

export const ACTIVE_DAYS = Object.freeze({
  schoolDays: 'school_days',
  nonSchoolDays: 'non_school_days',
  allDays: 'all_days',
});

export const AVAILABLE_LIMIT_PERIODS = [
  {
    from: '07:00:00',
    to: '16:00:00',
  },
  {
    from: '16:00:00',
    to: '19:00:00',
  },
  {
    from: '19:00:00',
    to: '07:00:00',
  },
];

export const ALERT_TYPE_TO_METER_LABEL = {
  [ENERGY_ALERTS_TYPE.electricity_daily]: 'Electricity',
  [ENERGY_ALERTS_TYPE.electricity_level]: 'Electricity',
  [ENERGY_ALERTS_TYPE.gas_daily]: 'Gas',
  [ENERGY_ALERTS_TYPE.gas_level]: 'Gas',
  [ENERGY_ALERTS_TYPE.temperature_level]: 'Temperature',
};

export const TYPE_ENERGY_TO_ALERT_TYPE = {
  limit: {
    Electricity: ENERGY_ALERTS_TYPE.electricity_level,
    Gas: ENERGY_ALERTS_TYPE.gas_level,
    Temperature: ENERGY_ALERTS_TYPE.temperature_level,
  },
  usage: {
    Electricity: ENERGY_ALERTS_TYPE.electricity_daily,
    Gas: ENERGY_ALERTS_TYPE.gas_daily,
  },
};

export const ALERT_FREQUENCY_TYPE_TO_LABEL = [
  {
    type: ALERT_FREQUENCIES.onceHour,
    label: 'Once a hour',
  },
  {
    type: ALERT_FREQUENCIES.onceDay,
    label: 'Once a day',
  },
];

export const ALERT_TYPE_TO_LABEL = [
  {
    type: 'limit',
    label: 'Limit value',
  },
  {
    type: 'usage',
    label: 'XX% higher usage',
  },
];

export const ALERT_ACTIVE_DAYS_TYPE_TO_LABEL = [
  {
    type: ACTIVE_DAYS.allDays,
    label: 'All days',
  },
  {
    type: ACTIVE_DAYS.schoolDays,
    label: 'Only School Days',
  },
  {
    type: ACTIVE_DAYS.nonSchoolDays,
    label: 'Only non-School Days',
  },
];

export const NOTIFICATION_TYPES = Object.freeze({
  email: 'email',
  sms: 'sms',
});

export const LIMIT_ALERT_CONDITION_TYPES = Object.freeze({
  greater: 'greater',
  less: 'less',
});

export const LIMIT_ALERT_CONDITION_TYPE_TO_LABEL = [
  {
    type: LIMIT_ALERT_CONDITION_TYPES.greater,
    label: 'above',
  },
  {
    type: LIMIT_ALERT_CONDITION_TYPES.less,
    label: 'below',
  },
];
