import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: null,
};

export default function periodsConsumptionReducer(state = initialState, action) {
  switch (action.type) {
    case types.TARIFFS_COMPARISON_PERIODS_CONSUMPTION_DATA_SUCCESS:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
