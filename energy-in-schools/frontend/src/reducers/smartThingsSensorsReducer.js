import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function smartThingsSensorsReducer(state = initialState, action) {
  switch (action.type) {
    case types.SMARTTHINGS_SENSORS_LIST_DATA_SUCCESS:
      return {
        ...state,
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
