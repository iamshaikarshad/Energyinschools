import * as types from '../../constants/actionTypes';

const initialState = {
  goal: null,
  current: null,
};

export default function cashbackReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.cashBack.success:
    case types.ENERGY_DASHBOARD_DATA.cashBack.failed: {
      const { goal, current } = action.data;
      return {
        ...state,
        goal,
        current,
      };
    }
    default:
      return state;
  }
}
