import * as types from '../constants/actionTypes';

const initialState = {
  alerts: {
    data: [],
    lastUpdated: new Date(),
  },
  alertsLog: {
    data: [],
    lastUpdated: new Date(),
  },
};

export default function alertsReducer(state = initialState, action) {
  switch (action.type) {
    case types.ALERTS_LIST_SUCCESS:
      return {
        ...state,
        alerts: {
          data: action.data,
          lastUpdated: new Date(),
        },
      };
    case types.ALERT_LOGS_LIST_SUCCESS:
      return {
        ...state,
        alertsLog: {
          data: action.data,
          lastUpdated: new Date(),
        },
      };
    default:
      return state;
  }
}
