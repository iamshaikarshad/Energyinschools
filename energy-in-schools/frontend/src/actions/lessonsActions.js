import axios from 'axios';

import { sortBy } from 'lodash';

import { BASE_URL } from '../constants/config';
import {
  LESSONS_CATEGORIES_LIST_DATA_SUCCESS,
  LESSONS_GROUPS_LIST_DATA_SUCCESS,
  LESSONS_LIST_DATA_SUCCESS,
} from '../constants/actionTypes';
import { hideLoader, showLoader, showMessageSnackbar } from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';

import saveFile from '../utils/saveFile';

import { LESSON_NUMERATION_DEFINING_PROPS } from '../components/Lessons/constants';

export function getLessonsCategories() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/lessons/lesson-groups/`)
      .then((response) => {
        const data = [...response.data].sort((a, b) => a.id - b.id);
        dispatch({
          type: LESSONS_CATEGORIES_LIST_DATA_SUCCESS,
          data,
        });
        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getLessonsGroups() {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/lessons/lesson-groups-new/`)
      .then((response) => {
        const data = [...response.data].sort((a, b) => a.id - b.id);

        data.forEach(item => item.lesson_plans.sort((a, b) => a.id - b.id));
        dispatch({
          type: LESSONS_GROUPS_LIST_DATA_SUCCESS,
          data,
        });

        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function getLessonCategory(categoryId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/lessons/lesson-groups/${categoryId}/`)
      .then((response) => {
        const { data } = response;
        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(hideLoader());
        reject(error);
      });
  });
}

export function getLessons(lessonCategoryId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/lessons/lesson-plans/`, { params: { lesson_group: lessonCategoryId } })
      .then((response) => {
        const data = sortBy([...response.data], LESSON_NUMERATION_DEFINING_PROPS);
        dispatch({
          type: LESSONS_LIST_DATA_SUCCESS,
          data,
        });
        resolve(data);
        dispatch(hideLoader());
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function downloadLessonMaterials(lessonPlanUrl, defaultFileName = 'lesson_materials') {
  return (dispatch) => {
    dispatch(showLoader());
    axios.get(`${lessonPlanUrl}`, { responseType: 'arraybuffer' })
      .then((response) => {
        dispatch(hideLoader());
        saveFile(response, defaultFileName);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        console.log(error); // eslint-disable-line no-console
      });
  };
}
