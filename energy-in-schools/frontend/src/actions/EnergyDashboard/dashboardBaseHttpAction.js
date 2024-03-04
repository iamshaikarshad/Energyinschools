import axios from 'axios';
import { BASE_URL } from '../../constants/config';
import formatErrorMessageFromError from '../../utils/errorHandler';
import { showMessageSnackbar } from '../dialogActions';
import { loadingStatusFailed, loadingStatusSuccess } from './loadingStatusAction';

/**
 * @param {string} path - the path after domain/api/v1/. e. g. "energy-meters/"
 * @param {object} actionType - ENERGY_DASHBOARD_DATA[key]
 * @param {object} [parameters={}] - additional parameters for axios
 */
export default function dashboardRequest(
  path,
  actionType,
  parameters = {},
  nullableValue = null,
) {
  return (dispatch) => {
    axios.get(`${BASE_URL}/${path}`, {
      params: parameters,
    })
      .then((response) => {
        dispatch(loadingStatusSuccess());
        const data = response.data;
        if (response.status === 200 || response.status === 201) {
          dispatch({
            type: actionType.success,
            data,
          });
        } else {
          dispatch({
            type: actionType.failed,
            data: nullableValue,
          });
        }
        dispatch(loadingStatusFailed());
      })
      .catch((error) => {
        dispatch({
          type: actionType.failed,
          data: nullableValue,
        });
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        dispatch(loadingStatusFailed());
      });
  };
}
