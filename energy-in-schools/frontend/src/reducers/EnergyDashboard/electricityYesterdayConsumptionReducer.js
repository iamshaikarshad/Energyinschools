import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  electricityYesterdayData: null,
};

export default function electricityYesterdayConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.yesterdayConsumptionByElectricityType.success:
    case ENERGY_DASHBOARD_DATA.yesterdayConsumptionByElectricityType.failed:
      return {
        ...state,
        electricityYesterdayData: action.data,
      };
    default:
      return state;
  }
}
