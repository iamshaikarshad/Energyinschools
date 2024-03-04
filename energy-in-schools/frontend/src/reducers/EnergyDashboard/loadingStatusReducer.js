import * as types from '../../constants/actionTypes';

const initialState = {
  status: true,
};

export default function loadingStatusReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.loadingEnds.success:
      return {
        status: true,
      };
    case types.ENERGY_DASHBOARD_DATA.loadingEnds.failed:
      return {
        status: false,
      };
    default:
      return state;
  }
}
