import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function smartThingsDevicesReducer(state = initialState, action) {
  switch (action.type) {
    case types.SCHOOLS_MONITORING_SCHOOL_SMARTTHINGS_DEVICES_DATA_SUCCESS:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
