export const DOMAIN = 'http://127.0.0.1:8000';
export const BASE_URL = `${DOMAIN}/api/v1`;
export const BLOB_STORAGE_URL = 'https://energyinschools.blob.core.windows.net';
export const BLOCK_EDITOR_URL = 'https://makecode.microbit.org';

export const REFRESH_TOKEN_URL = `${DOMAIN}/api/v1/token/refresh/`;

export const NODE_ENV = process.env.NODE_ENV;
export const GOOGLE_ANALYTICS_TRACKER_ID = process.env.GATID;

export const TELEPORT_CITY_SEARCH_API_URL = 'https://api.teleport.org/api/cities/';

// todo use object
// user roles
export const ADMIN_ROLE = 'admin'; // todo: use nested namespace (like enum)
export const SLE_ADMIN_ROLE = 'sle_admin';
export const SEM_ADMIN_ROLE = 'sem_admin';
export const TEACHER_ROLE = 'teacher';
export const PUPIL_ROLE = 'pupil';
export const ES_ADMIN_ROLE = 'es_admin';
export const ES_USER = 'es_user';

// todo use METER_TYPE
// meters types
export const ELECTRICITY = 'ELECTRICITY';
export const GAS = 'GAS';
export const SOLAR = 'SOLAR';
export const UNKNOWN = 'UNKNOWN';
export const SMART_PLUG = 'SMART_PLUG';

export const TEMPERATURE = 'TEMPERATUREMEASUREMENT'; // TODO FIX IT;
export const MICROBIT = 'MICROBIT';
export const MOTION = 'MOTION';

export const TUTORIAL_LINKS = {
  electricityMonitoring: `${BLOB_STORAGE_URL}/energy-in-schools-media/lesson-plans-new/Electricity monitoring.docx`,
  lightCalibration: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Light Calibration Worksheet.docx',
  lightSensorTutorial: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Light Sensor Tutorial (no Neopixel required).docx',
  lightSensorStreetlightTutorial: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Light sensor streetlight using Neopixel.docx',
  magneticForceCalibration: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Magnetic Force Calibration Worksheet.docx',
  doorMagnetSensorTutorial: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Door Magnet Sensor.docx',
  temperatureCalibration: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Temperature Calibration Worksheet.docx',
  temperatureSensorTutorial: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Temperature Sensor.docx',
  temperatureLoggingTutorial: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Datalogging tutorial.docx',
  fossilFuelTutorial: `${BLOB_STORAGE_URL}/energy-in-schools-media/`
    + 'lesson-plans-new/Fossil fuel neopixel light changer.docx',
};

export const METER_TYPE = Object.freeze({
  electricity: ELECTRICITY,
  gas: GAS,
  solar: SOLAR,
  smartPlug: SMART_PLUG,
  unknown: UNKNOWN,
});

export const METER_TYPE_LABEL = Object.freeze({
  [METER_TYPE.electricity]: 'Electricity',
  [METER_TYPE.gas]: 'Gas',
  [METER_TYPE.solar]: 'Solar',
  [METER_TYPE.smartPlug]: 'Smart plug',
  [METER_TYPE.unknown]: 'Unknown',
});

// todo use object
// providers
export const OVO = 'OVO';
export const GEO = 'GEO';
export const N3RGY = 'N3RGY';
export const CHAMELEON = 'CHAMELEON';
export const ENERGY_ASSETS = 'ENERGY_ASSETS';
export const DUMMY = 'Dummy';
export const SMART_THINGS = 'SmartThings';
export const MICROBIT_PROVIDER = 'Raspberry PI';
export const HILDEBRAND = 'HILDEBRAND';

export const PROVIDER_TYPE_LABELS = {
  [OVO]: 'OVO Energy',
  [GEO]: 'Geo Energy',
  [DUMMY]: 'Dummy Energy',
  [N3RGY]: 'N3RGY',
  [CHAMELEON]: 'CHAMELEON',
  [ENERGY_ASSETS]: 'Energy Assets',
  [HILDEBRAND]: 'HILDEBRAND',
};

export const SUPPORTED_PROVIDERS = [OVO, GEO, N3RGY, CHAMELEON, ENERGY_ASSETS, HILDEBRAND];

export const HUMAN_READABLE_METER_TYPES = [
  {
    key: ELECTRICITY,
    value: 'Electricity',
  },
  {
    key: GAS,
    value: 'Gas',
  },
  {
    key: SOLAR,
    value: 'Solar',
  },
];

export const RESOURCE_CHILD_TYPE = Object.freeze({
  ENERGY: 'energy_meter',
  MICROBIT: 'microbit_historical_data_set',
  SMART_THINGS_SENSOR: 'smart_things_sensor',
  SMART_THINGS_ENERGY_METER: 'smart_things_energy_meter',
});

// smartThings sensors
export const SMART_THINGS_SENSOR_CAPABILITY = Object.freeze({
  button: 'button',
  contactSensor: 'contactSensor',
  temperature: 'temperatureMeasurement',
  motion: 'motionSensor',
  healthCheck: 'healthCheck',
  switchLevel: 'switchLevel',
  colorTemperature: 'colorTemperature',
  colorControl: 'colorControl',
  threeAxis: 'threeAxis',
  accelerationSensor: 'accelerationSensor',
  holdableButton: 'holdableButton',
  powerMeter: 'powerMeter',
  energyMeter: 'energyMeter',
  light: 'light',
});

export const SMART_THINGS_SENSOR_CAPABILITY_LABEL = Object.freeze({
  [SMART_THINGS_SENSOR_CAPABILITY.button]: 'button',
  [SMART_THINGS_SENSOR_CAPABILITY.contactSensor]: 'contact sensor',
  [SMART_THINGS_SENSOR_CAPABILITY.temperature]: 'temperature',
  [SMART_THINGS_SENSOR_CAPABILITY.motion]: 'motion sensor',
  [SMART_THINGS_SENSOR_CAPABILITY.healthCheck]: 'health check',
  [SMART_THINGS_SENSOR_CAPABILITY.switchLevel]: 'switch level',
  [SMART_THINGS_SENSOR_CAPABILITY.colorTemperature]: 'color temperature',
  [SMART_THINGS_SENSOR_CAPABILITY.colorControl]: 'color control',
  [SMART_THINGS_SENSOR_CAPABILITY.threeAxis]: 'three axis',
  [SMART_THINGS_SENSOR_CAPABILITY.accelerationSensor]: 'acceleration sensor',
  [SMART_THINGS_SENSOR_CAPABILITY.holdableButton]: 'holdable button',
  [SMART_THINGS_SENSOR_CAPABILITY.powerMeter]: 'power meter',
  [SMART_THINGS_SENSOR_CAPABILITY.energyMeter]: 'energy meter',
});

export const SENSOR_TYPE_LABEL = Object.freeze({
  TEMPERATURE: 'temperature',
  ELECTRICITY: 'electricity',
  BRIGHTNESS: 'brightness',
  OPEN_CLOSED: 'open/closed',
  ON_OFF: 'on/off',
  OTHER: 'other',
});

export const SMART_THINGS_DEVICE_CONNECTION_STATUS = Object.freeze({
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  UNKNOWN: 'UNKNOWN',
});

// facts dashboard
export const MAX_FACTS_ON_DASHBOARD = 3;

// energy
export const TIME_RESOLUTION = Object.freeze({ // should it be moved to constants directory?
  year: 'year',
  month: 'month',
  week: 'week',
  day: 'day',
  hour: 'hour',
  halfHour: 'half_hour',
  minute: 'minute',
  twentySeconds: 'twenty_seconds',
  second: 'second',
});

export const UNIT = Object.freeze({
  watt: 'watt',
  wattHour: 'watt_hour',
  poundSterling: 'pound_sterling',
  kilowatt: 'kilowatt',
  kilowattHour: 'kilowatt_hour',
  celsius: 'celsius',
  unknown: 'unknown',
  metersPerHour: 'metersPerHour',
  percentage: 'percentage',
});

export const MICROBIT_UNIT = Object.freeze({
  watt: UNIT.watt,
  celsius: UNIT.celsius,
});

export const ENERGY_TYPE = Object.freeze({
  electricity: 'ELECTRICITY',
  gas: 'GAS',
  solar: 'SOLAR',
  unknown: 'UNKNOWN',
});

export const SMART_THINGS_ENERGY_METER_TYPES = [
  METER_TYPE.electricity,
  METER_TYPE.gas,
  METER_TYPE.smartPlug,
  METER_TYPE.unknown,
];

// subdomain
export const QUOTES_SUBDOMAIN_LINK = 'https://quotes.energyinschools.co.uk';
export const SHOW_QUOTES_TAB = false;

// temperature-statistic
export const TEMPERATURE_STATISTIC = {
  name: 'temperature_statistic',
  type: 'temperature',
  unit: 'celsius',
};

// usage statistic configs

export const UNIT_TO_LABEL_MAP = {
  [UNIT.watt]: 'W',
  [UNIT.wattHour]: 'Wh',
  [UNIT.kilowatt]: 'kW',
  [UNIT.kilowattHour]: 'kWh',
  [UNIT.poundSterling]: '£',
  [UNIT.celsius]: '℃',
  [UNIT.metersPerHour]: 'mi/h',
  [UNIT.percentage]: '%',
};

export const USAGE_STATISTIC_CHART_NAME = Object.freeze({
  energy: 'energy',
  temperature: 'temperature',
  microbit: 'microbit',
});

export const USAGE_STATISTIC_CONFIGS = {
  [USAGE_STATISTIC_CHART_NAME.energy]: {
    name: USAGE_STATISTIC_CHART_NAME.energy,

    maximalTimeResolution: TIME_RESOLUTION.minute,

    getLiveByLocation: true,
    getHistoricalTotalByLocation: true,
    getHistoricalByLocation: true,

    showAdminHeader: true,
    showUsageTabs: true,
    showTypeTabs: true,
    showCostTimePanel: true,
    showAdvicePanel: true,
    showCostTab: true,
    showComparison: true,
    showAlwaysOn: true,
    showTotalUsage: true,
    showInstantData: false,
    highlight: true,
    connectNulls: false,
    showCustomPeriod: true,
    dataExportAvailable: true, // allows export data to file

    historyLabel: 'USAGE',
    totalLabel: 'TOTAL USAGE',
    summaryLabel: 'TOTAL CONSUMPTION',

    stateKey: 'energyUsage',
    metersStateKey: 'energyResources',

    placesAfterDot: 2,
  },
  [USAGE_STATISTIC_CHART_NAME.temperature]: {
    name: USAGE_STATISTIC_CHART_NAME.temperature,

    maximalTimeResolution: TIME_RESOLUTION.halfHour,

    getLiveByLocation: true,
    getHistoricalTotalByLocation: true,
    getHistoricalByLocation: true,

    showAdminHeader: true,
    showUsageTabs: true,
    showTypeTabs: false,
    showCostTimePanel: false,
    showAdvicePanel: false,
    showCostTab: false,
    showComparison: false,
    showAlwaysOn: false,
    showTotalUsage: true,
    showInstantData: false,
    highlight: false,
    connectNulls: false,
    showCustomPeriod: true,
    dataExportAvailable: false,

    historyLabel: 'HISTORY',
    totalLabel: 'AVERAGE',
    summaryLabel: 'AVERAGE TEMPERATURE',

    stateKey: 'temperatureStatistic',
    metersStateKey: 'smartThingsSensors',

    placesAfterDot: 1,
  },
  [USAGE_STATISTIC_CHART_NAME.microbit]: {
    name: USAGE_STATISTIC_CHART_NAME.microbit,

    maximalTimeResolution: TIME_RESOLUTION.second,

    getLiveByLocation: false,
    getHistoricalTotalByLocation: false,
    getHistoricalByLocation: false,

    showAdminHeader: false,
    showUsageTabs: false,
    showTypeTabs: false,
    showCostTimePanel: false,
    showAdvicePanel: false,
    showCostTab: false,
    showComparison: false,
    showAlwaysOn: false,
    showTotalUsage: false,
    showInstantData: true,
    highlight: false,
    connectNulls: true,
    showCustomPeriod: true,
    dataExportAvailable: false,

    historyLabel: 'HISTORY',
    totalLabel: 'INSTANT DATA',
    summaryLabel: '',

    stateKey: 'microbitStatistic',
    metersStateKey: 'historicalData',
    instantDataStateKey: 'liveByMeter',

    placesAfterDot: 2,
  },
};

export const USAGE_CARD_TYPES = {
  ELECTRICITY,
  GAS,
  SOLAR,
  SUMMARY: 'SUMMARY',
  TEMPERATURE: TEMPERATURE_STATISTIC.type,
  SMART_PLUG,
  UNKNOWN: 'UNKNOWN',
};

// time constants
export const HOUR = 3600; // sec

export const DAY = 24 * HOUR;

export const START_OF_DAY_HOUR = 0;

// Token Types

export const TOKEN_TYPE = Object.freeze({
  API_AUTH: 'apiAuth',
  DASHBOARD_AUTH: 'dashboardAuth',
});

export const GOOGLE_MAPS_API_LINK = 'https://www.google.com/maps/search/?api=1&query=';

export const FILE_TYPE = Object.freeze({
  pdf: {
    type: 'application/pdf',
    label: 'pdf',
  },
  png: {
    type: 'image/png',
    label: 'png',
  },
  jpg: {
    type: 'image/jpeg',
    label: 'jpg/jpeg',
  },
  svg: {
    type: 'image/svg+xml',
    label: 'svg',
  },
  csv: {
    type: 'file/csv',
    label: 'csv',
  },
});

export const NAME_MAX_LENGTH = 50;

export const DESCRIPTION_MAX_LENGTH = 200;

export const APP_TOP_BAR_ID = 'APP_TOP_BAR_ID';

export const APP_FOOTER_ID = 'APP_FOOTER_ID';

// Abnormal value notifications

export const ABNORMAL_VALUE_NOTIFICATION_REFRESH_DATA_LIST_INTERVAL = 5 * 60 * 1000;
