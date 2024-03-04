import axios from 'axios';

import { BASE_URL } from '../constants/config';
import {
  TARIFFS_COMPARISON_QUOTES_DATA_SUCCESS,
  TARIFFS_COMPARISON_QUOTES_DATA_FAIL,
  TARIFFS_COMPARISON_PERIODS_CONSUMPTION_DATA_SUCCESS,
  SUPPLIERS_DATA_SUCCESS, ALL_SWITCHES_DATA_SUCCESS,
} from '../constants/actionTypes';
import { convertPeriodConsumptionDataToLocalTime } from '../components/TariffComparison/utils';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';
import paramsSerializer from '../utils/paramsSerializer';

export function getComparisonQuotes(energyMeterBillingInfoId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/mug-api/comparison/`, { params: { energy_meter_billing_info: energyMeterBillingInfoId } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: TARIFFS_COMPARISON_QUOTES_DATA_SUCCESS,
          data,
        });
        resolve(response);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch({
          type: TARIFFS_COMPARISON_QUOTES_DATA_FAIL,
          data: [],
        });
        dispatch(hideLoader());
        reject(error);
      });
  });
}

export function callPeriodConsumptionActions(
  actions,
) {
  return (dispatch) => {
    dispatch(showLoader());
    Promise.all(actions)
      .then((results) => {
        const data = results.reduce((res, item) => {
          res[item.period] = item.data;
          return res;
        }, {});
        dispatch({
          type: TARIFFS_COMPARISON_PERIODS_CONSUMPTION_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
      });
  };
}

export function getPeriodConsumption(resourceId, period, unit, fillGaps = true) {
  return new Promise((resolve) => {
    axios.get(
      `${BASE_URL}/energy-meters/${resourceId}/periodic-consumption/`,
      {
        params: {
          period,
          unit,
          fill_gaps: fillGaps,
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          const data = convertPeriodConsumptionDataToLocalTime(response.data);
          resolve({ data, period });
        } else {
          resolve({ data: null, period });
        }
      })
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
        resolve({ data: null, period });
      });
  });
}

export function createSwitch(energyMeterBillingInfoId, data) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/mug-api/energy-meters-billing-info/${energyMeterBillingInfoId}/switches/`, data)
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      }).catch((error) => {
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getSuppliers() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/mug-api/suppliers/`)
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        dispatch({
          type: SUPPLIERS_DATA_SUCCESS,
          data,
        });
        resolve(response);
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getAllSwitches(schoolId) {
  const params = { location_id: schoolId };
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/mug-api/switches/`, { params, paramsSerializer })
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        dispatch({
          type: ALL_SWITCHES_DATA_SUCCESS,
          data,
        });
        resolve(response);
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getMetersByPostcode(postCode) {
  return dispatch => new Promise((resolve, reject) => {
    axios.post(`${BASE_URL}/mug-api/meter_ids/`, {
      post_code: postCode,
    }).then((response) => {
      const data = response.data;
      resolve(data);
    }).catch((error) => {
      dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
      reject(error);
    });
  });
}

export function getMeterRateType(meterType, meterId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/mug-api/meter-info/`, {
      meter_type: meterType,
      meter_id: meterId,
    }).then((response) => {
      dispatch(hideLoader());
      resolve(response);
    }).catch((error) => {
      dispatch(hideLoader());
      dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
      reject(error);
    });
  });
}
