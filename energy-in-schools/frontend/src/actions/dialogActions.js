import * as types from '../constants/actionTypes';

export function toogleRegistrationSchoolDialog() {
  return {
    type: types.TOOGLE_REGISTRATION_SCHOOL_DIALOG,
  };
}

export function toogleMicrobitDialog() {
  return {
    type: types.TOOGLE_MICROBIT_DIALOG,
  };
}

export function toggleEditorHelpDialog() {
  return {
    type: types.TOOGLE_EDITOR_HELP_DIALOG,
  };
}

export function showAlert(header, content) {
  return {
    type: types.SHOW_ALERT_DIALOG,
    header,
    content,
  };
}

export function hideAlert() {
  return {
    type: types.HIDE_ALERT_DIALOG,
  };
}

export function showLoader() {
  return {
    type: types.API_CALL_STARTED,
  };
}

export function hideLoader() {
  return {
    type: types.API_CALL_FINISHED,
  };
}

export function hideMessageSnackbar() {
  return (dispatch) => {
    dispatch({
      type: types.HIDE_MESSAGE_SNACKBAR,
    });
  };
}

export function showMessageSnackbar(content, delay = 3000) {
  return (dispatch) => {
    dispatch({
      type: types.SHOW_MESSAGE_SNACKBAR,
      content,
    });
    setTimeout(() => { dispatch(hideMessageSnackbar()); }, delay);
  };
}

export function toggleQuestionnaireDialog() {
  return {
    type: types.TOGGLE_QUESTIONNAIRE_DIALOG,
  };
}

export function showTrialExpiryAlert(showGreetingText, expiryDate) {
  return {
    type: types.SHOW_TRIAL_EXPIRY_ALERT_DIALOG,
    showGreetingText,
    expiryDate,
  };
}

export function hideTrialExpiryAlert() {
  return {
    type: types.HIDE_TRIAL_EXPIRY_ALERT_DIALOG,
  };
}
