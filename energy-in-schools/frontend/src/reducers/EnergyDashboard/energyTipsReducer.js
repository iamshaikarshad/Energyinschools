import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: null,
};

export default function energyTipsReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.energyTips.success:
    case ENERGY_DASHBOARD_DATA.energyTips.failed:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
