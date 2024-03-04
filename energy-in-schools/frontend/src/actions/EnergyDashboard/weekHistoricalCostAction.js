import moment from 'moment';

import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import {
  DAY, UNIT, ELECTRICITY, TIME_RESOLUTION,
} from '../../constants/config';

function getWeekHistoricalCost(locationId, actionType, queryParams) {
  return dashboardBaseHttpAction(
    'energy-meters/aggregated-consumption/historical/',
    actionType,
    {
      meter_type: ELECTRICITY,
      location_uid: locationId,
      from: queryParams.from,
      to: queryParams.to,
      time_resolution: TIME_RESOLUTION.halfHour,
      unit: UNIT.poundSterling,
      fill_gaps: true,
    },
  );
}

export function getElectricityLastWeekHistoricalCost(locationId) {
  const from = moment().subtract(1, 'weeks').startOf('isoWeek');
  const to = moment.unix(from.unix() + (DAY * 4)).endOf('day');

  return getWeekHistoricalCost(
    locationId,
    ENERGY_DASHBOARD_DATA.lastWeekHistoricalCost,
    {
      from: from.format(),
      to: to.format(),
    },
  );
}

export function getElectricityCurrentWeekHistoricalCost(locationId) {
  const from = moment().startOf('isoWeek');
  const endOfWeek = moment.unix(from.unix() + (DAY * 4)).endOf('day');
  const now = moment();

  return getWeekHistoricalCost(
    locationId,
    ENERGY_DASHBOARD_DATA.currentWeekHistoricalCost,
    {
      from: from.format(),
      to: (now > endOfWeek ? endOfWeek : now).format(),
    },
  );
}
