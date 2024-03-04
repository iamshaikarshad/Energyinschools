import { LESSONS_GROUPS_LIST_DATA_SUCCESS } from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function lessonsGroupsReducer(state = initialState, action) {
  switch (action.type) {
    case LESSONS_GROUPS_LIST_DATA_SUCCESS:
      return { lastUpdated: new Date(), data: action.data };
    default:
      return state;
  }
}
