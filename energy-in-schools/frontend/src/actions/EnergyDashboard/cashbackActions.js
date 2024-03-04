import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

/**
 * @param {number} locationId - school location id
 */

export function getCashbackAmount(locationId) { // eslint-disable-line import/prefer-default-export
  return dashboardBaseHttpAction(
    `energy-cashback/${locationId}/total/`,
    ENERGY_DASHBOARD_DATA.cashBack,
  );
}
