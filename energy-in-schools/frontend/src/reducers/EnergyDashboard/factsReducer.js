import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: null,
};

export default function factsReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.facts.success:
    case types.ENERGY_DASHBOARD_DATA.facts.failed:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
