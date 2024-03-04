import { ALERT_EDIT } from '../constants/actionTypes';


export function startEnergyAlertEdit(alertId, alertData) {
  return {
    type: ALERT_EDIT.start,
    alertId,
    alertData,
  };
}

export function cancelEnergyAlertEdit(alertId) {
  return {
    type: ALERT_EDIT.cancel,
    alertId,
  };
}

export function editEnergyType(alertId, newType) {
  return {
    type: ALERT_EDIT.editEnergyType,
    alertId,
    alertType: newType,
  };
}

export function editLocationMeter(alertId, newLocation, newMeter) {
  return {
    type: ALERT_EDIT.editLocationMeter,
    alertId,
    location: newLocation,
    meter: newMeter,
  };
}

export function editEnergyLimitCondition(alertId, newLimitCondition) {
  return {
    type: ALERT_EDIT.editEnergyLimitCondition,
    alertId,
    limitCondition: newLimitCondition,
  };
}


export function editEnergyLimit(alertId, newLimit) {
  return {
    type: ALERT_EDIT.editEnergyLimit,
    alertId,
    energyLimit: newLimit,
  };
}

export function editDuration(alertId, newDuration) {
  return {
    type: ALERT_EDIT.editDuration,
    alertId,
    duration: newDuration,
  };
}

export function editPeriod(alertId, from, to) {
  return {
    type: ALERT_EDIT.editPeriod,
    alertId,
    periodFrom: from,
    periodTo: to,
  };
}

export function editPercentage(alertId, percentageLimit) {
  return {
    type: ALERT_EDIT.editPercentage,
    alertId,
    percentageLimit,
  };
}

export function editAlertType(alertId, alertType) {
  return {
    type: ALERT_EDIT.editType,
    alertId,
    alertType,
  };
}
