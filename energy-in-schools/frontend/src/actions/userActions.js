/* eslint-disable no-console */

import axios from 'axios';
import { push } from 'connected-react-router';
import { BASE_URL } from '../constants/config';
import { SCHOOL_USERS_DATA_SUCCESS, USER_DATA_CLEAN, USER_DATA_SUCCESS } from '../constants/actionTypes';
import { showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

export function getUserInfo(userId) {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/users/${userId}/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: USER_DATA_SUCCESS,
          data,
        });
        resolve(data);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function getSchoolUsers() {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/users/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: SCHOOL_USERS_DATA_SUCCESS,
          data,
        });
        resolve(data);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function changePassword(newPassword, currentPassword, id) {
  return dispatch => new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/users/${id}/change-password/`, { new_password: newPassword, current_password: currentPassword })
      .then((response) => {
        dispatch(showMessageSnackbar('Password successfully changed'));
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function setEmailToBlackList(token) {
  return dispatch => new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/blacklisted-emails/`, { token })
      .then((response) => {
        dispatch(showMessageSnackbar('Successfully unsubscribed'));
        resolve(response);
        dispatch(push('/'));
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function sendResetPasswordLink(email, username) {
  return dispatch => new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/users/reset-password/`, { email, username })
      .then((response) => {
        dispatch(showMessageSnackbar('Reset password link was sent on your email!'));
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function resetPassword(password, confirmPassword, token) {
  return dispatch => new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/users/reset-password/confirm/`, { password, confirm_password: confirmPassword, token })
      .then((response) => {
        dispatch(showMessageSnackbar('Password has been reset successfully'));
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function clearUserData() {
  return {
    type: USER_DATA_CLEAN,
  };
}

export function getRegistrationRequestStatus(id, token) {
  const axiosInstance = axios.create(); // need it in order to avoid overwriting current request headers by interceptor headers
  return dispatch => new Promise((resolve, reject) => {
    axiosInstance({
      method: 'GET',
      url: `${BASE_URL}/registration-requests/${id}/status/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}

export function sendEndTrainingSession(id, token) {
  const axiosInstance = axios.create(); // need it in order to avoid overwriting current request headers by interceptor headers
  return dispatch => new Promise((resolve, reject) => {
    axiosInstance({
      method: 'POST',
      url: `${BASE_URL}/registration-requests/${id}/end-training-session/`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error);
        reject(error);
      });
  });
}
