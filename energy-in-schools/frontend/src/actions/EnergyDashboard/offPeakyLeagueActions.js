import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

import { getYesterdayTimeLimits } from '../../utils/timeUtils';

export default function getOffPeakyLeagueData() {
  return dashboardBaseHttpAction(
    'leaderboard/leagues/off-peak-points/',
    ENERGY_DASHBOARD_DATA.offPeakyLeague,
  );
}

export function getYesterdayOffPeakyPoints(locationId) {
  const { from, to } = getYesterdayTimeLimits();
  return dashboardBaseHttpAction(
    `energy-cashback/${locationId}/total/`,
    ENERGY_DASHBOARD_DATA.offPeakyYesterdayValue,
    {
      from_: from.format('YYYY-MM-DD'),
      to: to.format('YYYY-MM-DD'),
    },
  );
}
