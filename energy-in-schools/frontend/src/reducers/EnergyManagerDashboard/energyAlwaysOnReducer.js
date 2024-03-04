import { ENERGY_MANAGER_DASHBOARD_DATA } from '../../constants/actionTypes';
import { ENERGY_MANAGER_DASHBOARD_ITEM_NAME } from '../../containers/SEMAdminPages/EnergyManagerDashboard/constants';

const initialState = {
  loading: true,
  alwaysOnData: null,
  energyTariffs: [],
};

export default function energyAlwaysOnReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_MANAGER_DASHBOARD_DATA.loading[ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyAlwaysOn].success:
      return {
        ...state,
        loading: true,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.loading[ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyAlwaysOn].failed:
      return {
        ...state,
        loading: false,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.energyAlwaysOn.success:
    case ENERGY_MANAGER_DASHBOARD_DATA.energyAlwaysOn.failed:
      return {
        ...state,
        alwaysOnData: action.data,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.currentEnergyTariffs.success:
      return {
        ...state,
        energyTariffs: action.data,
      };
    case ENERGY_MANAGER_DASHBOARD_DATA.currentEnergyTariffs.failed:
      return {
        ...state,
        energyTariffs: [],
      };
    default:
      return state;
  }
}
