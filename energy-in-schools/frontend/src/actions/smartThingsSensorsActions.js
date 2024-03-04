import axios from 'axios';

import { BASE_URL } from '../constants/config';
import {
  SMARTTHINGS_SENSORS_LIST_DATA_SUCCESS,
  SMARTTHINGS_SENSOR_LOADING_LIVE_VALUE,
  SMARTTHINGS_SENSOR_LIVE_VALUE_SUCCESS,
  SMARTTHINGS_SENSOR_LIVE_VALUE_FAIL,
} from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

export function getSmartThingsSensorsList(params = {}) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/smart-things/sensors/`, {
      params: {
        own_location_only: true,
        ...params,
      },
    })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: SMARTTHINGS_SENSORS_LIST_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
        resolve(data);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function editSmartThingsSensor(id, name, description, locationId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/smart-things/sensors/${id}/`, {
      name, description, sub_location_id: locationId,
    })
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getSensorLiveValue(sensorId) {
  return (dispatch) => {
    dispatch({
      type: SMARTTHINGS_SENSOR_LOADING_LIVE_VALUE,
      data: { id: sensorId, loading: true },
    });
    axios.get(`${BASE_URL}/smart-things/sensors/${sensorId}/data/live/`)
      .then((response) => {
        const data = response.data;
        const { value, unit } = data || { value: null, unit: '' };
        dispatch({
          type: SMARTTHINGS_SENSOR_LIVE_VALUE_SUCCESS,
          data: {
            id: sensorId,
            value,
            unit,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: SMARTTHINGS_SENSOR_LIVE_VALUE_FAIL,
          data: { id: sensorId, value: null, unit: '' },
        });
        console.log(error); // eslint-disable-line no-console
      });
  };
}
