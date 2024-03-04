import axios from 'axios';

import { BASE_URL } from '../constants/config';
import {
  METERS_LIST_DATA_SUCCESS,
  METERS_LIST_SCHOOL_DASHBOARD_FAILED,
  METERS_LIST_SCHOOL_DASHBOARD_SUCCESS,
} from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

export function getMetersList(onlyOwnLocation) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/energy-meters/`, { params: { own_location_only: onlyOwnLocation } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: METERS_LIST_DATA_SUCCESS,
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

export function createMeter(name, description, meterId, locationId, type, provider) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/energy-meters/`, {
      type, name, description, provider_account: provider, sub_location: locationId, meter_id: meterId,
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

export function refreshMeter(id) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/energy-meters/hildebrand/${id}/`)
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        resolve(data);
        dispatch(showMessageSnackbar('Meter data refreshed successfully!'));
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
      });
  });
}

export function editMeter(id, name, description, meterId, locationId, type, provider) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/energy-meters/hildebrand/${id}/`, {
      type, name, description, provider_account: provider, sub_location: locationId, meter_id: meterId,
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

export function deleteMeter(meterID, deletePermanently = false) {
  const url = deletePermanently ? `${BASE_URL}/energy-meters/${meterID}/delete-permanently/` : `${BASE_URL}/energy-meters/${meterID}/`;
  const method = deletePermanently ? 'post' : 'delete';
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios({
      url,
      method,
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

export function getLiveConsumptionInLocationByType(type, locationId) {
  return (dispatch) => {
    axios.get(
      `${BASE_URL}/energy-meters/aggregated-consumption/live/`,
      {
        params: {
          meter_type: type,
          location_uid: locationId,
        },
      },
    ).then((response) => {
      const data = { ...response.data, ...{ type } };
      if (response.status !== 204) {
        dispatch({
          type: METERS_LIST_SCHOOL_DASHBOARD_SUCCESS,
          data,
        });
      } else {
        dispatch({
          type: METERS_LIST_SCHOOL_DASHBOARD_FAILED,
        });
      }
    })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  };
}
