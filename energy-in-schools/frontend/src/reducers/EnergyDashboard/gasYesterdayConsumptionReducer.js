import * as types from '../../constants/actionTypes';

const initialState = {
  gasYesterdayData: null,
};

export default function gasYesterdayConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.yesterdayConsumptionByGasType.success:
    case types.ENERGY_DASHBOARD_DATA.yesterdayConsumptionByGasType.failed:
      return {
        ...state,
        gasYesterdayData: action.data,
      };
    default:
      return state;
  }
}
