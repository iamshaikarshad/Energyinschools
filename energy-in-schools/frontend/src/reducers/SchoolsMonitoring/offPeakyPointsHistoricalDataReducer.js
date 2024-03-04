import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function offPeakyPointsHistoricalDataReducer(state = initialState, action) {
  switch (action.type) {
    case types.SCHOOLS_MONITORING_SCHOOL_OFF_PEAKY_POINTS_HISTORICAL_DATA_SUCCESS:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    default:
      return state;
  }
}
