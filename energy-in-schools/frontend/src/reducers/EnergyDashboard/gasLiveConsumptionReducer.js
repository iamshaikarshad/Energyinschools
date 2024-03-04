import * as types from '../../constants/actionTypes';

const initialState = {
  gasLiveData: null,
};

export default function gasLiveConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.liveConsumptionByGasType.success:
    case types.ENERGY_DASHBOARD_DATA.liveConsumptionByGasType.failed:
      return {
        ...state,
        gasLiveData: action.data,
      };
    default:
      return state;
  }
}
