import * as types from '../../constants/actionTypes';

const initialState = {
  electricityLiveData: null,
};

export default function electricityLiveConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.liveConsumptionByElectricityType.success:
    case types.ENERGY_DASHBOARD_DATA.liveConsumptionByElectricityType.failed:
      return {
        ...state,
        electricityLiveData: action.data,
      };
    default:
      return state;
  }
}
