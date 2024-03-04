import { combineReducers } from 'redux';
import schoolsMonitoringListReducer from './schoolsMonitoringListReducer';
import offPeakyPointsHistoricalDataReducer from './offPeakyPointsHistoricalDataReducer';
import smartThingsDevicesReducer from './smartThingsDevicesReducer';

const schoolsMonitoringReducer = combineReducers({
  schools: schoolsMonitoringListReducer,
  offPeakyPointsHistoricalData: offPeakyPointsHistoricalDataReducer,
  smartThingsDevices: smartThingsDevicesReducer,
});

export default schoolsMonitoringReducer;
