const TRIAL_EXPIRY_ALERT_STORAGE_KEY = 'trialExpiryInfo';
const TRIAL_EXPIRY_ALERT_STORAGE_DEFAULT_VALUE = {
  lastShownDate: null,
};

export default class TrialExpiryAlertStorageManager {
  constructor() {
    this.trialExpiryInfo = JSON.parse(localStorage.getItem(TRIAL_EXPIRY_ALERT_STORAGE_KEY));
    if (!this.trialExpiryInfo) {
      this.trialExpiryInfo = TRIAL_EXPIRY_ALERT_STORAGE_DEFAULT_VALUE;
    }
  }

  get info() {
    return this.trialExpiryInfo;
  }

  set info(data) {
    this.trialExpiryInfo = data;
    localStorage.setItem(TRIAL_EXPIRY_ALERT_STORAGE_KEY, JSON.stringify(data));
  }
}
