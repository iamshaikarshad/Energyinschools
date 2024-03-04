import axios from 'axios';

import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
} from '../dialogActions';
import formatErrorMessageFromError from '../../utils/errorHandler';

import { ENERGY_MANAGER_DASHBOARD_DATA } from '../../constants/actionTypes';

import dashboardRequestAction from './energyManagerDashboardBaseHttpAction';

import {
  UNIT, SMART_THINGS_SENSOR_CAPABILITY, BASE_URL, TIME_RESOLUTION,
} from '../../constants/config';

import { getTodayTimeLimits, getYesterdayTimeLimits } from '../../utils/timeUtils';

import saveFile from '../../utils/saveFile';

export function callDashboardItemActions(
  actions,
  itemName,
) {
  return (dispatch) => {
    dispatch({ type: ENERGY_MANAGER_DASHBOARD_DATA.loading[itemName].success }); // here success = loadind started
    Promise.all(actions)
      .finally(() => {
        setTimeout(() => {
          dispatch({ type: ENERGY_MANAGER_DASHBOARD_DATA.loading[itemName].failed }); // here failed = loading ended
        }, 500); // need timeout in order to avoid blinking
      });
  };
}

export function getEnergyLiveTotalConsumption(energyType) {
  return dashboardRequestAction(
    'energy-meters/aggregated-consumption/live/',
    ENERGY_MANAGER_DASHBOARD_DATA.energyTotalConsumption,
    {
      own_location_only: true,
      unit: UNIT.kilowatt,
      meter_type: energyType,
    },
  );
}

export function getEnergyLiveTotalCost(energyType) {
  return dashboardRequestAction(
    'energy-meters/aggregated-consumption/live/',
    ENERGY_MANAGER_DASHBOARD_DATA.energyTotalCost,
    {
      own_location_only: true,
      unit: UNIT.poundSterling,
      meter_type: energyType,
    },
  );
}

export function getEnergyTotalConsumption(energyType, from, to, unit = UNIT.kilowattHour) {
  return dashboardRequestAction(
    'energy-meters/aggregated-consumption/total/',
    ENERGY_MANAGER_DASHBOARD_DATA.energyTotalConsumption,
    {
      own_location_only: true,
      from: from.format(),
      to: to.format(),
      unit,
      meter_type: energyType,
    },
  );
}

export function getEnergyTotalCost(energyType, from, to, unit = UNIT.poundSterling) {
  return dashboardRequestAction(
    'energy-meters/aggregated-consumption/total/',
    ENERGY_MANAGER_DASHBOARD_DATA.energyTotalCost,
    {
      own_location_only: true,
      from: from.format(),
      to: to.format(),
      unit,
      meter_type: energyType,
    },
  );
}

export function getTemperatureLiveAverage() {
  return dashboardRequestAction(
    'smart-things/sensors/aggregated-data/live/',
    ENERGY_MANAGER_DASHBOARD_DATA.temperatureAverage,
    { capability: SMART_THINGS_SENSOR_CAPABILITY.temperature },
  );
}

export function getTemperatureYesterdayAverage() {
  const { from, to } = getYesterdayTimeLimits();
  return dashboardRequestAction(
    'smart-things/sensors/aggregated-data/total/',
    ENERGY_MANAGER_DASHBOARD_DATA.temperatureAverage,
    {
      from: from.format(),
      to: to.format(),
      capability: SMART_THINGS_SENSOR_CAPABILITY.temperature,
    },
  );
}

export function getTemperatureTodayAverage() {
  const { from, to } = getTodayTimeLimits();
  return dashboardRequestAction(
    'smart-things/sensors/aggregated-data/total/',
    ENERGY_MANAGER_DASHBOARD_DATA.temperatureAverage,
    {
      from: from.format(),
      to: to.format(),
      capability: SMART_THINGS_SENSOR_CAPABILITY.temperature,
    },
  );
}

export function getEnergyAlwaysOnToday(energyType) {
  const { from, to } = getTodayTimeLimits();
  return dashboardRequestAction(
    'energy-meters/aggregated-consumption/always-on/',
    ENERGY_MANAGER_DASHBOARD_DATA.energyAlwaysOn,
    {
      own_location_only: true,
      from: from.format(),
      to: to.format(),
      meter_type: energyType,
    },
  );
}

export function getCurrentEnergyTariffs(energyType) {
  return dashboardRequestAction(
    'energy-tariffs/current-tariffs/',
    ENERGY_MANAGER_DASHBOARD_DATA.currentEnergyTariffs,
    {
      meter_type: energyType,
    },
  );
}

export function getTemperatureMinMaxLive() {
  return dashboardRequestAction(
    'smart-things/sensors/boundary-live-data/',
    ENERGY_MANAGER_DASHBOARD_DATA.temperatureMinMaxLive,
    {
      capability: SMART_THINGS_SENSOR_CAPABILITY.temperature,
      unit: UNIT.celsius,
    },
  );
}

export function downloadExportHistoricalDataFile({
  from, to, meterType, unit, format = 'csv', timeResolution = TIME_RESOLUTION.halfHour, locationUid, resourceId = null,
}) {
  return (dispatch) => {
    dispatch(showLoader());
    const requestParams = {
      meter_type: meterType,
      from,
      to,
      unit,
      format,
      time_resolution: timeResolution,
      location_uid: locationUid,
    };
    if (resourceId) {
      requestParams.resource_id = resourceId;
    }
    axios({
      method: 'GET',
      url: `${BASE_URL}/energy-meters/aggregated-consumption/historical/export/`,
      params: requestParams,
    })
      .then((response) => {
        dispatch(hideLoader());
        if (response.status === 204) {
          dispatch(showMessageSnackbar('No historical data for this meter type in this period.'));
        } else {
          saveFile(response, '', 'text/csv; charset=utf-8');
        }
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
      });
  };
}
