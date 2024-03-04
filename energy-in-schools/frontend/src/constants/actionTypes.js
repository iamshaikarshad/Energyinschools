import { FAIL_OR_SUCCESS, SUCCESS, makeActionsGroup } from '../utils/actionGroup';
import { PREVIEW_MESSAGES_SCREEN_NAME, PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP } from '../components/EnergyScreenDashboard/constants';
import { ENERGY_MANAGER_DASHBOARD_ITEM_NAME } from '../containers/SEMAdminPages/EnergyManagerDashboard/constants';

// dialog actions
export const TOOGLE_REGISTRATION_SCHOOL_DIALOG = 'TOOGLE_REGISTRATION_SCHOOL_DIALOG';
export const TOOGLE_MICROBIT_DIALOG = 'TOOGLE_MICROBIT_DIALOG';
export const TOOGLE_EDITOR_HELP_DIALOG = 'TOOGLE_EDITOR_HELP_DIALOG';
export const SHOW_ALERT_DIALOG = 'SHOW_ALERT_DIALOG';
export const HIDE_ALERT_DIALOG = 'HIDE_ALERT_DIALOG';
export const SHOW_MESSAGE_SNACKBAR = 'SHOW_MESSAGE_SNACKBAR';
export const HIDE_MESSAGE_SNACKBAR = 'HIDE_MESSAGE_SNACKBAR';
export const TOGGLE_QUESTIONNAIRE_DIALOG = 'TOGGLE_QUESTIONNAIRE_DIALOG';
export const SHOW_TRIAL_EXPIRY_ALERT_DIALOG = 'SHOW_TRIAL_EXPIRY_ALERT_DIALOG';
export const HIDE_TRIAL_EXPIRY_ALERT_DIALOG = 'HIDE_TRIAL_EXPIRY_ALERT_DIALOG';

// auth actions
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';

// user data actions
export const USER_DATA_SUCCESS = 'USER_DATA_SUCCESS';
export const SCHOOL_USERS_DATA_SUCCESS = 'SCHOOL_USERS_DATA_SUCCESS';
export const USER_DATA_CLEAN = 'USER_DATA_CLEAN';

// schools data actions
export const SCHOOL_REQUESTS_DATA_SUCCESS = 'SCHOOL_REQUESTS_DATA_SUCCESS';
export const APPROVED_SCHOOLS_DATA_SUCCESS = 'APPROVED_SCHOOLS_DATA_SUCCESS';
export const SCHOOL_DATA_SUCCESS = 'SCHOOL_DATA_SUCCESS';
export const OPEN_SCHOOLS_DATA_SUCCESS = 'OPEN_SCHOOLS_DATA_SUCCESS';
export const ALL_SCHOOLS_DATA_SUCCESS = 'ALL_SCHOOLS_DATA_SUCCESS';
export const FETCH_SCHOOL_ENERGY_MOOD_SUCCESS = 'FETCH_SCHOOL_ENERGY_MOOD_SUCCESS';
export const SCHOOLS_CASHBACK_DATA_SUCCESS = 'SCHOOLS_CASHBACK_DATA_SUCCESS';
export const SCHOOLS_ALWAYS_ON_DATA_SUCCESS = 'SCHOOLS_ALWAYS_ON_DATA_SUCCESS';

// API calls actions
export const API_CALL_STARTED = 'API_CALL_STARTED';
export const API_CALL_FINISHED = 'API_CALL_FINISHED';

// Hubs actions
export const HUBS_LIST_DATA_SUCCESS = 'HUBS_LIST_DATA_SUCCESS';

// Meters actions
export const METERS_LIST_DATA_SUCCESS = 'METERS_LIST_DATA_SUCCESS';

// Energy resources actions
export const ENERGY_RESOURCES_LIST_DATA_SUCCESS = 'ENERGY_RESOURCES_LIST_DATA_SUCCESS';

// Providers actions
export const PROVIDERS_LIST_DATA_SUCCESS = 'PROVIDERS_LIST_DATA_SUCCESS';

// Devices actions
export const DEVICES_LIST_DATA_SUCCESS = 'DEVICES_LIST_DATA_SUCCESS';

// Weather actions
export const CURRENT_WEATHER_DATA_SUCCESS = 'CURRENT_WEATHER_DATA_SUCCESS';
export const FORECAST_WEATHER_DATA_SUCCESS = 'FORECAST_WEATHER_DATA_SUCCESS';
export const WEATHER_HISTORY_DATA_SUCCESS = 'WEATHER_HISTORY_DATA_SUCCESS';

// News actions
export const NEWS_DATA_SUCCESS = 'NEWS_DATA_SUCCESS';

// usage statistic actions
export const ENERGY_DATA = makeActionsGroup('energyData', {
  historyByMeter: FAIL_OR_SUCCESS,
  historyByLocation: FAIL_OR_SUCCESS,
  totalByMeter: FAIL_OR_SUCCESS,
  totalByLocation: FAIL_OR_SUCCESS,
  liveByMeter: FAIL_OR_SUCCESS,
  liveByLocation: FAIL_OR_SUCCESS,
  alwaysOn: FAIL_OR_SUCCESS,
  yesterdayGasConsumptionByLocation: FAIL_OR_SUCCESS,
});

export const TEMPERATURE_STATISTIC_DATA = makeActionsGroup('temperatureStatisticData', {
  historyByMeter: FAIL_OR_SUCCESS,
  historyByLocation: FAIL_OR_SUCCESS,
  totalByMeter: FAIL_OR_SUCCESS,
  totalByLocation: FAIL_OR_SUCCESS,
  liveByMeter: FAIL_OR_SUCCESS,
  liveByLocation: FAIL_OR_SUCCESS,
});

export const MICROBIT_STATISTIC_DATA = makeActionsGroup('microbitStatisticData', {
  historyByMeter: FAIL_OR_SUCCESS,
  historyByLocation: FAIL_OR_SUCCESS,
  totalByMeter: FAIL_OR_SUCCESS,
  totalByLocation: FAIL_OR_SUCCESS,
  liveByMeter: FAIL_OR_SUCCESS,
  liveByLocation: FAIL_OR_SUCCESS,
});

// Variables actions
export const VARIABLES_LIST_DATA_SUCCESS = 'VARIABLES_LIST_DATA_SUCCESS';
export const HISTORICAL_DATA_SUCCESS = 'HISTORICAL_DATA_SUCCESS';

// Manuals actions
export const MANUALS_LIST_DATA_SUCCESS = 'MANUALS_LIST_DATA_SUCCESS';
export const MANUAL_DATA_SUCCESS = 'MANUAL_DATA_SUCCESS';
export const CATEGORIES_LIST_DATA_SUCCESS = 'CATEGORIES_LIST_DATA_SUCCESS';

// Energy alerts action types
export const ALERTS_LIST_SUCCESS = 'ALERTS_LIST_SUCCESS';
export const ALERT_LOGS_LIST_SUCCESS = 'ALERT_LOGS_LIST_SUCCESS';
export const ALERT_EDIT = Object.freeze({
  start: 'ALERT_EDIT_STARTED',
  cancel: 'ALERT_EDIT_CANCEL',
  editEnergyType: 'ALERT_EDIT_ENERGY_TYPE',
  editLocationMeter: 'ALERT_EDIT_LOCATION_METER',
  editEnergyLimitCondition: 'ALERT_EDIT_ENERGY_LIMIT_CONDITION',
  editEnergyLimit: 'ALERT_EDIT_ENERGY_LIMIT',
  editDuration: 'ALERT_EDIT_DURATION',
  editPeriod: 'ALERT_EDIT_PERIOD',
  editType: 'ALERT_EDIT_TYPE',
  editPercentage: 'ALERT_EDIT_PERCENTAGE',
});

// map Floors meters
export const MAP_METERS_LIST_DATA_SUCCESS = 'MAP_METERS_LIST_DATA_SUCCESS';
export const MAP_METERS_UPDATED = 'MAP_METERS_UPDATED';
export const MAP_METER_LIVE_VALUE_UPDATED = 'MAP_METER_LIVE_VALUE_UPDATED';
export const MAP_METER_STATE_UPDATED = 'MAP_METER_STATE_UPDATED'; // here state = state for some sensors: button(pushed, held), contact(open, closed) etc

// feedbacks
export const FEEDBACKS_LIST_DATA_SUCCESS = 'FEEDBACKS_LIST_DATA_SUCCESS';

export const ENERGY_TARIFF_DATA = makeActionsGroup('energyTariffData', {
  create: FAIL_OR_SUCCESS,
  change: FAIL_OR_SUCCESS,
  delete: FAIL_OR_SUCCESS,
  retrieve: FAIL_OR_SUCCESS,
  currentTariffs: FAIL_OR_SUCCESS,
});

export const METERS_LIST_SCHOOL_DASHBOARD_SUCCESS = 'METERS_LIST_SCHOOL_DASHBOARD_SUCCESS';
export const METERS_LIST_SCHOOL_DASHBOARD_FAILED = 'METERS_LIST_SCHOOL_DASHBOARD_FAILED';

// lessons categories
export const LESSONS_CATEGORIES_LIST_DATA_SUCCESS = 'LESSONS_CATEGORIES_LIST_DATA_SUCCESS';

// lessons groups
export const LESSONS_GROUPS_LIST_DATA_SUCCESS = 'LESSONS_GROUPS_LIST_DATA_SUCCESS';

// lessons
export const LESSONS_LIST_DATA_SUCCESS = 'LESSONS_LIST_DATA_SUCCESS';

// SmartThings sensors actions
export const SMARTTHINGS_SENSORS_LIST_DATA_SUCCESS = 'SMARTTHINGS_SENSORS_LIST_DATA_SUCCESS';
export const SMARTTHINGS_SENSOR_LOADING_LIVE_VALUE = 'SMARTTHINGS_SENSOR_LOADING_LIVE_VALUE';
export const SMARTTHINGS_SENSOR_LIVE_VALUE_SUCCESS = 'SMARTTHINGS_SENSOR_LIVE_VALUE_SUCCESS';
export const SMARTTHINGS_SENSOR_LIVE_VALUE_FAIL = 'SMARTTHINGS_SENSOR_LIVE_VALUE_FAIL';

export const ENERGY_DASHBOARD_DATA = makeActionsGroup('energyDashboardData', {
  facts: FAIL_OR_SUCCESS,
  carbonIntensity: FAIL_OR_SUCCESS,
  cashBack: FAIL_OR_SUCCESS,
  cartoonCharacter: FAIL_OR_SUCCESS,
  currentWeather: FAIL_OR_SUCCESS,
  forecastWeather: FAIL_OR_SUCCESS,
  news: FAIL_OR_SUCCESS,
  liveConsumptionByElectricityType: FAIL_OR_SUCCESS,
  liveConsumptionByGasType: FAIL_OR_SUCCESS,
  yesterdayConsumptionByGasType: FAIL_OR_SUCCESS,
  todayConsumptionByElectricityType: FAIL_OR_SUCCESS,
  yesterdayConsumptionByElectricityType: FAIL_OR_SUCCESS,
  electricityLeague: FAIL_OR_SUCCESS,
  gasLeague: FAIL_OR_SUCCESS,
  electricityTodayCost: FAIL_OR_SUCCESS,
  electricityYesterdayCost: FAIL_OR_SUCCESS,
  gasYesterdayCost: FAIL_OR_SUCCESS,
  electricityTariffs: FAIL_OR_SUCCESS,
  gasTariffs: FAIL_OR_SUCCESS,
  offPeakyLeague: FAIL_OR_SUCCESS,
  offPeakyYesterdayValue: FAIL_OR_SUCCESS,
  schoolInformation: FAIL_OR_SUCCESS,
  loadingEnds: FAIL_OR_SUCCESS,
  energyTips: FAIL_OR_SUCCESS,
  lastWeekHistoricalCost: FAIL_OR_SUCCESS,
  currentWeekHistoricalCost: FAIL_OR_SUCCESS,
});

export const ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION = makeActionsGroup(
  'energyDashboardPreviewMessagesAction',
  Object.values(PREVIEW_MESSAGES_SCREEN_NAME).reduce((res, name) => {
    res[PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP[name]] = SUCCESS;
    return res;
  }, {}),
);


export const ENERGY_METERS_BILLING_INFO_DATA_SUCCESS = 'ENERGY_METERS_BILLING_INFO_DATA_SUCCESS';

// MUG actions
export const TARIFFS_COMPARISON_QUOTES_DATA_SUCCESS = 'TARIFFS_COMPARISON_QUOTES_DATA_SUCCESS';
export const TARIFFS_COMPARISON_QUOTES_DATA_FAIL = 'TARIFFS_COMPARISON_QUOTES_DATA_FAIL';
export const TARIFFS_COMPARISON_PERIODS_CONSUMPTION_DATA_SUCCESS = 'TARIFFS_COMPARISON_PERIODS_CONSUMPTION_DATA_SUCCESS';
export const SUPPLIERS_DATA_SUCCESS = 'SUPPLIERS_DATA_SUCCESS';
export const ALL_SWITCHES_DATA_SUCCESS = 'ALL_SWITCHES_DATA_SUCCESS';

// Energy Manager Dashboard actions
export const ENERGY_MANAGER_DASHBOARD_DATA = {
  ...makeActionsGroup(
    'energyManagerDashboardData',
    {
      energyTotalConsumption: FAIL_OR_SUCCESS,
      energyTotalCost: FAIL_OR_SUCCESS,
      temperatureAverage: FAIL_OR_SUCCESS,
      temperatureMinMaxLive: FAIL_OR_SUCCESS,
      energyAlwaysOn: FAIL_OR_SUCCESS,
      currentEnergyTariffs: FAIL_OR_SUCCESS,
    },
  ),
  loading: makeActionsGroup(
    'energyManagerDashboardDataLoading',
    Object.values(ENERGY_MANAGER_DASHBOARD_ITEM_NAME).reduce((res, name) => {
      res[name] = FAIL_OR_SUCCESS;
      return res;
    }, {}),
  ),
};

// Schools monitoring actions

export const SCHOOLS_MONITORING_LIST_DATA_SUCCESS = 'SCHOOLS_MONITORING_LIST_DATA_SUCCESS';

export const SCHOOLS_MONITORING_UPDATE_SCHOOL_DATA_IN_LIST = 'SCHOOLS_MONITORING_UPDATE_SCHOOL_DATA_IN_LIST';

export const SCHOOLS_MONITORING_UPDATE_SCHOOL_SMART_APP_STATUS = 'SCHOOLS_MONITORING_UPDATE_SCHOOL_SMART_APP_STATUS';

export const SCHOOLS_MONITORING_SCHOOL_OFF_PEAKY_POINTS_HISTORICAL_DATA_SUCCESS = 'SCHOOLS_MONITORING_SCHOOL_OFF_PEAKY_POINTS_HISTORICAL_DATA_SUCCESS';

export const SCHOOLS_MONITORING_SCHOOL_SMARTTHINGS_DEVICES_DATA_SUCCESS = 'SCHOOLS_MONITORING_SCHOOL_SMARTTHINGS_DEVICES_DATA_SUCCESS';

// Abnormal value notification actions

export const ABNORMAL_VALUE_NOTIFICATION_LIST_DATA_SUCCESS = 'ABNORMAL_VALUE_NOTIFICATION_LIST_DATA_SUCCESS';

export const ABNORMAL_VALUE_NOTIFICATION_TOTAL_SUCCESS = 'ABNORMAL_VALUE_NOTIFICATION_TOTAL_SUCCESS';

export const ABNORMAL_VALUE_NOTIFICATION_RESOLVE_SUCCESS = 'ABNORMAL_VALUE_NOTIFICATION_RESOLVE_SUCCESS';


// Schools status daily report subscription

export const SUCCESSFULLY_SUBSCRIBED_FOR_SCHOOLS_STATUS_DAILY_REPORT = 'SUCCESSFULLY_SUBSCRIBED_FOR_SCHOOLS_STATUS_DAILY_REPORT';

export const SUCCESSFULLY_UNSUBSCRIBED_FOR_SCHOOLS_STATUS_DAILY_REPORT = 'SUCCESSFULLY_UNSUBSCRIBED_FOR_SCHOOLS_STATUS_DAILY_REPORT';
