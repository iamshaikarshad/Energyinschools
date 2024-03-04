import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  electricityTodayCost: null,
};

export default function electricityTodayCostReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.electricityTodayCost.success:
    case ENERGY_DASHBOARD_DATA.electricityTodayCost.failed:
      return {
        ...state,
        electricityTodayCost: action.data,
      };
    default:
      return state;
  }
}
