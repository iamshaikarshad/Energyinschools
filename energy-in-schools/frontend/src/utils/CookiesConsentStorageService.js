const COOKIES_CONSENT_STORAGE_KEY = 'cookiesConsent';
const COOKIES_CONSENT_STORAGE_DEFAULT_STATE = {
  accepted: null,
  lastCheckedAt: null,
};

class CookiesConsentStorageService {
  static getInfo() {
    return JSON.parse(localStorage.getItem(COOKIES_CONSENT_STORAGE_KEY)) || COOKIES_CONSENT_STORAGE_DEFAULT_STATE;
  }

  static setInfo(data) {
    localStorage.setItem(COOKIES_CONSENT_STORAGE_KEY, JSON.stringify(data));
  }
}

export default CookiesConsentStorageService;
