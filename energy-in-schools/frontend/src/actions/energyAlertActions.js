/* eslint-disable no-param-reassign */
import axios from 'axios';

import { BASE_URL } from '../constants/config';
import { ENERGY_ALERTS_TYPE } from '../components/AlertsConfiguartion/constants';
import {
  ALERT_LOGS_LIST_SUCCESS,
  ALERTS_LIST_SUCCESS,
} from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';
import roundToNPlaces from '../utils/roundToNPlaces';

function convertAlertEnergyValueToW(alertType, energyValue) {
  if (alertType.includes('level') && alertType !== ENERGY_ALERTS_TYPE.temperature_level) {
    return energyValue * 1000;
  }
  return energyValue;
}

function convertAlertEnergyValueToKW(alert) {
  if (alert.type.includes('level') && alert.type !== ENERGY_ALERTS_TYPE.temperature_level) {
    return {
      ...alert,
      value_level: {
        ...alert.value_level,
        argument: roundToNPlaces(alert.value_level.argument / 1000, 2),
      },
    };
  }
  return alert;
}

export function getEnergyAlerts() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/notifications/triggers/`)
      .then((response) => {
        const energyAlerts = response.data.map(convertAlertEnergyValueToKW);
        dispatch({
          type: ALERTS_LIST_SUCCESS,
          data: energyAlerts,
        });
        dispatch(hideLoader());
        resolve(energyAlerts);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function createEnergyAlert(
  type,
  name,
  frequency,
  meterId,
  locationId,
  limitCondition,
  energyLimit,
  limitDuration,
  limitPeriodStart,
  limitPeriodEnd,
  limitPercent,
  activeDays = 'all_days',
) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    energyLimit = convertAlertEnergyValueToW(type, energyLimit);
    axios.post(`${BASE_URL}/notifications/triggers/`, {
      type,
      name,
      max_notification_frequency: frequency,
      source_location_id: locationId,
      source_resource_id: meterId,
      value_level: {
        condition: limitCondition,
        argument: energyLimit,
        min_duration: limitDuration * 60, // backend expects data in seconds
      },
      daily_usage: {
        threshold_in_percents: limitPercent,
      },
      active_time_range_start: limitPeriodStart,
      active_time_range_end: limitPeriodEnd,
      active_days: activeDays,
    }).then((response) => {
      dispatch(hideLoader());
      dispatch(getEnergyAlerts());
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

export function updateEnergyAlert(alertId, type, meterId, locationId, limitCondition, energyLimit, limitDuration, limitPeriodStart, limitPeriodEnd, limitPercent) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    energyLimit = convertAlertEnergyValueToW(type, energyLimit);
    axios.patch(`${BASE_URL}/notifications/triggers/${alertId}/`, {
      type,
      source_location_id: locationId,
      source_resource_id: meterId,
      value_level: {
        condition: limitCondition,
        argument: energyLimit,
        min_duration: limitDuration * 60, // backend expects data in seconds
      },
      daily_usage: {
        threshold_in_percents: limitPercent,
      },
      active_time_range_start: limitPeriodStart,
      active_time_range_end: limitPeriodEnd,
    }).then((response) => {
      dispatch(hideLoader());
      dispatch(getEnergyAlerts());
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

export function createNotificationTarget(type, alertId, email, phoneNumber) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/notifications/targets/`, {
      type,
      trigger_id: alertId,
      email_notification: {
        email,
      },
      sms_notification: {
        number: phoneNumber,
      },
    }).then((response) => {
      dispatch(hideLoader());
      dispatch(getEnergyAlerts());
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

export function changeEnergyAlertStatus(alertId, type, status) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.patch(`${BASE_URL}/notifications/triggers/${alertId}/`, {
      is_active: status,
      type,
    }).then((response) => {
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

export function deleteAlert(alertId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.delete(`${BASE_URL}/notifications/triggers/${alertId}/`)
      .then((response) => {
        dispatch(hideLoader());
        dispatch(getEnergyAlerts());
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

export function getEnergyAlertsLogs() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/notifications/event-logs/`)
      .then((response) => {
        const logs = response.data.map((log) => {
          const convertedData = convertAlertEnergyValueToKW(log.trigger_data);
          return {
            ...log,
            trigger_data: convertedData,
          };
        });

        dispatch({
          type: ALERT_LOGS_LIST_SUCCESS,
          data: logs,
        });
        dispatch(hideLoader());
        resolve(logs);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function cleanAlertLogs() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.delete(`${BASE_URL}/notifications/event-logs/`)
      .then((response) => {
        dispatch(hideLoader());
        dispatch(getEnergyAlerts());
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
