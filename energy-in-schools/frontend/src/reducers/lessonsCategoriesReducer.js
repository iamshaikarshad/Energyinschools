import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function lessonsCategoriesReducer(state = initialState, action) {
  switch (action.type) {
    case types.LESSONS_CATEGORIES_LIST_DATA_SUCCESS:
      return { lastUpdated: new Date(), data: action.data };
    default:
      return state;
  }
}
