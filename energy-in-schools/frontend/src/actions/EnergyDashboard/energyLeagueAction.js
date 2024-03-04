import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import dashboardBaseHttpAction from './dashboardBaseHttpAction';

export function getElectricityLeagueData() {
  return dashboardBaseHttpAction(
    'leaderboard/leagues/electricity-yesterday/',
    ENERGY_DASHBOARD_DATA.electricityLeague,
  );
}

export function getGasLeagueData() {
  return dashboardBaseHttpAction(
    'leaderboard/leagues/gas/',
    ENERGY_DASHBOARD_DATA.gasLeague,
  );
}
