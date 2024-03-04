import axios from 'axios';
import { isNil } from 'lodash';

import { BASE_URL } from '../constants/config';
import {
  ALL_SCHOOLS_DATA_SUCCESS,
  ENERGY_METERS_BILLING_INFO_DATA_SUCCESS,
  FETCH_SCHOOL_ENERGY_MOOD_SUCCESS,
  OPEN_SCHOOLS_DATA_SUCCESS,
  SCHOOL_DATA_SUCCESS,
  SCHOOL_REQUESTS_DATA_SUCCESS,
  SCHOOLS_ALWAYS_ON_DATA_SUCCESS,
  SCHOOLS_CASHBACK_DATA_SUCCESS,
} from '../constants/actionTypes';
import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
  toggleQuestionnaireDialog,
  toogleRegistrationSchoolDialog,
} from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

import saveFile from '../utils/saveFile';
import getCookie from '../utils/getCookie';

import { REGISTRATION_REQUEST_STATUS } from '../components/SchoolRegistration/constants';

export function getSchoolRegistrationRequests() {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/registration-requests/`)
      .then((response) => {
        const data = response.data;
        const schoolsByStatus = Object.values(REGISTRATION_REQUEST_STATUS).reduce((res, item) => {
          res[item] = data.filter(school => school.status.toLowerCase() === item);
          return res;
        }, {});

        dispatch({
          type: SCHOOL_REQUESTS_DATA_SUCCESS,
          ...schoolsByStatus,
        });
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function approveSchoolRequest(schoolId, status) {
  let url;
  switch (status) {
    case REGISTRATION_REQUEST_STATUS.trial_pending:
      url = `${BASE_URL}/registration-requests/${schoolId}/accept-trial/`;
      break;
    case REGISTRATION_REQUEST_STATUS.activation_pending:
      url = `${BASE_URL}/registration-requests/${schoolId}/accept-activation/`;
      break;
    case REGISTRATION_REQUEST_STATUS.training_period:
      url = `${BASE_URL}/registration-requests/${schoolId}/end-training-session/`;
      break;
    default:
      return (dispatch) => {
        dispatch(showMessageSnackbar(`Approve is forbidden for status: ${status}`));
        return Promise.reject(new Error(`failed to approve registration request with status : ${status}`));
      };
  }
  return dispatch => new Promise((resolve, reject) => {
    axios.post(url)
      .then((response) => {
        dispatch(showMessageSnackbar('School trial successfully approved'));
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function refuseSchoolRequest(schoolId, reason, status) {
  let url;
  let data;
  switch (status) {
    case REGISTRATION_REQUEST_STATUS.trial_pending:
      url = `${BASE_URL}/registration-requests/${schoolId}/reject-trial/`;
      data = {
        registration_reject_reason: reason,
      };
      break;
    case REGISTRATION_REQUEST_STATUS.activation_pending:
      url = `${BASE_URL}/registration-requests/${schoolId}/reject-activation/`;
      data = {
        activation_reject_reason: reason,
      };
      break;
    default:
      return (dispatch) => {
        dispatch(showMessageSnackbar(`Refuse is forbidden for status: ${status}`));
        return Promise.reject(new Error(`failed to refuse registration request with status : ${status}`));
      };
  }
  return dispatch => new Promise((resolve, reject) => {
    axios.post(url, data)
      .then((response) => {
        dispatch(showMessageSnackbar('School successfully refused'));
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar('School refuse failed.'));
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function postSchoolRegisterRequests(school) {
  return dispatch => new Promise(() => {
    axios.post(
      `${BASE_URL}/registration-requests/`,
      school,
      { headers: { 'X-CSRFToken': getCookie('csrftoken') } },
    )
      .then(() => {
        dispatch(showMessageSnackbar('School successfully registered!'));
        dispatch(toogleRegistrationSchoolDialog());
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getSchoolInformation(schoolId) {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/locations/${schoolId}/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: SCHOOL_DATA_SUCCESS,
          data,
        });
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        reject(reject);
      });
  });
}

export function getAllSchools(onlyOwn = false) {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/locations/`, { params: { own_location_only: onlyOwn } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: ALL_SCHOOLS_DATA_SUCCESS,
          data,
        });
        resolve(data);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getOpenSchools() {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/locations/open-data/`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: OPEN_SCHOOLS_DATA_SUCCESS,
          data,
        });
        resolve(data);
      }).catch((error) => {
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getOpenSchoolInformation(schoolId) {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/locations/open-data/${schoolId}/`, { params: { uid: 'true' } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: SCHOOL_DATA_SUCCESS,
          data,
        });
        dispatch({
          type: ALL_SCHOOLS_DATA_SUCCESS,
          data: [data],
        });
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        reject(reject);
      });
  });
}


export function getLocationEnergyMood(locationUID) {
  return (dispatch) => {
    axios.get(`${BASE_URL}/locations/${locationUID}/energy-mood/?uid=true`)
      .then((response) => {
        const data = response.data;
        dispatch({
          type: FETCH_SCHOOL_ENERGY_MOOD_SUCCESS,
          data,
        });
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function getSchoolsCashback() {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/leaderboard/cashback/`)
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        dispatch({
          type: SCHOOLS_CASHBACK_DATA_SUCCESS,
          data,
        });
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function getSchoolsAlwaysOn() {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/leaderboard/always-on/`)
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        dispatch({
          type: SCHOOLS_ALWAYS_ON_DATA_SUCCESS,
          data,
        });
      }).catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function postQuestionnaireData(requestId, data, token = null) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    const axiosInstance = token ? axios.create() : axios;
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const message = token ? 'School successfully registered! You account will be unblocked after Admin approval' : 'School successfully registered!';
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    axiosInstance({
      method: 'PUT',
      url: `${BASE_URL}/registration-requests/${requestId}/questionnaire/`,
      data: formData,
      headers,
    })
      .then(() => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(message, 7000));
        if (!token) {
          dispatch(toggleQuestionnaireDialog());
        }
        resolve();
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function downloadSignedLOA(requestId, schoolName) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/registration-requests/${requestId}/questionnaire/signed-loa/`, { responseType: 'blob' })
      .then((response) => {
        dispatch(hideLoader());
        saveFile(response, `${schoolName}_signed_LOA`);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function bulkCreateEnergyMetersBillingInfo(data) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/energy-meters-billing-info/bulk/`, data)
      .then(() => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar('Energy meters billing info successfully saved', 5000));
        resolve();
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function createEnergyMetersBillingInfo(data) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/energy-meters-billing-info/`, data)
      .then(() => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar('Energy meter billing info successfully saved', 5000));
        resolve();
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function updateEnergyMetersBillingInfo(data, id) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/energy-meters-billing-info/${id}/`, data)
      .then(() => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar('Energy meter billing info successfully updated', 5000));
        resolve();
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getEnergyMetersBillingInfoList(locationId = null) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    const queryParams = !isNil(locationId) ? `?location=${locationId}` : '';

    axios.get(`${BASE_URL}/energy-meters-billing-info/${queryParams}`)
      .then((response) => {
        const data = response.data;
        dispatch(hideLoader());
        dispatch({
          type: ENERGY_METERS_BILLING_INFO_DATA_SUCCESS,
          data,
        });
        resolve(response);
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function deleteEnergyMetersBillingInfoItem(meterId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.delete(`${BASE_URL}/energy-meters-billing-info/${meterId}/`)
      .then(() => {
        dispatch(hideLoader());
        resolve();
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getMeterSavings(meter) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(
      `${BASE_URL}/mug-api/meter/savings/${meter.location_id}/${meter.id}/`,
      { headers: { 'X-CSRFToken': getCookie('csrftoken') } },
    )
      .then((response) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(response.data.charging_start_time ? 'Battery state successfully received.' : 'Battery state unknown.', 5000));
        resolve(response);
      })
      .catch((error) => {
        dispatch(hideLoader());
        if (error && error.response && error.response.data && error.response.data.split(' ')[0] === 'MUGBadRequest') {
          const { message } = JSON.parse(error.response.data.split('\n')[1].split("'")[1]) || {};
          dispatch(showMessageSnackbar(`MUG Error: "${message}"`));
        } else {
          dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        }
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getMeterCarbonIntensity(meter) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(
      `${BASE_URL}/mug-api/meter/carbonintensity/${meter.location_id}/${meter.id}/`,
      { headers: { 'X-CSRFToken': getCookie('csrftoken') } },
    )
      .then((response) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar('Meter carbon intensity successfully recieved.', 5000));
        resolve(response);
      })
      .catch((error) => {
        dispatch(hideLoader());
        if (error && error.response && error.response.data && error.response.data.split(' ')[0] === 'MUGBadRequest') {
          const { message } = JSON.parse(error.response.data.split('\n')[1].split("'")[1]) || {};
          dispatch(showMessageSnackbar(`MUG Error: "${message}"`));
        } else {
          dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        }
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}


export function postEnergyMetersBillingInfoResources(data) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.patch(`${BASE_URL}/energy-meters-billing-info/resources/`, data)
      .then(() => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar('Energy meters billing info successfully saved', 5000));
        resolve();
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getAddressesWithMetersByPostCode(postcode) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(
      `${BASE_URL}/mug-api/address/meters/`,
      { post_code: postcode },
      { headers: { 'X-CSRFToken': getCookie('csrftoken') } },
    )
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(hideLoader());
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}
