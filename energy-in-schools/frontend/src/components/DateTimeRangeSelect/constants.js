import moment from 'moment';

import { isNil } from 'lodash';

export const RANGE_LIMIT = Object.freeze({
  from: 'from',
  to: 'to',
});

export const RANGE_LIMIT_LABEL = Object.freeze({
  [RANGE_LIMIT.from]: 'From',
  [RANGE_LIMIT.to]: 'To',
});

export const DATE_RANGE_PICKER_VARIANT = Object.freeze({
  date: 'date',
  time: 'time',
  dateTime: 'dateTime',
});

export const DISPLAY_VARIANT = Object.freeze({
  inline: 'inline',
  modal: 'modal',
});

export const LIMITS_DISPLAY_MODE = Object.freeze({
  single: 'single',
  dual: 'dual',
});

export const DATE_RANGE_VALIDATOR_TYPE = Object.freeze({
  bothRequired: 'bothRequired',
  fromLessThanTo: 'fromLessThanTo',
  deltaYearPeriod: 'exportOptionDelta',
});

export const DATE_RANGE_VALIDATOR_RULE = Object.freeze({
  [DATE_RANGE_VALIDATOR_TYPE.bothRequired]: (from, to) => (!isNil(from) && !isNil(to)),
  [DATE_RANGE_VALIDATOR_TYPE.fromLessThanTo]: (from, to) => (moment(from) < moment(to)),
  [DATE_RANGE_VALIDATOR_TYPE.deltaYearPeriod]: (from, to) => (moment(to).diff(moment(from), 'days') <= 365),
});

export const DATE_RANGE_VALIDATOR_ERROR_MESSAGE = Object.freeze({
  [DATE_RANGE_VALIDATOR_TYPE.bothRequired]: 'Both "From" and "To" are required',
  [DATE_RANGE_VALIDATOR_TYPE.fromLessThanTo]: '"From" date should be before "To" date',
  [DATE_RANGE_VALIDATOR_TYPE.deltaYearPeriod]: 'Selected date period should not be greater than one year',
});

export const DATE_RANGE_VALIDATOR = Object.values(DATE_RANGE_VALIDATOR_TYPE).reduce((res, type) => {
  res[type] = (errorMessage = DATE_RANGE_VALIDATOR_ERROR_MESSAGE[type] || 'Error') => (
    {
      rule: DATE_RANGE_VALIDATOR_RULE[type] || (() => true),
      errorMessage,
    }
  );
  return res;
}, {});
