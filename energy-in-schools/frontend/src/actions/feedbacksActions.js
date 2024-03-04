import axios from 'axios';
import { BASE_URL } from '../constants/config';
import { FEEDBACKS_LIST_DATA_SUCCESS } from '../constants/actionTypes';
import {
  hideLoader,
  showLoader,
  showMessageSnackbar,
} from './dialogActions';
import formatErrorMessageFromError from '../utils/errorHandler';
import { FEEDBACK_SORT_RULES } from '../components/Feedback/constants';

export function getFeedbacks(myOwnlocation = false) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.get(`${BASE_URL}/forum/topics/`, { params: { own_location_only: myOwnlocation } })
      .then((response) => {
        const data = [...response.data].sort(FEEDBACK_SORT_RULES.byCreationTime);
        dispatch({
          type: FEEDBACKS_LIST_DATA_SUCCESS,
          data,
        });
        dispatch(hideLoader());
        resolve(response);
      }).catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function createFeedback(author, location, type, content, tags) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/forum/topics/`, {
      author,
      location,
      content,
      type,
      tags,
    })
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function editFeedback(feedbackId, location, type, content, tags) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/forum/topics/${feedbackId}/`, {
      location,
      content,
      type,
      tags,
    })
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function deleteFeedback(feedbackId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.delete(`${BASE_URL}/forum/topics/${feedbackId}/`)
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function createComment(userId, feedbackId, content) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.post(`${BASE_URL}/forum/comments/`, {
      author: userId,
      topic: feedbackId,
      content,
    })
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function editComment(feedbackId, commentId, content) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.put(`${BASE_URL}/forum/comments/${commentId}/`, {
      topic: feedbackId,
      content,
    })
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}

export function deleteComment(commentId) {
  return dispatch => new Promise((resolve, reject) => {
    dispatch(showLoader());
    axios.delete(`${BASE_URL}/forum/comments/${commentId}/`)
      .then((response) => {
        dispatch(hideLoader());
        resolve(response);
      })
      .catch((error) => {
        dispatch(showMessageSnackbar(formatErrorMessageFromError(error)));
        dispatch(hideLoader());
        reject(error);
        console.log(error); // eslint-disable-line no-console
      });
  });
}
