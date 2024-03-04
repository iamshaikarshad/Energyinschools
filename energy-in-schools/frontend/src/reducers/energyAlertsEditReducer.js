import { ALERT_EDIT } from '../constants/actionTypes';

const initialState = {};

const changeAlertPropertiesInState = (state, alertId, difference) => ({
  ...state,
  [alertId]: {
    ...state[alertId],
    ...difference,
  },
});

export default function energyAlertsEditReducer(state = initialState, action) {
  switch (action.type) {
    case ALERT_EDIT.start:
      return {
        ...state,
        [action.alertId]: action.alertData,
      };
    case ALERT_EDIT.cancel: {
      const newState = Object.assign({}, state);
      delete newState[action.alertId];
      return newState;
    }
    case ALERT_EDIT.editEnergyType: {
      return changeAlertPropertiesInState(state, action.alertId, { alertType: action.alertType, meter: {} });
    }
    case ALERT_EDIT.editLocationMeter: {
      return changeAlertPropertiesInState(state, action.alertId, { location: action.location, meter: action.meter });
    }
    case ALERT_EDIT.editEnergyLimit: {
      return changeAlertPropertiesInState(state, action.alertId, { energyLimit: action.energyLimit });
    }
    case ALERT_EDIT.editDuration: {
      return changeAlertPropertiesInState(state, action.alertId, { limitDuration: action.duration });
    }
    case ALERT_EDIT.editPercentage: {
      return changeAlertPropertiesInState(state, action.alertId, { percentageLimit: action.percentageLimit });
    }
    case ALERT_EDIT.editType: {
      return changeAlertPropertiesInState(state, action.alertId, { alertType: action.alertType });
    }
    case ALERT_EDIT.editPeriod: {
      return changeAlertPropertiesInState(state, action.alertId, { limitPeriodStart: action.periodFrom, limitPeriodEnd: action.periodTo });
    }
    case ALERT_EDIT.editEnergyLimitCondition: {
      return changeAlertPropertiesInState(state, action.alertId, { limitCondition: action.limitCondition });
    }
    default:
      return state;
  }
}
