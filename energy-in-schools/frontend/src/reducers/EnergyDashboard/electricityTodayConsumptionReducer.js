import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  electricityTodayData: null,
};

export default function electricityTodayConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.todayConsumptionByElectricityType.success:
    case ENERGY_DASHBOARD_DATA.todayConsumptionByElectricityType.failed:
      return {
        ...state,
        electricityTodayData: action.data,
      };
    default:
      return state;
  }
}
