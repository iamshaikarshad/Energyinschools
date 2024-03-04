import * as types from '../../constants/actionTypes';

const initialState = {
  gasYesterdayCost: null,
};

export default function gasYesterdayCostReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.gasYesterdayCost.success:
    case types.ENERGY_DASHBOARD_DATA.gasYesterdayCost.failed:
      return {
        ...state,
        gasYesterdayCost: action.data,
      };
    default:
      return state;
  }
}
