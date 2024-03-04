import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

/**
 * @param {number} locationId - school location id
 */

export default function getFactsList(locationId) {
  return dashboardBaseHttpAction(
    `facts/?location_id=${locationId}/`,
    ENERGY_DASHBOARD_DATA.facts,
  );
}
