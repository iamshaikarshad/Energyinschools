import moment from 'moment';

import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import { UNIT, ELECTRICITY } from '../../constants/config';

const DEFAULT_QUERY_PARAMS = Object.freeze({
  meter_type: ELECTRICITY,
  unit: UNIT.kilowattHour,
});

function getTodayTotalConsumption(locationId, actionType, queryParams = DEFAULT_QUERY_PARAMS) {
  const from = moment().startOf('day');
  const to = moment();

  return dashboardBaseHttpAction(
    'energy-meters/aggregated-consumption/total/',
    actionType,
    {
      meter_type: queryParams.meter_type,
      location_uid: locationId,
      from: from.format(),
      to: to.format(),
      unit: queryParams.unit,
    },
  );
}

export function getElectricityTodayConsumption(locationId) {
  return getTodayTotalConsumption(locationId, ENERGY_DASHBOARD_DATA.todayConsumptionByElectricityType);
}

export function getElectricityTodayCostConsumption(locationId) {
  return getTodayTotalConsumption(
    locationId,
    ENERGY_DASHBOARD_DATA.electricityTodayCost,
    {
      meter_type: ELECTRICITY,
      unit: UNIT.poundSterling,
    },
  );
}
