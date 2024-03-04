import objectAssign from 'object-assign';
import * as types from '../constants/actionTypes';

const initialState = {
  registrationSchoolDialogOpened: false,
  microbitDialogOpened: false,
  editorHelpDialogOpened: false,
  alert: {
    opened: false,
    header: '',
    content: '',
  },
  messageSnackbar: {
    opened: false,
    content: '',
  },
  questionnaireDialogOpened: false,
  trialExpiryAlert: {
    isOpen: false,
    showGreetingText: false,
    expiryDate: '',
  },
};

export default function dialogsReducer(state = initialState, action) {
  let newState;

  switch (action.type) {
    case types.TOOGLE_REGISTRATION_SCHOOL_DIALOG: {
      newState = objectAssign({}, state);
      newState.registrationSchoolDialogOpened = !newState.registrationSchoolDialogOpened;
      return newState;
    }

    case types.TOOGLE_MICROBIT_DIALOG: {
      newState = objectAssign({}, state);
      newState.microbitDialogOpened = !newState.microbitDialogOpened;
      return newState;
    }

    case types.TOOGLE_EDITOR_HELP_DIALOG: {
      newState = objectAssign({}, state);
      newState.editorHelpDialogOpened = !newState.editorHelpDialogOpened;
      return newState;
    }

    case types.SHOW_ALERT_DIALOG:
      return {
        ...state,
        alert: {
          ...state.alert,
          opened: true,
          header: action.header,
          content: action.content,
        },
      };

    case types.HIDE_ALERT_DIALOG:
      return {
        ...state,
        alert: {
          ...state.alert,
          opened: false,
        },
      };

    case types.SHOW_MESSAGE_SNACKBAR:
      return {
        ...state,
        messageSnackbar: {
          ...state.messageSnackbar,
          opened: true,
          content: action.content,
        },
      };

    case types.HIDE_MESSAGE_SNACKBAR:
      return {
        ...state,
        messageSnackbar: {
          ...state.messageSnackbar,
          opened: false,
        },
      };

    case types.TOGGLE_QUESTIONNAIRE_DIALOG: {
      newState = { ...state };
      newState.questionnaireDialogOpened = !newState.questionnaireDialogOpened;
      return newState;
    }

    case types.SHOW_TRIAL_EXPIRY_ALERT_DIALOG:
      return {
        ...state,
        trialExpiryAlert: {
          ...state.trialExpiryAlert,
          isOpen: true,
          showGreetingText: action.showGreetingText,
          expiryDate: action.expiryDate,
        },
      };

    case types.HIDE_TRIAL_EXPIRY_ALERT_DIALOG:
      return {
        ...state,
        trialExpiryAlert: {
          ...state.trialExpiryAlert,
          isOpen: false,
        },
      };

    default:
      return state;
  }
}
