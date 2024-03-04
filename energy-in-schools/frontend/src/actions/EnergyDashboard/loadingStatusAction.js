import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

export function loadingStatusFailed() {
  return {
    type: ENERGY_DASHBOARD_DATA.loadingEnds.failed,
  };
}

export function loadingStatusSuccess() {
  return {
    type: ENERGY_DASHBOARD_DATA.loadingEnds.success,
  };
}
