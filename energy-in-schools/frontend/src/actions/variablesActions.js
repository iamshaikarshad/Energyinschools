import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { VARIABLES_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
} from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

export function getVariables(myOwnlocation = false) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/storage/variables/`, { params: { own_location_only: myOwnlocation } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: VARIABLES_LIST_DATA_SUCCESS,
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

export function createVariable(key, value, hubUid, locationId, sharedWith) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/storage/variables/`, {
      key, value, hub_uid: hubUid, location_id: locationId, shared_with: sharedWith,
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

export function editVariable(key, value, hubUid, locationId, sharedWith) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/storage/variables/${key}/`, {
      key, value, hub_uid: hubUid, location_id: locationId, shared_with: sharedWith,
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

export function deleteVariable(variableKey) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.delete(`${BASE_URL}/storage/variables/${variableKey}/`)
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
