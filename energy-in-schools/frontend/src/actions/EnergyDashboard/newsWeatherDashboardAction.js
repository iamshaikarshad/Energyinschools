import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import dashboardBaseHttpAction from './dashboardBaseHttpAction';

/**
 * @param {number} locationId - school location id
 */

export function getCurrentWeather(locationId) {
  return dashboardBaseHttpAction(
    'weathers/current/',
    ENERGY_DASHBOARD_DATA.currentWeather,
    { location_uid: locationId },
  );
}

/**
 * @param {number} locationId - school location id
 */

export function getWeatherForecast(locationId) {
  return dashboardBaseHttpAction(
    'weathers/forecast/',
    ENERGY_DASHBOARD_DATA.forecastWeather,
    { location_uid: locationId },
  );
}

export function getNewsList() {
  return dashboardBaseHttpAction(
    'news/recent/',
    ENERGY_DASHBOARD_DATA.news,
    { limit: 2 },
  );
}

export function getElectricityUsageLeagueData() {
  return dashboardBaseHttpAction(
    'leaderboard/leagues/electricity/',
    ENERGY_DASHBOARD_DATA.electricityUsageLeague,
  );
}

export function getGasUsageLeagueData() {
  return dashboardBaseHttpAction(
    'leaderboard/leagues/gas/',
    ENERGY_DASHBOARD_DATA.gasUsageLeague,
  );
}
