import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function comparisonQuotesReducer(state = initialState, action) {
  switch (action.type) {
    case types.TARIFFS_COMPARISON_QUOTES_DATA_SUCCESS:
    case types.TARIFFS_COMPARISON_QUOTES_DATA_FAIL:
      return {
        lastUpdated: new Date(),
        data: action.data || [],
      };
    default:
      return state;
  }
}
