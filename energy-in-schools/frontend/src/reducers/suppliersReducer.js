import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function suppliersReducer(state = initialState, action) {
  switch (action.type) {
    case types.SUPPLIERS_DATA_SUCCESS:
      return { ...state, lastUpdated: new Date(), data: action.data };
    default:
      return state;
  }
}
