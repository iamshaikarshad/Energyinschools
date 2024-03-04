import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function tariffSwitchesReducer(state = initialState, action) {
  switch (action.type) {
    case types.ALL_SWITCHES_DATA_SUCCESS:
      return { lastUpdated: new Date(), data: action.data };
    default:
      return state;
  }
}
