const BROWSER_SUPPORT_STORAGE_KEY = 'browserSupportInfo';
const BROWSER_SUPPORT_STORAGE_DEFAULT_VALUE = {
  supported: true,
  lastCheckedAt: 0,
};

export default class BrowserSupportStorageManager {
  constructor() {
    this.browserSupportInfo = JSON.parse(localStorage.getItem(BROWSER_SUPPORT_STORAGE_KEY));
    if (!this.browserSupportInfo) {
      this.browserSupportInfo = BROWSER_SUPPORT_STORAGE_DEFAULT_VALUE;
    }
  }

  get info() {
    return this.browserSupportInfo;
  }

  set info(data) {
    this.browserSupportInfo = data;
    localStorage.setItem(BROWSER_SUPPORT_STORAGE_KEY, JSON.stringify(data));
  }
}
