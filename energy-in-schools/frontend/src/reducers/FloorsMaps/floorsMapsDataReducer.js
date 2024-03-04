import { combineReducers } from 'redux';

import mapMetersReducer from './mapMetersReducer';
import liveByMeterReducer from './liveByMeterReducer';

const floorsMapsDataReducer = combineReducers({
  mapMeters: mapMetersReducer,
  liveByMeter: liveByMeterReducer,
});

export default floorsMapsDataReducer;
