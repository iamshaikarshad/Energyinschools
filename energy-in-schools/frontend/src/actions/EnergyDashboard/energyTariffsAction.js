import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';
import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ELECTRICITY, GAS } from '../../constants/config';

function getEnergyTariffs(actionType, queryParams = {}, nullableValue = []) {
  return dashboardBaseHttpAction(
    'energy-tariffs/current-tariffs/',
    actionType,
    {
      meter_type: queryParams.meter_type,
    },
    nullableValue,
  );
}

export function getElectricityTariffs() {
  return getEnergyTariffs(
    ENERGY_DASHBOARD_DATA.electricityTariffs,
    {
      meter_type: ELECTRICITY,
    },
  );
}

export function getGasTariffs() {
  return getEnergyTariffs(
    ENERGY_DASHBOARD_DATA.gasTariffs,
    {
      meter_type: GAS,
    },
  );
}
