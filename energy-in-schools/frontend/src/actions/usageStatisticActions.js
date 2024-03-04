/* eslint-disable no-param-reassign */
import axios from 'axios';
import moment from 'moment';

import {
  BASE_URL, ENERGY_TYPE, TIME_RESOLUTION, UNIT,
} from '../constants/config';

import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';
import paramsSerializer from '../utils/paramsSerializer';

import { ENERGY_DATA } from '../constants/actionTypes';
import {
  HISTORICAL_BY_LOCATION,
  HISTORICAL_FOR_METER,
  LIVE_BY_LOCATION,
  LIVE_FOR_METER,
  TOTAL_HISTORICAL_BY_LOCATION,
  TOTAL_HISTORICAL_FOR_METER,
} from '../components/UsageStatistic/constants';

function getConsumptionData( // todo: move all this to some library (create the library if it doesn't exists)
  url,
  id,
  params,
  eventKey,
  eventType,
  dataKey,
) {
  params = Object.assign({}, params);
  if (params.from === null || params.to === undefined) {
    params.from = moment().startOf('day').format();
  } else if (typeof params.from !== 'string') {
    params.from = params.from.format();
  }
  if (params.to === null || params.to === undefined) {
    params.to = moment().endOf('day').format();
  } else if (typeof params.to !== 'string') {
    params.to = params.to.format();
  }

  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}${id ? url.replace('{id}', id) : url}`, { params, paramsSerializer })
      .then((response) => {
        if (response.status === 200) {
          const data = response.data[dataKey];
          if (eventType) {
            dispatch({
              [eventKey]: id,
              type: eventType.success,
              data,
            });
          }
        } else if (eventType) {
          dispatch({ // todo: remove duplications
            [eventKey]: id,
            type: eventType.failed,
            data: null,
          });
        }
        dispatch(hideLoader());
        resolve(response.data);
      })
      .catch((error) => {
        if (eventType) {
          dispatch({ // todo: remove duplications
            [eventKey]: id,
            type: eventType.failed,
            data: null,
          });
        }
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

/**
 * Action data format: {type: <string>, locationId: <int>, data: [{time: <iso_8061>, value: <float>}]}
 */
export function getHistoricalConsumptionByLocation(
  type,
  locationId,
  energyType = ENERGY_TYPE.electricity,
  from = null,
  to = null,
  unit = UNIT.wattHour,
  timeResolution = TIME_RESOLUTION.hour,
  compareFrom = null,
  compareTo = null,
  fillGaps = true,
) {
  const { path, eventType, queryParams } = HISTORICAL_BY_LOCATION[type];
  return getConsumptionData(
    path,
    null,
    {
      ...queryParams,
      from,
      to,
      time_resolution: timeResolution,
      unit,
      fill_gaps: fillGaps,
      compare_from: compareFrom,
      compare_to: compareTo,
      meter_type: energyType,
      location_uid: locationId,
    },
    'locationId',
    eventType,
    'values',
  );
}

/**
 * Action data format: {type: <string>, meterId: <int>, data: [{time: <iso_8061>, value: <float>}]}
 */
export function getHistoricalConsumptionForMeter(
  type,
  meterId,
  from = null,
  to = null,
  unit = UNIT.wattHour,
  timeResolution = TIME_RESOLUTION.hour,
  compareFrom = null,
  compareTo = null,
  fillGaps = true,
) {
  const { path, eventType } = HISTORICAL_FOR_METER[type];
  return getConsumptionData(
    path,
    meterId,
    {
      from,
      to,
      time_resolution: timeResolution,
      unit,
      fill_gaps: fillGaps,
      compare_from: compareFrom,
      compare_to: compareTo,
    },
    'meterId',
    eventType,
    'values',
  );
}

/**
 * Action data format: {type: <string>,
 *                      meterId: <int>,
 *                      data: {time: <iso_8061>, value: <float>, unit: <unit enum>}}
 */
export function getTotalHistoricalConsumptionForMeter(
  type,
  meterId,
  from = null,
  to = null,
  unit = UNIT.wattHour,
) {
  const { path, eventType } = TOTAL_HISTORICAL_FOR_METER[type];
  return getConsumptionData(
    path,
    meterId,
    {
      from,
      to,
      unit,
    },
    'meterId',
    eventType,
    'value',
  );
}

/**
 * Action data format: {type: <string>,
 *                      locationId: <int>,
 *                      data: {time: <iso_8061>, value: <float>, unit: <unit enum>}}
 */
export function getTotalHistoricalConsumptionByLocation(
  type,
  locationId,
  energyType = ENERGY_TYPE.electricity,
  from = moment().startOf('day').format(),
  to = moment().endOf('day').format(),
  unit = UNIT.wattHour,
) {
  const { path, eventType, queryParams } = TOTAL_HISTORICAL_BY_LOCATION[type];
  return getConsumptionData(
    path,
    null,
    {
      ...queryParams,
      from,
      to,
      unit,
      meter_type: energyType,
      location_uid: locationId,
    },
    'locationId',
    eventType,
    'value',
  );
}

/**
 * Action data format: {type: <string>,
 *                      locationId: <int>,
 *                      data: {time: <iso_8061>, value: <float>, unit: <unit enum>}}
 */
export function getYesterdayGasConsumptionByLocation(
  locationId,
  unit = UNIT.wattHour,
) {
  const to = moment().startOf('day');
  const from = to.clone().subtract(1, 'day');

  return getConsumptionData(
    TOTAL_HISTORICAL_BY_LOCATION.energy.path,
    null,
    {
      from,
      to,
      unit,
      meter_type: ENERGY_TYPE.gas,
      location_uid: locationId,
    },
    'locationId',
    ENERGY_DATA.yesterdayGasConsumptionByLocation,
    'value',
  );
}


/**
 * Action data format: {type: <string>,
 *                      meterId: <int>,
 *                      data: {time: <iso_8061>, value: <float>, unit: <unit enum>}}
 */
export function getLiveConsumptionForMeter(
  type,
  meterId,
  unit = UNIT.watt,
) {
  const { path, eventType, queryParams } = LIVE_FOR_METER[type];
  return getConsumptionData(
    path,
    meterId,
    {
      ...queryParams,
      unit,
    },
    'meterId',
    eventType,
    'value',
  );
}

/**
 * Action data format: {type: <string>,
 *                      locationId: <int>,
 *                      data: {time: <iso_8061>, value: <float>, unit: <unit enum>}}
 */
export function getLiveConsumptionByLocation(
  type,
  locationId,
  energyType = ENERGY_TYPE.electricity,
  unit = UNIT.wattHours,
) {
  const { path, eventType, queryParams } = LIVE_BY_LOCATION[type];
  return getConsumptionData(
    path,
    null,
    {
      ...queryParams,
      meter_type: energyType,
      location_uid: locationId,
      unit,
    },
    'locationId',
    eventType,
    'value',
  );
}

export function getAlwaysOnUsage(
  type,
  locationId = null,
  energyType = ENERGY_TYPE.electricity,
  from = null,
  to = null,
  meterId = null,
) {
  const { path, eventType } = {
    path: meterId ? '/energy-meters/{id}/consumption/always-on/' : '/energy-meters/aggregated-consumption/always-on/',
    eventType: ENERGY_DATA.alwaysOn,
  };
  return getConsumptionData(
    path,
    meterId,
    {
      from,
      to,
      meter_type: energyType,
      location_uid: locationId,
    },
    'locationId',
    eventType,
    'value',
  );
}
