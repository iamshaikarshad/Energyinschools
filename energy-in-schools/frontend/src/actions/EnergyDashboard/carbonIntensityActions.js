import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

export default function getCarbonIntensity() {
  return dashboardBaseHttpAction(
    'carbon-emission/composition/',
    ENERGY_DASHBOARD_DATA.carbonIntensity,
  );
}
