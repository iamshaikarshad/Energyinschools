import * as types from '../constants/actionTypes';
import { UNIT, ELECTRICITY, GAS } from '../constants/config';

const initialState = {
  lastUpdated: new Date(),
  data: [],
  dashboardData: [
    { type: ELECTRICITY, value: 0, unit: UNIT.kilowatt },
    { type: GAS, value: 0, unit: UNIT.kilowatt },
  ],
};

export default function metersReducer(state = initialState, action) {
  switch (action.type) {
    case types.METERS_LIST_DATA_SUCCESS: {
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    }
    case types.METERS_LIST_SCHOOL_DASHBOARD_SUCCESS: {
      const newData = [...state.dashboardData];

      // eslint-disable-next-line no-restricted-syntax
      for (const record in newData) {
        if (newData[record].type === action.data.type) {
          newData[record] = action.data;
        }
      }

      return {
        lastUpdated: new Date(),
        dashboardData: newData,
      };
    }
    case types.METERS_LIST_SCHOOL_DASHBOARD_FAILED:
      return {
        lastUpdated: new Date(),
        dashboardData: [...state.dashboardData],
      };
    default:
      return state;
  }
}
