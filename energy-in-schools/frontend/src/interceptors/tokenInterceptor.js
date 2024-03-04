/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { BASE_URL, REFRESH_TOKEN_URL, TOKEN_TYPE } from '../constants/config';
import TokenManager from '../utils/tokenManager';
import { SHOW_ALERT_DIALOG } from '../constants/actionTypes';
import { obtainDashboardToken } from '../actions/authActions';

let requestInterceptorId = null;
let responseInterceptorId = null;
let _store = null;
let _authTokenPromise = null;

/**
 * Add headers before request is sent
 * @param {Object} config Axios request config options
 * @returns {Object} config Axios request config options
 * @private
 */
function addRequestHeaders(config) {
  /* eslint-disable no-param-reassign */
  const token = TokenManager.getAccessToken();
  if (config.url.indexOf(BASE_URL) !== -1 && token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

/**
 * Returns promise to get auth token, if it was not created previously
 * @returns {Promise} promise
 */
function getAuthTokenPromise() {
  if (!_authTokenPromise) {
    _authTokenPromise = axios.post(REFRESH_TOKEN_URL, { refresh: TokenManager.getRefreshToken() });
  }
  return _authTokenPromise;
}

let dashboardAuthTokenRequest = null;

function resetRefreshDashboardTokenRequest() {
  dashboardAuthTokenRequest = null;
}

// Call refresh token for dashboard
// This function makes a call to get the auth token
// or it returns the same promise as an in-progress call to get the auth token
function refreshDashboardToken() {
  if (!dashboardAuthTokenRequest) {
    dashboardAuthTokenRequest = obtainDashboardToken(TokenManager.getLocationUid());
    dashboardAuthTokenRequest.then(resetRefreshDashboardTokenRequest).catch(resetRefreshDashboardTokenRequest);
  }
  return dashboardAuthTokenRequest;
}

/**
 * Handle response error 401
 * @param {Object} error Axios error object
 * @return {Promise} promise
 */
function handleResponseError(error) {
  const response = error.response;
  //  eslint-disable-next-line prefer-const
  let config = error.config;

  if (config.url.indexOf(BASE_URL) === -1) {
    throw error;
  }

  if (response.status === 401) {
    axios.interceptors.response.eject(responseInterceptorId);

    return getAuthTokenPromise()
      .then((axiosResponse) => {
        const data = axiosResponse.data;
        TokenManager.refreshAuthToken(data);
        responseInterceptorId = axios.interceptors.response.use(undefined, handleResponseError);
        _authTokenPromise = null;
        return axios(config);
      }).catch(() => {
        TokenManager.clear();
        _authTokenPromise = null;
        if (TokenManager.getTokenType() === TOKEN_TYPE.API_AUTH) {
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          _store.dispatch({
            type: SHOW_ALERT_DIALOG,
            header: 'Session expired',
            content: 'Your session has expired. Please log in again.',
          });
        } else {
          refreshDashboardToken();
          responseInterceptorId = axios.interceptors.response.use(undefined, handleResponseError);
        }
      });
  }

  return Promise.reject(error);
}

/**
 * Add request and response interceptor
 */
function addTokenInterceptor(store) {
  _store = store;
  if (requestInterceptorId === null) {
    requestInterceptorId = axios.interceptors.request.use(addRequestHeaders, undefined);
  }

  if (responseInterceptorId === null) {
    responseInterceptorId = axios.interceptors.response.use(undefined, handleResponseError);
  }
}

/**
 * Remove request and response interceptor
 */
function removeTokenInterceptor() {
  axios.interceptors.request.eject(requestInterceptorId);
  axios.interceptors.response.eject(responseInterceptorId);

  requestInterceptorId = null;
  responseInterceptorId = null;
}

export { addTokenInterceptor, removeTokenInterceptor };
