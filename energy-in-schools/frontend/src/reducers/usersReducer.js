import objectAssign from 'object-assign';
import * as types from '../constants/actionTypes';

const initialState = {
  currentUser: {},
  schoolUsers: {
    lastUpdated: new Date(),
    data: [],
  },
};

export default function usersReducer(state = initialState, action) {
  let newState;

  switch (action.type) {
    case types.USER_DATA_SUCCESS:
      newState = objectAssign({}, state);
      newState.currentUser = action.data;
      return newState;
    case types.USER_DATA_CLEAN:
      return {
        ...state,
        currentUser: {},
      };
    case types.SCHOOL_USERS_DATA_SUCCESS:
      return {
        ...state,
        schoolUsers: {
          lastUpdated: new Date(),
          data: action.data,
        },
      };

    default:
      return state;
  }
}
