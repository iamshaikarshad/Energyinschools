import { push } from 'connected-react-router';
import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { AUTH_LOGOUT } from '../constants/actionTypes';
import TokenManager from '../utils/tokenManager';
import { showMessageSnackbar } from './dialogActions';
import { clearUserData, getUserInfo } from './userActions';
import formatErrorMessageFromError from '../utils/errorHandler';

import ReactGAService from '../utils/ReactGAManager';

export function logIn(username, password) {
  return (dispatch) => {
    axios.post(`${BASE_URL}/token/`, {
      username,
      password,
    }).then((response) => {
      const data = response.data;
      TokenManager.setTokens(data);
      const userId = TokenManager.getUserId();
      dispatch(getUserInfo(userId))
        .then(() => {
          ReactGAService.sendAuthenticationEvent(userId);
        });
    }).catch((error) => {
      dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
      console.log(error); // eslint-disable-line no-console
    });
  };
}

export function obtainDashboardToken(locationUid) {
  return new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/token/dashboard/`, {
      location_uid: locationUid,
    }).then((response) => {
      const data = response.data;
      TokenManager.setTokens(data);
      resolve(data);
    }).catch((error) => {
      reject(error);
      console.log(error); // eslint-disable-line no-console
    });
  });
}

export function logout() {
  return (dispatch) => {
    TokenManager.clear();
    dispatch({
      type: AUTH_LOGOUT,
    });
    dispatch(clearUserData());
    dispatch(push('/'));
  };
}
