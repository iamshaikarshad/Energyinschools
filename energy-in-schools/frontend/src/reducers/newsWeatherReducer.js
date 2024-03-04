import * as types from '../constants/actionTypes';

const initialState = {
  currentWeather: {
    weather: {
      temperature: {
        minimal: 0,
        average: 0,
        maximal: 0,
      },
      clouds_percentage: 0,
      code: 0,

      pressure: {
        press: 10,
        sea_level: 0,
      },
      status: '',
      weather_at: '',
      wind: {
        speed: 0,
      },
    },
    location: {
      name: '',
    },
  },
  forecastWeather: {
    weathers: [],
    location: {
      name: '',
    },
  },
  weatherHistory: [],
  news: [],
};

export default function newsWeatherReducer(state = initialState, action) {
  switch (action.type) {
    case types.CURRENT_WEATHER_DATA_SUCCESS:
      return {
        ...state,
        currentWeather: action.data,
      };
    case types.FORECAST_WEATHER_DATA_SUCCESS:
      return {
        ...state,
        forecastWeather: action.data,
      };
    case types.NEWS_DATA_SUCCESS:
      return {
        ...state,
        news: action.data,
      };
    case types.WEATHER_HISTORY_DATA_SUCCESS:
      return {
        ...state,
        weatherHistory: action.data,
      };
    default:
      return state;
  }
}
