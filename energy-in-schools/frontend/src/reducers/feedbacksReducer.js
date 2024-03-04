import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function feedbacksReducer(state = initialState, action) {
  switch (action.type) {
    case types.FEEDBACKS_LIST_DATA_SUCCESS:
      return Object.assign({}, state, { lastUpdated: new Date(), data: action.data });
    default:
      return state;
  }
}
