import { combineReducers } from 'redux';

import energyTotalConsumptionReducer from './energyTotalConsumptionReducer';
import energyAlwaysOnReducer from './energyAlwaysOnReducer';

import { ENERGY_MANAGER_DASHBOARD_ITEM_NAME } from '../../containers/SEMAdminPages/EnergyManagerDashboard/constants';

const energyManagerDashboardReducer = combineReducers({
  [ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyTotalConsumption]: energyTotalConsumptionReducer,
  [ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyAlwaysOn]: energyAlwaysOnReducer,
});

export default energyManagerDashboardReducer;
