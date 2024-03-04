import axios from 'axios';

import { BASE_URL } from '../constants/config';
import { PROVIDERS_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

export function getProvidersList() {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/energy-providers/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: PROVIDERS_LIST_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
      }).catch((error) => {
        console.log(error); // eslint-disable-line no-console
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
      });
  };
}

export function createProvider(name, description, credentials, provider) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/energy-providers/`, {
      name, description, provider, credentials,
    })
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

export function editProvider(id, name, description, credentials, provider) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/energy-providers/${id}/`, {
      name, description, provider, credentials,
    })
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

export function deleteProvider(providerID, deletePermanently = false) {
  const requestParams = deletePermanently ? {
    url: `${BASE_URL}/energy-providers/${providerID}/delete-permanently/`,
    method: 'POST',
  } : {
    url: `${BASE_URL}/energy-providers/${providerID}/`,
    method: 'DELETE',
  };
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios(requestParams)
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
