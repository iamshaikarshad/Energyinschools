import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  lastWeekHistoricalCost: [],
};

export default function lastWeekHistoricalCostReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.lastWeekHistoricalCost.success:
    case ENERGY_DASHBOARD_DATA.lastWeekHistoricalCost.failed:
      return {
        lastWeekHistoricalCost: action.data.values,
      };
    default:
      return state;
  }
}
