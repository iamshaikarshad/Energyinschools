import * as types from '../../constants/actionTypes';

import {
  PREVIEW_MESSAGES_SCREEN_NAME,
  PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP,
} from '../../components/EnergyScreenDashboard/constants';

const initialState = {
  offPeakyLeagueData: null,
  offPeakyYesterdayValue: null,
  previewMessages: [],
};

export default function offPeakyLeagueReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.offPeakyLeague.success:
    case types.ENERGY_DASHBOARD_DATA.offPeakyLeague.failed:
      return {
        ...state,
        offPeakyLeagueData: action.data,
      };
    case types.ENERGY_DASHBOARD_DATA.offPeakyYesterdayValue.success:
    case types.ENERGY_DASHBOARD_DATA.offPeakyYesterdayValue.failed: {
      const { current } = action.data;
      return {
        ...state,
        offPeakyYesterdayValue: current,
      };
    }
    case types.ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION[PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP[PREVIEW_MESSAGES_SCREEN_NAME.offPeakyPoints]].success:
      return {
        ...state,
        previewMessages: action.data,
      };
    default:
      return state;
  }
}
