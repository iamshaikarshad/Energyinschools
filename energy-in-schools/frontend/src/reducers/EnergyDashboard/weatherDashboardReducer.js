import * as types from '../../constants/actionTypes';

const initialState = {
  currentWeather: null,
  forecastWeather: null,
};

export default function weatherDashboardReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.currentWeather.success:
    case types.ENERGY_DASHBOARD_DATA.currentWeather.failed:
      return {
        ...state,
        currentWeather: action.data,
      };
    case types.ENERGY_DASHBOARD_DATA.forecastWeather.success:
    case types.ENERGY_DASHBOARD_DATA.forecastWeather.failed:
      return {
        ...state,
        forecastWeather: action.data,
      };
    default:
      return state;
  }
}
