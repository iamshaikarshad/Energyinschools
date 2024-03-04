import * as types from '../constants/actionTypes';

const initialState = {};

export default function smartThingsLiveBySensorReducer(state = initialState, action) {
  switch (action.type) {
    case types.SMARTTHINGS_SENSOR_LOADING_LIVE_VALUE: {
      const { id, loading } = action.data;
      return {
        ...state,
        [id]: {
          ...state[id],
          loading,
        },
      };
    }
    case types.SMARTTHINGS_SENSOR_LIVE_VALUE_SUCCESS:
    case types.SMARTTHINGS_SENSOR_LIVE_VALUE_FAIL: {
      const { id, value, unit } = action.data;
      return {
        ...state,
        [id]: {
          ...state[id],
          value,
          unit,
          loading: false,
        },
      };
    }
    default:
      return state;
  }
}
