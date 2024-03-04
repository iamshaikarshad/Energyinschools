import { ENERGY_MANAGER_DASHBOARD_DATA } from '../../constants/actionTypes';
import { ENERGY_MANAGER_DASHBOARD_ITEM_NAME } from '../../containers/SEMAdminPages/EnergyManagerDashboard/constants';

const initialState = {
  loading: true,
  consumptionData: null,
  costData: null,
};

export default function energyTotalConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_MANAGER_DASHBOARD_DATA.loading[ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyTotalConsumption].success:
      return {
        ...state,
        loading: true,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.loading[ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyTotalConsumption].failed:
      return {
        ...state,
        loading: false,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.energyTotalConsumption.success:
    case ENERGY_MANAGER_DASHBOARD_DATA.energyTotalConsumption.failed:
      return {
        ...state,
        consumptionData: action.data,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.energyTotalCost.success:
    case ENERGY_MANAGER_DASHBOARD_DATA.energyTotalCost.failed:
      return {
        ...state,
        costData: action.data,
      };
    default:
      return state;
  }
}
