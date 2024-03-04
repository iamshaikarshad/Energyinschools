import axios from 'axios';
import shortid from 'shortid';
import { BASE_URL } from '../constants/config';
import { HUBS_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';
import saveFile from '../utils/saveFile';


export function getHubsList() {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/hubs/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: HUBS_LIST_DATA_SUCCESS,
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

export function createHub(name, description, uid, locationId, type) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/hubs/`, {
      name, description, uid, sub_location_id: locationId, type,
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

export function editHub(id, name, description, uid, locationId, type) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/hubs/${id}/`, {
      name, description, uid, sub_location_id: locationId, type,
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

export function getHubHex(id) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/hubs/microbit-firmware/`, {
      params: { id },
    })
      .then((response) => {
        saveFile(response);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function deleteHub(hubID, deletePermanently = false) {
  return dispatch => new Promise((resolve, reject) => {
    const requestParams = deletePermanently ? {
      url: `${BASE_URL}/hubs/${hubID}/delete-permanently/`,
      method: 'POST',
    } : {
      url: `${BASE_URL}/hubs/${hubID}/`,
      method: 'DELETE',
    };
    dispatch(showLoader());
    axios(requestParams)
      .then((response) => {
        dispatch(hideLoader());
        dispatch(getHubsList());
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

/*
  DEPRECATED ACTION. UID update should be via EDIT DIALOG
 */
export function updateHubUID(hubID) {
  return dispatch => new Promise((resolve, reject) => {
    const uid = shortid.generate().substring(0, 5);
    dispatch(showLoader());
    axios.patch(`${BASE_URL}/hubs/${hubID}/`, {
      uid,
    })
      .then((response) => {
        dispatch(hideLoader());
        dispatch(getHubsList());
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}
