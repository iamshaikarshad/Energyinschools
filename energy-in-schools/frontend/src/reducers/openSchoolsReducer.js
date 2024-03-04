import { OPEN_SCHOOLS_DATA_SUCCESS } from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function openSchoolsReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_SCHOOLS_DATA_SUCCESS:
      return { lastUpdated: new Date(), data: action.data.schools };
    default:
      return state;
  }
}
