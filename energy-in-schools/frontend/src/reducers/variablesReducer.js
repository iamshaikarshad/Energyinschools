import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function variablesReducer(state = initialState, action) {
  switch (action.type) {
    case types.VARIABLES_LIST_DATA_SUCCESS:
      return Object.assign({}, state, { lastUpdated: new Date(), data: action.data });
    default:
      return state;
  }
}
