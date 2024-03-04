import * as types from '../../constants/actionTypes';

const initialState = {
  gasTariffs: [],
};

export default function gasTariffsReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.gasTariffs.success:
    case types.ENERGY_DASHBOARD_DATA.gasTariffs.failed:
      return {
        gasTariffs: action.data,
      };
    default:
      return state;
  }
}
