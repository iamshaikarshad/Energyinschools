// External imports
import axios from 'axios';

// Internal imports
import { BASE_URL } from '../constants/config';
import { DEVICES_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
} from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

export function getDevicesList() {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/smart-things/devices/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: DEVICES_LIST_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function refreshDevices() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/smart-things/devices/refresh/`)
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getRefreshedDevicesList() {
  return (dispatch) => {
    dispatch(refreshDevices())
      .then(() => {
        dispatch(getDevicesList());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function changeStatusDevice(device) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.patch(`${BASE_URL}/smart-things/devices/${device.id}/`, { is_connected: !device.is_connected })
      .then((response) => {
        dispatch(hideLoader());
        dispatch(getDevicesList());
        resolve(response);
      }).catch((error) => {
        formatErrorMessageFromError(error);
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function editDevice(deviceID, label) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.patch(`${BASE_URL}/smart-things/devices/${deviceID}/`, { label })
      .then((response) => {
        dispatch(hideLoader());
        dispatch(getDevicesList());
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}
