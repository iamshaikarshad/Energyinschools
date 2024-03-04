import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function providersReducer(state = initialState, action) {
  switch (action.type) {
    case types.PROVIDERS_LIST_DATA_SUCCESS:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
