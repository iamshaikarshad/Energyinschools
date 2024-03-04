import axios from 'axios';
import { invert } from 'lodash';
import { BASE_URL } from '../../constants/config';
import { ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION } from '../../constants/actionTypes';
import formatErrorMessageFromError from '../../utils/errorHandler';
import { showMessageSnackbar } from '../dialogActions';
import { loadingStatusFailed, loadingStatusSuccess } from './loadingStatusAction';

import {
  PREVIEW_MESSAGES_SCREEN_NAME_RESPONSE_NAME_MAP,
} from '../../components/EnergyScreenDashboard/constants';

export default function getPreviewMessages() {
  return (dispatch) => {
    axios.get(`${BASE_URL}/energy-dashboard/screens/`)
      .then((response) => {
        dispatch(loadingStatusSuccess());
        if (response.status === 200) {
          const data = response.data;
          const allowedScreenNames = Object.values(PREVIEW_MESSAGES_SCREEN_NAME_RESPONSE_NAME_MAP);
          const invertedMap = invert(PREVIEW_MESSAGES_SCREEN_NAME_RESPONSE_NAME_MAP);
          data.forEach((item) => {
            if (allowedScreenNames.includes(item.name) && item.messages.length) {
              const actionName = invertedMap[item.name];
              const actionType = ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION[actionName].success;
              dispatch({
                type: actionType,
                data: item.messages.map(message => message.text),
              });
            }
          });
        }
        dispatch(loadingStatusFailed());
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
        dispatch(loadingStatusFailed());
      });
  };
}
