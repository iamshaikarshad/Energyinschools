import axios from 'axios';

import { BASE_URL } from '../constants/config';
import {
  SCHOOLS_MONITORING_LIST_DATA_SUCCESS,
  SCHOOLS_MONITORING_UPDATE_SCHOOL_DATA_IN_LIST,
  SCHOOLS_MONITORING_UPDATE_SCHOOL_SMART_APP_STATUS,
  SCHOOLS_MONITORING_SCHOOL_SMARTTHINGS_DEVICES_DATA_SUCCESS,
} from '../constants/actionTypes';

import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
} from './dialogActions';

import formatErrorMessageFromError from '../utils/errorHandler';

export function getSchoolsMonitoringDataList() {
  return dispatch => new Promise((resolve, reject) => {
    const timezoneOffset = new Date().getTimezoneOffset();
    dispatch(showLoader());
    axios.get(`${BASE_URL}/schools-metrics/?timezone_offset=${timezoneOffset}`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: SCHOOLS_MONITORING_LIST_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
        resolve(data);
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getSchoolMetricsData(schoolId) {
  return dispatch => new Promise((resolve, reject) => {
    const timezoneOffset = new Date().getTimezoneOffset();
    dispatch(showLoader());
    axios.get(`${BASE_URL}/schools-metrics/${schoolId}/?timezone_offset=${timezoneOffset}`)
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        resolve(data);
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function updateSchoolMetricsData(schoolId, options = { showMessageOnSucces: false, showMessageOnFailure: false }) {
  return dispatch => new Promise((resolve, reject) => {
    const { showMessageOnSucces, showMessageOnFailure } = options;
    getSchoolMetricsData(schoolId)(dispatch)
      .then((data) => {
        dispatch({
          type: SCHOOLS_MONITORING_UPDATE_SCHOOL_DATA_IN_LIST,
          data,
        });
        resolve(data);
        if (showMessageOnSucces) {
          const message = `Updated school metrics data successfully (school id: ${schoolId})`;
          dispatch(showMessageSnackbar(message, 5000));
        }
      })
      .catch((error) => {
        const message = `Failed to update school metrics data (school id: ${schoolId})`;
        if (showMessageOnFailure) {
          dispatch(showMessageSnackbar(message, 5000));
        }
        reject(error);
        console.log(message); // eslint-disable-line no-console
      });
  });
}


export function getUpdatedSmartAppStatus(appId) {
  return dispatch => new Promise((resolve) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/smart-things/applications/${appId}/refresh_token_health/`)
      .then((response) => {
        const { data } = response || {};
        dispatch(hideLoader());
        resolve({
          data,
          success: true,
        });
      }).catch((error) => {
        dispatch(hideLoader());
        resolve({
          data: null,
          success: false,
        });
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function updateSchoolSmartAppStatus(schoolId, smartAppStatusData) {
  return {
    type: SCHOOLS_MONITORING_UPDATE_SCHOOL_SMART_APP_STATUS,
    data: {
      schoolId,
      smartAppStatusData,
    },
  };
}

export function createHildebrandMeter(data) {
  return dispatch => new Promise((resolve) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/energy-meters/hildebrand/`, data)
      .then(() => {
        dispatch(hideLoader());
        resolve(true);
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        resolve(false);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function editHildebrandMeter(data, id) {
  return dispatch => new Promise((resolve) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/energy-meters/hildebrand/${id}/`, data)
      .then(() => {
        dispatch(hideLoader());
        resolve(true);
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        resolve(false);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getSmarthingsDevices(schoolId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/locations/${schoolId}/smart-things-devices/`)
      .then((response) => {
        const { data } = response || {};
        dispatch({
          type: SCHOOLS_MONITORING_SCHOOL_SMARTTHINGS_DEVICES_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
        resolve(data);
      }).catch((error) => {
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}
