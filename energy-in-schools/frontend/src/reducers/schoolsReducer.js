import { omit } from 'lodash';
import * as types from '../constants/actionTypes';
import { REGISTRATION_REQUEST_STATUS } from '../components/SchoolRegistration/constants';


const initialState = {
  activeSchool: {},
  allLocations: {
    data: [],
    lastUpdated: new Date(),
  },
  requests: Object.values(REGISTRATION_REQUEST_STATUS).reduce((res, item) => {
    res[item] = [];
    return res;
  }, {}),
  energyMood: {},
  schoolsCashback: [],
  schoolsAlwaysOn: [],
};

export default function schoolsReducer(state = initialState, action) {
  switch (action.type) {
    case types.SCHOOL_REQUESTS_DATA_SUCCESS:
      return {
        ...state,
        requests: {
          ...state.requests,
          ...omit(action, ['type']),
        },
      };
    case types.SCHOOL_DATA_SUCCESS:
      return {
        ...state,
        activeSchool: action.data,
      };
    case types.ALL_SCHOOLS_DATA_SUCCESS:
      return {
        ...state,
        allLocations: {
          ...state.allLocations,
          data: action.data,
          lastUpdated: new Date(),
        },
      };
    case types.FETCH_SCHOOL_ENERGY_MOOD_SUCCESS:
      return {
        ...state,
        energyMood: action.data,
      };
    case types.SCHOOLS_CASHBACK_DATA_SUCCESS:
      return {
        ...state,
        schoolsCashback: action.data,
      };
    case types.SCHOOLS_ALWAYS_ON_DATA_SUCCESS:
      return {
        ...state,
        schoolsAlwaysOn: action.data,
      };
    default:
      return state;
  }
}
