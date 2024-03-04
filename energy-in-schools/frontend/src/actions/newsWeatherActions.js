import axios from 'axios';
import {
  CURRENT_WEATHER_DATA_SUCCESS,
  FORECAST_WEATHER_DATA_SUCCESS,
  NEWS_DATA_SUCCESS,
} from '../constants/actionTypes';

import { BASE_URL } from '../constants/config';
import formatErrorMessageFromError from '../utils/errorHandler';

import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';

export function getCurrentWeather(locationUID) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/weathers/current/`, { params: { location_uid: locationUID } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: CURRENT_WEATHER_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function getWeatherForecast(locationUID) {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/weathers/forecast/`, { params: { location_uid: locationUID } })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: FORECAST_WEATHER_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}

export function getNewsList() {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/news/recent/`, {
      params: {
        limit: 2,
      },
    })
      .then((response) => {
        const data = response.data;
        dispatch({
          type: NEWS_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}
