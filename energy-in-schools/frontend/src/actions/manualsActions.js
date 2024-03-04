import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { MANUALS_LIST_DATA_SUCCESS, MANUAL_DATA_SUCCESS, CATEGORIES_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

import saveFile from '../utils/saveFile';

export function getManuals() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/manuals/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: MANUALS_LIST_DATA_SUCCESS,
          data,
        });
        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getManual(manualSlug) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/manuals/${manualSlug}/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: MANUAL_DATA_SUCCESS,
          data,
        });
        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getCategories() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/manuals/categories/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: CATEGORIES_LIST_DATA_SUCCESS,
          data,
        });
        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function downloadManualPresentation(url, fileName) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${url}`, { responseType: 'arraybuffer' })
      .then((response) => {
        dispatch(hideLoader());
        const fileNameFromUrl = `Presentation_${fileName}`;
        saveFile(response, fileNameFromUrl);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}
