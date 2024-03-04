import * as types from '../../constants/actionTypes';

const initialState = {
  news: null,
};

export default function newsDashboardReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.news.success:
    case types.ENERGY_DASHBOARD_DATA.news.failed:
      return {
        ...state,
        news: action.data,
      };
    default:
      return state;
  }
}
