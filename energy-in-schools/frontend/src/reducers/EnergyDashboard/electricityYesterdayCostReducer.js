import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  electricityYesterdayCost: null,
};

export default function electricityYesterdayCostReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.electricityYesterdayCost.success:
    case ENERGY_DASHBOARD_DATA.electricityYesterdayCost.failed:
      return {
        ...state,
        electricityYesterdayCost: action.data,
      };
    default:
      return state;
  }
}
