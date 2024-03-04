import * as types from '../../constants/actionTypes';

import {
  PREVIEW_MESSAGES_SCREEN_NAME,
  PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP,
} from '../../components/EnergyScreenDashboard/constants';

const initialState = {
  electricityLeagueData: null,
  previewMessages: [],
};

export default function electricityLeagueReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.electricityLeague.success:
    case types.ENERGY_DASHBOARD_DATA.electricityLeague.failed:
      return {
        ...state,
        electricityLeagueData: action.data,
      };
    case types.ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION[PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP[PREVIEW_MESSAGES_SCREEN_NAME.electricityUsage]].success:
      return {
        ...state,
        previewMessages: action.data,
      };
    default:
      return state;
  }
}
