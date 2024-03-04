import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function mapMetersReducer(state = initialState, action) {
  switch (action.type) {
    case types.MAP_METERS_LIST_DATA_SUCCESS:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    case types.MAP_METERS_UPDATED:
      return Object.assign({}, state, { data: action.data });
    default:
      return state;
  }
}
