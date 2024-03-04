import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

export default function getTipsList() {
  return dashboardBaseHttpAction(
    'energy-dashboard/tips/',
    ENERGY_DASHBOARD_DATA.energyTips,
  );
}
