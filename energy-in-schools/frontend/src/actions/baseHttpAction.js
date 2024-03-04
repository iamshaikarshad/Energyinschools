import axios from 'axios';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';
import { BASE_URL } from '../constants/config';


/**
 *
 * The base action that handle showing/hiding loader, logging and simple dispatch data for you
 *
 * @param path the path after domain/api/v1/. e. g. "energy-meters/"
 * @param config {?AxiosRequestConfig} parameters for axios
 * @param dispatchEvent {?Event} auto dispatch events with data if populated
 * @param processThen {?ProcessThen}
 * @param processCatch {?ProcessCatch}
 * @return {function(*=): Promise<any>}
 */
export default function request(
  path,
  dispatchEvent = null,
  config = null,
  processThen = null,
  processCatch = null,
) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    const configWithDefaults = Object.assign(
      {
        method: 'get',
        url: `${BASE_URL}/${path}`,
      },
      config,
    );

    axios(configWithDefaults)
      .then((response) => {
        let responseData;

        if (processThen) {
          responseData = processThen(response, dispatch);
        } else {
          responseData = response.data;
        }

        if (dispatchEvent) {
          if ((response.status === 200 || response.status === 201) && dispatchEvent.success) {
            dispatch({
              type: dispatchEvent.success,
              data: responseData,
            });
          } else if (dispatchEvent.failed) {
            dispatch({
              type: dispatchEvent.failed,
              data: null,
            });
          }
        }

        dispatch(hideLoader());
        resolve(responseData);
      })
      .catch((error) => {
        if (processCatch) {
          processCatch(error);
        }

        if (dispatchEvent && dispatchEvent.failed) {
          dispatch({
            type: dispatchEvent.failed,
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
 * ProcessThan callback
 * @callback ProcessThen
 * @param {Response} response
 * @param {Dispatch} dispatch
 */

/**
 * ProcessCatch callback
 * @callback ProcessCatch
 * @param {Response} response
 * @param {Dispatch} dispatch
 */

/**
 * Event
 * @typedef {Object} Event
 * @property {string} success
 * @property {string} failed
 */
