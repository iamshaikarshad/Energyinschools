import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import { UNIT } from '../../constants/config';
/**
 * @param {string} type - energy type
 * @param {number} locationId - school location id
 */

export function getLiveConsumptionByElectricityType(type, locationId) {
  return dashboardBaseHttpAction(
    'energy-meters/aggregated-consumption/live/',
    ENERGY_DASHBOARD_DATA.liveConsumptionByElectricityType,
    { meter_type: type, location_uid: locationId, unit: UNIT.kilowatt },
  );
}

/**
 * @param {string} type - energy type
 * @param {number} locationId - school location id
 */

export function getLiveConsumptionByGasType(type, locationId) {
  return dashboardBaseHttpAction(
    'energy-meters/aggregated-consumption/live/',
    ENERGY_DASHBOARD_DATA.liveConsumptionByGasType,
    { meter_type: type, location_uid: locationId, unit: UNIT.kilowatt },
  );
}
