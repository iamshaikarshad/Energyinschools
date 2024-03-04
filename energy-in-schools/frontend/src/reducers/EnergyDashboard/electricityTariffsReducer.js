import * as types from '../../constants/actionTypes';

const initialState = {
  electricityTariffs: [],
};

export default function electricityTariffsReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.electricityTariffs.success:
    case types.ENERGY_DASHBOARD_DATA.electricityTariffs.failed:
      return {
        electricityTariffs: action.data,
      };
    default:
      return state;
  }
}
