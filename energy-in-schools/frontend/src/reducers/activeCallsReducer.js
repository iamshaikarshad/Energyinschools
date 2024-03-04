import * as types from '../constants/actionTypes';

export default function activeCallsReducer(state = 0, action) {
  let newState;

  switch (action.type) {
    case types.API_CALL_STARTED: {
      newState = state;
      newState += 1;
      return newState;
    }
    case types.API_CALL_FINISHED: {
      newState = state;
      newState -= 1;
      return newState;
    }
    default:
      return state;
  }
}
