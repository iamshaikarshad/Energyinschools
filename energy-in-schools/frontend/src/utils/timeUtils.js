import moment from 'moment';

import { DAY } from '../constants/config';

export function getYesterdayTimeLimits() {
  const to = moment().startOf('day');
  const fromTs = to.unix() - DAY;
  const from = moment.unix(fromTs);
  return { from, to };
}

export function getTodayTimeLimits() {
  return {
    from: moment().startOf('day'),
    to: moment().endOf('day'),
  };
}

export function getLondonTimezone() {
  const now = new Date();
  const commonDateParams = { day: 'numeric', hour: 'numeric', hour12: false };
  const londonDatetime = now.toLocaleString(undefined, { timeZone: 'Europe/London', ...commonDateParams });
  const utcDatetime = now.toLocaleString(undefined, { timeZone: 'UTC', ...commonDateParams });
  const [londonDay, londonHour] = londonDatetime.split(', ').map(num => parseInt(num, 10));
  const [utcDay, utcHour] = utcDatetime.split(', ').map(num => parseInt(num, 10));
  const offset = (londonDay * 24 + londonHour) - (utcDay * 24 + utcHour);

  return offset ? '+0100' : 'Z';
}
