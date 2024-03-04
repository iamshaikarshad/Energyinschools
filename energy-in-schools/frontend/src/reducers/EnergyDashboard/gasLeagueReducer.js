import * as types from '../../constants/actionTypes';

import {
  PREVIEW_MESSAGES_SCREEN_NAME,
  PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP,
} from '../../components/EnergyScreenDashboard/constants';

const initialState = {
  gasYesterdayLeagueData: null,
  previewMessages: [],
};

export default function gasLeagueReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.gasLeague.success:
    case types.ENERGY_DASHBOARD_DATA.gasLeague.failed:
      return {
        ...state,
        gasYesterdayLeagueData: action.data,
      };
    case types.ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION[PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP[PREVIEW_MESSAGES_SCREEN_NAME.gasUsage]].success:
      return {
        ...state,
        previewMessages: action.data,
      };
    default:
      return state;
  }
}
