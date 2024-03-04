import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  currentWeekHistoricalCost: [],
};

export default function currentWeekHistoricalCostReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.currentWeekHistoricalCost.success:
    case ENERGY_DASHBOARD_DATA.currentWeekHistoricalCost.failed:
      return {
        currentWeekHistoricalCost: action.data.values,
      };
    default:
      return state;
  }
}
