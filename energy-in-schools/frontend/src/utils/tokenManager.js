/* eslint-disable no-underscore-dangle,no-undef */
import { ADMIN_ROLE, TOKEN_TYPE } from '../constants/config';

const jwtDecode = require('jwt-decode');

const INVALID_INPUT_PARAMS_ERROR = 'Invalid input parameters';

const ACCESS_TOKEN_KEY = 'access';
const REFRESH_TOKEN_KEY = 'refresh';
const USER_ID_KEY = 'user_id';
const USER_ROLE_KEY = 'role';
const LOCATION_ID_KEY = 'location_id';
const REGISTRATION_STATUS_KEY = 'registration_status';
const TRIAL_ENDS_DATE_KEY = 'trial_ends_on';

const storage = localStorage;

let _accessToken = null;
let _refreshToken = null;
let _userId = null;
let _userRole = null;
let _locationId = null;
let _registrationStatus = null;
let _trialEndsDate = null;

/**
 * Set item to Storage by key
 * @param {String} key Storage key
 * @param {*} value Storage value
 * @private
 */
function _setToStorage(key, value) {
  storage.setItem(key, value);
}

/**
 * Serialize tokens
 * @param {String} accessToken Access-Token
 * @param {String} refreshToken Refresh-Token
 * @return {String} Serialized tokens
 * @private
 */
function _serializeTokens(accessToken, refreshToken) {
  let data = {};

  data[ACCESS_TOKEN_KEY] = accessToken;
  data[REFRESH_TOKEN_KEY] = refreshToken;

  data = JSON.stringify(data);

  return data;
}

/**
 * Deserialize tokens
 * @param {String} serializedData Serialized JSON data
 * @returns {Object} Deserialized tokens
 * @private
 */
function _deserializeTokens(serializedData) {
  let result = {};

  try {
    if (serializedData) {
      result = JSON.parse(serializedData);
    }
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
  }

  return result;
}

/**
 * Get UserId from Access-Token
 * @param {String} token Access-Token
 * @return {String} UserId or empty string
 * @private
 */
function _getUserIdFromToken(token) {
  const data = jwtDecode(token);

  return (data && data[USER_ID_KEY]) || '';
}

/**
 * Get User role from Access-Token
 * @param {String} token Access-Token
 * @return {String} User role or empty string
 * @private
 */
function _getUserRoleFromToken(token) {
  const data = jwtDecode(token);
  return (data && data[USER_ROLE_KEY]) || ADMIN_ROLE;
}

/**
 * Get location Id from Access-Token
 * @param {String} token Access-Token
 * @return {String} location id from token or empty string
 * @private
 */
function _getLocationIdFromToken(token) {
  const data = jwtDecode(token);
  return (data && data[LOCATION_ID_KEY]) || '';
}

/**
 * Returns String that is a key to localstorage for getting token based on URL
 * TODO Could be extended for different tokens based on location
 * Now only dashboard token available
 *
 */
function getTokenKeyOnLocation() {
  if (window.location.pathname.startsWith('/energy-dashboard')) {
    return TOKEN_TYPE.DASHBOARD_AUTH;
  }
  return TOKEN_TYPE.API_AUTH;
}

function _getRegistrationStatusFromToken(token) {
  const data = jwtDecode(token);
  return (data && data[REGISTRATION_STATUS_KEY]) || '';
}

function _getTrialEndsDate(token) {
  const data = jwtDecode(token);
  return (data && data[TRIAL_ENDS_DATE_KEY]) || '';
}

/**
 * Initialize TokenManager
 * @private
 */
function _init() {
  const serializedData = storage.getItem(getTokenKeyOnLocation());
  const tokens = _deserializeTokens(serializedData);

  const accessToken = tokens[ACCESS_TOKEN_KEY];
  const refreshToken = tokens[REFRESH_TOKEN_KEY];

  if (!accessToken || !refreshToken) {
    return;
  }

  _accessToken = accessToken;
  _refreshToken = refreshToken;
  _userId = _getUserIdFromToken(accessToken);
  _userRole = _getUserRoleFromToken(accessToken);
  _locationId = _getLocationIdFromToken(accessToken);
  _registrationStatus = _getRegistrationStatusFromToken(accessToken);
  _trialEndsDate = _getTrialEndsDate(accessToken);
}

const TokenManager = {
  setTokens(tokens, tokenType = getTokenKeyOnLocation()) {
    if (typeof tokens !== 'object' || !tokens[ACCESS_TOKEN_KEY] || !tokens[REFRESH_TOKEN_KEY]) {
      throw new Error(INVALID_INPUT_PARAMS_ERROR);
    }

    const accessToken = tokens[ACCESS_TOKEN_KEY];
    const refreshToken = tokens[REFRESH_TOKEN_KEY];

    _accessToken = accessToken;
    _refreshToken = refreshToken;
    _userId = _getUserIdFromToken(accessToken);
    _userRole = _getUserRoleFromToken(accessToken);
    _locationId = _getLocationIdFromToken(accessToken);
    _registrationStatus = _getRegistrationStatusFromToken(accessToken);
    _trialEndsDate = _getTrialEndsDate(accessToken);

    _setToStorage(tokenType, _serializeTokens(accessToken, refreshToken));
  },

  refreshAuthToken(tokens, tokenType = getTokenKeyOnLocation()) {
    if (typeof tokens !== 'object' || !tokens[ACCESS_TOKEN_KEY]) {
      throw new Error(INVALID_INPUT_PARAMS_ERROR);
    }
    const accessToken = tokens[ACCESS_TOKEN_KEY];

    _accessToken = accessToken;
    _userId = _getUserIdFromToken(accessToken);

    _setToStorage(tokenType, _serializeTokens(accessToken, _refreshToken));
  },

  getAccessToken() {
    return _accessToken;
  },

  getRefreshToken() {
    return _refreshToken;
  },

  getUserId() {
    return _userId;
  },

  getUserRole() {
    return _userRole;
  },

  getLocationId() {
    return _locationId;
  },

  getLocationUid() {
    return window.location.pathname.split('/')[2]; // hardcoded used only on dashboard
  },

  getRegistrationStatus() {
    return _registrationStatus;
  },

  getTrialEndsDate() {
    return _trialEndsDate;
  },

  getTokenType() {
    return getTokenKeyOnLocation();
  },

  clear() {
    storage.removeItem(getTokenKeyOnLocation());

    _accessToken = null;
    _refreshToken = null;
    _userId = null;
    _userRole = null;
    _locationId = null;
    _registrationStatus = null;
    _trialEndsDate = null;
  },
};

_init();

export default TokenManager;
