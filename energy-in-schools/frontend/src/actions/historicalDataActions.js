import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { HISTORICAL_DATA_SUCCESS } from '../constants/actionTypes';
import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
} from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

import saveFile from '../utils/saveFile';

export function getHistoricalData(myOwnlocation = false) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/storage/historical/`, { params: { own_location_only: myOwnlocation } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: HISTORICAL_DATA_SUCCESS,
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

export function downloadFile(id, key) {
  return (dispatch) => {
    dispatch(showLoader());
    axios({
      method: 'GET',
      url: `${BASE_URL}/storage/historical/${id}/data/`,
      params: { format: 'csv' },
    })
      .then((response) => {
        dispatch(hideLoader());
        saveFile(response, `${key}_historical.csv`, 'text/csv; charset=utf-8');
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function createHistoricalDataset(namespace, name, type, unitLabel, hubUid) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/storage/historical/`, {
      namespace, name, type, unit_label: unitLabel, hub_uid: hubUid,
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

export function createHistoricalVariable(datasetId, value) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/storage/historical/${datasetId}/data/`, {
      value,
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

export function deleteHistoricalVariable(variableId, deletePermanently = false) {
  const url = deletePermanently ? `${BASE_URL}/storage/historical/${variableId}/delete-permanently/` : `${BASE_URL}/storage/historical/${variableId}/`;
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

export function editHistoricalVariableLocation(variableId, locationId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.patch(`${BASE_URL}/storage/historical/${variableId}/`, { sub_location_id: locationId })
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
