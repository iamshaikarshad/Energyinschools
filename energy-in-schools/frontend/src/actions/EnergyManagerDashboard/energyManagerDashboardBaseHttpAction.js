import axios from 'axios';
import { BASE_URL } from '../../constants/config';
import formatErrorMessageFromError from '../../utils/errorHandler';
import { showMessageSnackbar } from '../dialogActions';

export default function dashboardRequestAction(
  path,
  actionType,
  parameters = {},
) {
  return dispatch => new Promise((resolve) => {
    axios.get(`${BASE_URL}/${path}`, {
      params: parameters,
    })
      .then((response) => {
        if (response.status === 204) {
          dispatch({
            type: actionType.failed,
            data: null,
          });
        } else {
          const { data } = response;
          dispatch({
            type: actionType.success,
            data,
          });
        }
        resolve(response);
      })
      .catch((error) => {
        dispatch({
          type: actionType.failed,
          data: null,
        });
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        resolve(null);
      });
  });
}
