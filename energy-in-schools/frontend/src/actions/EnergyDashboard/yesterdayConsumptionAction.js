import moment from 'moment';
import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import {
  DAY, UNIT, ELECTRICITY, GAS,
} from '../../constants/config';

const DEFAULT_QUERY_PARAMS = Object.freeze({
  meter_type: ELECTRICITY,
  unit: UNIT.kilowattHour,
});

function getYesterdayTotalConsumption(locationId, actionType, queryParams = DEFAULT_QUERY_PARAMS) {
  const to = moment().startOf('day');
  const fromTs = to.unix() - DAY;
  const from = moment.unix(fromTs);
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

export function getElectricityYesterdayConsumption(locationId) {
  return getYesterdayTotalConsumption(locationId, ENERGY_DASHBOARD_DATA.yesterdayConsumptionByElectricityType);
}

export function getGasYesterdayConsumption(locationId) {
  return getYesterdayTotalConsumption(
    locationId,
    ENERGY_DASHBOARD_DATA.yesterdayConsumptionByGasType,
    {
      meter_type: GAS,
      unit: UNIT.kilowattHour,
    },
  );
}

export function getElectricityYesterdayCostConsumption(locationId) {
  return getYesterdayTotalConsumption(
    locationId,
    ENERGY_DASHBOARD_DATA.electricityYesterdayCost,
    {
      meter_type: ELECTRICITY,
      unit: UNIT.poundSterling,
    },
  );
}

export function getGasYesterdayCostConsumption(locationId) {
  return getYesterdayTotalConsumption(
    locationId,
    ENERGY_DASHBOARD_DATA.gasYesterdayCost,
    {
      meter_type: GAS,
      unit: UNIT.poundSterling,
    },
  );
}
