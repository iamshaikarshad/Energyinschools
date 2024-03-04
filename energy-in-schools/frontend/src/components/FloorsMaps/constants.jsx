import {
  METER_TYPE,
  MICROBIT,
  TIME_RESOLUTION,
  RESOURCE_CHILD_TYPE,
  SMART_THINGS_SENSOR_CAPABILITY,
  SENSOR_TYPE_LABEL,
} from '../../constants/config';

import {
  getFoldersByDeviceId,
  getFoldersByDistance,
} from './utils';

export const ALL = 'ALL';

export const FLOORS_MAPS_BG_COLOR = 'rgba(0, 0, 0, 0.1)';

export const FLOORS_MAPS_BG_LIGHT_COLOR = 'rgba(0, 0, 0, 0)';

export const FLOORS_MAPS_BG_DARK_COLOR = 'rgba(0, 0, 0, 0.2)';

export const FLOORS_MAPS_TEXT_COLOR = 'rgba(255, 255, 255, 0.87)';

export const FLOORS_MAPS_HISTORY_SLIDER_BG_COLOR = 'rgba(153, 153, 153, 1)';

export const DEFAULT_BUTTON_COLOR = '#e0e0e0';

export const SELECTED_BUTTON_COLOR = 'rgb(0, 188, 212)';

export const SELECTED_BUTTON_COLOR_DISABLED = 'rgba(0, 188, 212, 0.7)';

export const DRAGGING_Z_INDEX = 20;

export const PANZOOM_IDS = {
  container: 'panzoom',
  zoomInButoon: 'zoomIn',
  zoomOutButton: 'zoomOut',
};

export const MAP_CONTAINER_WRAPPER_ID = 'map_container_wrapper';

export const SMART_THINGS_BASED_RESOURCE_CHILD_TYPES = [
  RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR,
  RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER,
];

export const RESOURCE_TYPE = Object.freeze({
  ELECTRICITY: METER_TYPE.electricity,
  GAS: METER_TYPE.gas,
  TEMPERATURE: SMART_THINGS_SENSOR_CAPABILITY.temperature,
  MOTION: SMART_THINGS_SENSOR_CAPABILITY.motion,
  BUTTON: SMART_THINGS_SENSOR_CAPABILITY.button,
  CONTACT_SENSOR: SMART_THINGS_SENSOR_CAPABILITY.contactSensor,
  MICROBIT,
  SMART_PLUG: METER_TYPE.smartPlug,
});

export const RESOURCE_TYPES = Object.values(RESOURCE_TYPE);

export const RESOURCE_TYPE_LABEL = Object.freeze({
  [RESOURCE_TYPE.ELECTRICITY]: 'ELECTRICITY',
  [RESOURCE_TYPE.GAS]: 'GAS',
  [RESOURCE_TYPE.TEMPERATURE]: 'TEMPERATURE',
  [RESOURCE_TYPE.MOTION]: 'MOTION',
  [RESOURCE_TYPE.BUTTON]: 'BUTTON',
  [RESOURCE_TYPE.CONTACT_SENSOR]: 'CONTACT SENSOR',
  [RESOURCE_TYPE.MICROBIT]: 'MICROBIT',
  [RESOURCE_TYPE.SMART_PLUG]: 'SMART PLUG',
});

export const METER_UNITS = Object.freeze({
  height: 120,
  width: 120,
  map_height: 80,
  map_width: 80,
  map_temperature_height: 60,
  map_temperature_width: 60,
  folder_height: 50,
  folder_width: 50,
});

export const METER_EXTRA_PROPS = Object.freeze({
  width: METER_UNITS.width,
  height: METER_UNITS.height,
  floor_plan: null,
  x_coordinate: null,
  y_coordinate: null,
});

export const LIVE_BY_METER_PROP = Object.freeze({
  valueData: 'valueData',
  stateData: 'stateData',
});

export const LIVE_BY_METER_PROP_VALUE_PROP_NAME = Object.freeze({
  [LIVE_BY_METER_PROP.valueData]: 'value',
  [LIVE_BY_METER_PROP.stateData]: 'state',
});

export const LIVE_DATA_UPDATE_INTERVAL = 60; // in seconds;

export const RESOURCE_CHILD_TYPE_PROP = 'child_type';

export const FLOOR_PLAN_LOCATION = 'floor_plan_location';

export const RESOURCE_PROVIDER_PROPERTY = Object.freeze({
  ENERGY: 'provider_account',
});

export const RESOURCE_TYPES_EXCLUDE_FROM_FILTER_TYPES = [RESOURCE_TYPE.SMART_PLUG];

export const FILTER_TYPES = [
  ...RESOURCE_TYPES.reduce((result, type) => {
    const label = RESOURCE_TYPE_LABEL[type];
    if (!RESOURCE_TYPES_EXCLUDE_FROM_FILTER_TYPES.includes(type) && label) {
      result.push({ type, label });
    }
    return result;
  }, []),
  { type: ALL, label: ALL },
];

export const CREATEABLE_RESOURCE_TYPES = [RESOURCE_TYPE.ELECTRICITY, RESOURCE_TYPE.GAS];
export const CREATEABLE_SENSOR_TYPES = [
  SENSOR_TYPE_LABEL.TEMPERATURE,
  SENSOR_TYPE_LABEL.ELECTRICITY,
  SENSOR_TYPE_LABEL.BRIGHTNESS,
  SENSOR_TYPE_LABEL.OPEN_CLOSED,
  SENSOR_TYPE_LABEL.ON_OFF,
  SENSOR_TYPE_LABEL.OTHER,
];

export const SCROLL_TICK = 240;

export const SCROLL_ANIMATION_DURATION = 400;

export const SCROLL_ANIMATION_TYPE = Object.freeze({
  linear: 'linear',
});

export const SCROLL_CONTAINER_OFFSET = Object.freeze({
  top: 64,
  left: 0,
});

export const PLAY_STEP_INTERVAL = 2000; // 2 sec

export const MAX_IMAGE_STRETCH_COEFF = 2;

export const IMAGE_BASE64_SVG_TYPE = 'svg+xml';

export const MAP_HISTORY_HOURS_STEP = 3; // 3 hours, default step
export const MAP_HISTORY_DAYS_COUNT = 2; // 2 days, default step to the past
export const MAP_HISTORY_TIME_RESOLUTION = TIME_RESOLUTION.hour;

export const RESOURCES_WHITE_LIST_FILTER = {
  [RESOURCE_CHILD_TYPE.ENERGY]: {
    filter_deep: true,
    type_key: 'type',
    white_list: [RESOURCE_TYPE.ELECTRICITY, RESOURCE_TYPE.GAS],
  },
  [RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER]: {
    filter_deep: true,
    type_key: 'type',
    white_list: [RESOURCE_TYPE.ELECTRICITY, RESOURCE_TYPE.GAS, RESOURCE_TYPE.SMART_PLUG, METER_TYPE.unknown],
  },
  [RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR]: {
    filter_deep: true,
    type_key: 'capability',
    white_list: [
      RESOURCE_TYPE.TEMPERATURE,
      RESOURCE_TYPE.MOTION,
      RESOURCE_TYPE.BUTTON,
      RESOURCE_TYPE.CONTACT_SENSOR,
    ],
  },
  [RESOURCE_CHILD_TYPE.MICROBIT]: {
    filter_deep: false,
    type_key: 'type',
    white_list: [],
  },
};

export const DISABLE_RESIZING = Object.freeze({
  bottom: false,
  bottomLeft: false,
  bottomRight: false,
  left: false,
  right: false,
  top: false,
  topLeft: false,
  topRight: false,
});

export const ENABLE_RESIZING = Object.freeze({
  bottom: true,
  bottomLeft: true,
  bottomRight: true,
  left: true,
  right: true,
  top: true,
  topLeft: true,
  topRight: true,
});

export const FOLDER_MAKING_RULE_NAME = Object.freeze({
  byDevice: 'byDevice',
  byDistance: 'byDistance',
});

export const PLACED_RESOURCES_FOLDER_MAKING_RULE = Object.freeze({
  [FOLDER_MAKING_RULE_NAME.byDistance]: {
    builderFunc: getFoldersByDistance,
    filterFunc: null,
    minItemsCount: 2,
  },
});

export const UNPLACED_RESOURCES_FOLDER_MAKING_RULE = Object.freeze({
  [FOLDER_MAKING_RULE_NAME.byDevice]: {
    builderFunc: getFoldersByDeviceId,
    filterFunc: item => SMART_THINGS_BASED_RESOURCE_CHILD_TYPES.includes(item[RESOURCE_CHILD_TYPE_PROP]),
    minItemsCount: 2,
  },
});

export const UNPLACED_RESOURCES_FOLDER_DISPLAY_OPTIONS = Object.freeze({
  [FOLDER_MAKING_RULE_NAME.byDevice]: {
    backgroundColor: 'rgba(0, 125, 255, 0.5)',
  },
  [FOLDER_MAKING_RULE_NAME.byDistance]: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export const RESOURCE_TYPES_TO_SHOW_STATE = [
  RESOURCE_TYPE.BUTTON,
  RESOURCE_TYPE.CONTACT_SENSOR,
];

const BUTTON_STATE = Object.freeze({
  pushed: 'pushed',
  double: 'double',
  held: 'held',
});

const MOTION_STATE = Object.freeze({
  active: 'active',
  inactive: 'inactive',
});

const SWITCH_STATE = Object.freeze({
  on: 'on',
  off: 'off',
});

const CONTACT_STATE = Object.freeze({
  open: 'open',
  closed: 'closed',
});

export const RESOURCE_STATE = Object.freeze({
  ...BUTTON_STATE,
  ...MOTION_STATE,
  ...SWITCH_STATE,
  ...CONTACT_STATE,
});

export const RESOURCE_STATE_LABEL = Object.freeze({
  [RESOURCE_STATE.pushed]: 'pushed',
  [RESOURCE_STATE.double]: 'double',
  [RESOURCE_STATE.held]: 'held',
  [RESOURCE_STATE.open]: 'open',
  [RESOURCE_STATE.closed]: 'closed',
  [RESOURCE_STATE.on]: 'on',
  [RESOURCE_STATE.off]: 'off',
  [RESOURCE_STATE.active]: 'active',
  [RESOURCE_STATE.inactive]: 'inactive',
});

const WARM_COLOR_RANGE_OPTION = {
  min: 5,
  max: 40,
  hueInfo: {
    minValue: 0, // red
    maxValue: 50, // yellow
    direction: 'up',
  },
  saturationInfo: {
    minValue: 70,
    maxValue: 80,
    direction: 'down',
  },
  lightInfo: {
    minValue: 50,
    maxValue: 60,
    direction: 'up',
  },
};

const COLD_COLOR_RANGE_OPTION = {
  min: -40,
  max: 0,
  hueInfo: {
    minValue: 190, // light blue
    maxValue: 240, // blue
    direction: 'up',
  },
  saturationInfo: {
    minValue: 80,
    maxValue: 80,
    direction: 'down',
  },
  lightInfo: {
    minValue: 50,
    maxValue: 60,
    direction: 'down',
  },
};

const NEUTRAL_COLOR_RANGE_OPTION = {
  min: 0,
  max: 5,
  hueInfo: {
    minValue: 50, // yellow
    maxValue: 50,
    direction: 'up',
  },
  saturationInfo: {
    minValue: 0, // makes color close to gray
    maxValue: 50,
    direction: 'down',
  },
  lightInfo: {
    minValue: 50,
    maxValue: 50,
    direction: 'up',
  },
};

export const TEMPERATURE_COLOR_RANGE_OPTIONS = [
  WARM_COLOR_RANGE_OPTION,
  COLD_COLOR_RANGE_OPTION,
  NEUTRAL_COLOR_RANGE_OPTION,
];

export const MOTION_COLOR_RANGE_OPTIONS = [
  {
    min: 1000,
    max: 20000,
    hueInfo: {
      minValue: 0,
      maxValue: 5,
      direction: 'up',
    },
    saturationInfo: {
      minValue: 70,
      maxValue: 80,
      direction: 'down',
    },
    lightInfo: {
      minValue: 50,
      maxValue: 60,
      direction: 'up',
    },
  },
  {
    min: 200,
    max: 1000,
    hueInfo: {
      minValue: 5,
      maxValue: 30,
      direction: 'up',
    },
    saturationInfo: {
      minValue: 70,
      maxValue: 80,
      direction: 'down',
    },
    lightInfo: {
      minValue: 50,
      maxValue: 60,
      direction: 'up',
    },
  },
  {
    min: 20,
    max: 200,
    hueInfo: {
      minValue: 30,
      maxValue: 50,
      direction: 'up',
    },
    saturationInfo: {
      minValue: 70,
      maxValue: 80,
      direction: 'down',
    },
    lightInfo: {
      minValue: 50,
      maxValue: 60,
      direction: 'up',
    },
  },
  {
    min: 0,
    max: 20,
    hueInfo: {
      minValue: 50, // yellow
      maxValue: 50,
      direction: 'up',
    },
    saturationInfo: {
      minValue: 0, // makes color close to gray
      maxValue: 50,
      direction: 'down',
    },
    lightInfo: {
      minValue: 50,
      maxValue: 50,
      direction: 'up',
    },
  },
];

export const COUNTABLE_SENSORS_CAPABILITIES = [
  SMART_THINGS_SENSOR_CAPABILITY.button,
  SMART_THINGS_SENSOR_CAPABILITY.contactSensor,
  SMART_THINGS_SENSOR_CAPABILITY.motion,
];

export const FLOOR_MAPS_URL_QUERY_PARAM = Object.freeze({
  locationId: 'locationId',
  floorId: 'floorId',
  resourceId: 'resourceId',
});

export const HISTORY_STEPS_COUNT = 7;
