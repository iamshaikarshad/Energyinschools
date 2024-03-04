import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

/**
 * @param {number} locationId - school location id
 */

export default function getCartoonCharacterMood(locationId) {
  return dashboardBaseHttpAction(
    `locations/${locationId}/energy-mood/`,
    ENERGY_DASHBOARD_DATA.cartoonCharacter,
    {
      uid: true,
    },
  );
}
