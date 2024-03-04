import * as types from '../../constants/actionTypes';
import { LIVE_BY_METER_PROP } from '../../components/FloorsMaps/constants';

const initialState = {};

export default function liveByMeterReducer(state = initialState, action) {
  switch (action.type) {
    case types.MAP_METER_LIVE_VALUE_UPDATED: {
      const { data: { id, value, unit } } = action;
      return {
        ...state,
        [id]: {
          ...state[id],
          [LIVE_BY_METER_PROP.valueData]: {
            lastUpdated: new Date(),
            value,
            unit,
          },
        },
      };
    }
    case types.MAP_METER_STATE_UPDATED: {
      const { data: { id, state: meterState, unit } } = action;
      return {
        ...state,
        [id]: {
          ...state[id],
          [LIVE_BY_METER_PROP.stateData]: {
            lastUpdated: new Date(),
            state: meterState,
            unit,
          },
        },
      };
    }
    default:
      return state;
  }
}
