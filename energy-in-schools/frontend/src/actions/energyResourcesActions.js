import axios from 'axios';

import { BASE_URL, RESOURCE_CHILD_TYPE, UNIT } from '../constants/config';
import { ENERGY_RESOURCES_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

import paramsSerializer from '../utils/paramsSerializer';

export const GET_ENERGY_RESOURCES_DEFAULT_PARAMS = Object.freeze({
  native_unit: UNIT.watt,
  child_type: [RESOURCE_CHILD_TYPE.ENERGY, RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER],
});

const processResourcesList = (resources) => {
  const result = [];

  resources.forEach((resource) => {
    const resourceChildType = resource.child_type;
    const resourceData = resource[resourceChildType];
    switch (resourceChildType) {
      case RESOURCE_CHILD_TYPE.ENERGY: {
        result.push({ ...resourceData, child_type: resource.child_type });
        break;
      }
      case RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER: {
        result.push({
          ...resourceData,
          child_type: resource.child_type,
          [RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR]: resource[RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR],
        });
        break;
      }
      default:
        break;
    }
  });
  return result;
};

export function getEnergyResourcesList(params = {}) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(
      `${BASE_URL}/resources/`,
      {
        params: { ...GET_ENERGY_RESOURCES_DEFAULT_PARAMS, ...params },
        paramsSerializer,
      },
    )
      .then((response) => {
        const data = processResourcesList(response.data);
        dispatch({
          type: ENERGY_RESOURCES_LIST_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
        resolve(data);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}

export function editSmartThingsEnergyMeter(id, name, description, locationId, type) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/smart-things/energy-meters/${id}/`, {
      name, description, sub_location_id: locationId, type,
    })
      .then((response) => {
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

export function getResourceLiveValue(meterId) {
  return dispatch => new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/resources/${meterId}/data/live/`)
      .then((response) => {
        const data = response.data;
        resolve(data);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        reject(error);
      });
  });
}
