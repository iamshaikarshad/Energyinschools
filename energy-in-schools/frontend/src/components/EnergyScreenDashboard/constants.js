import { isPlainObject, isArray, isNil } from 'lodash';

import leaguePenguinBottomImg from '../../images/Dashboard_V2_Arts/rico_bottom.svg';
import leaguePenguinMiddleImg from '../../images/Dashboard_V2_Arts/rico_middle.svg';
import leaguePenguinTopImg from '../../images/Dashboard_V2_Arts/rico_top.svg';

import { UNIT_TO_LABEL_MAP, UNIT } from '../../constants/config';

import { ROUTE_PATH } from '../../constants/routing';

import roundToNPlaces from '../../utils/roundToNPlaces';

export const DASHBOARD_MAIN_SLIDER_REFRESH_INTERVAL = 25000;

const LEAGUE_TABLE_POINTS_UNIT = Object.freeze({
  watt_per_pupil: 'watt_per_pupil',
  watt_hour_per_pupil: 'watt_hour_per_pupil',
  point: 'point',
  point_per_pupil: 'point_per_pupil',
});

export const LEAGUE_TABLE_POINTS_UNIT_LABEL = Object.freeze({
  [LEAGUE_TABLE_POINTS_UNIT.watt_per_pupil]: 'W per pupil',
  [LEAGUE_TABLE_POINTS_UNIT.watt_hour_per_pupil]: 'Wh per pupil',
  [LEAGUE_TABLE_POINTS_UNIT.point]: 'points',
  [LEAGUE_TABLE_POINTS_UNIT.point_per_pupil]: 'per pupil',
});

export const PREVIEW_MESSAGES_SCREEN_NAME = Object.freeze({
  carbonIntensity: 'carbonIntensity',
  electricityUsage: 'electricityUsage',
  gasUsage: 'gasUsage',
  offPeakyPoints: 'offPeakyPoints',
});

export const MIDDAY_OF = Object.freeze({
  Monday: 23,
  Tuesday: 71,
  Wednesday: 119,
  Thursday: 167,
  Friday: 215,
});

export const PREVIEW_MESSAGES_SCREEN_NAME_RESPONSE_NAME_MAP = Object.freeze({
  [PREVIEW_MESSAGES_SCREEN_NAME.carbonIntensity]: 'Carbon',
  [PREVIEW_MESSAGES_SCREEN_NAME.electricityUsage]: 'Electricity usage',
  [PREVIEW_MESSAGES_SCREEN_NAME.gasUsage]: 'Gas usage',
  [PREVIEW_MESSAGES_SCREEN_NAME.offPeakyPoints]: 'Off-peak points',
});

export const PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP = Object.freeze({
  [PREVIEW_MESSAGES_SCREEN_NAME.carbonIntensity]: 'carbonIntensity',
  [PREVIEW_MESSAGES_SCREEN_NAME.electricityUsage]: 'electricityUsage',
  [PREVIEW_MESSAGES_SCREEN_NAME.gasUsage]: 'gasUsage',
  [PREVIEW_MESSAGES_SCREEN_NAME.offPeakyPoints]: 'offPeakyPoints',
});

export const LEAGUE_MEMBER_POSITION = Object.freeze({
  top: 'top',
  middleTop: 'middleTop',
  middle: 'middle',
  middleBottom: 'middleBottom',
  bottom: 'bottom',
});

export const LEAGUE_MEMBER_POSITION_CLASSNAME = Object.freeze({
  topMember: 'topMember',
  middleTopMember: 'middleTopMember',
  middleMember: 'middleMember',
  middleBottomMember: 'middleBottomMember',
  bottomMember: 'bottomMember',
});

export const LEAGUE_MEMBER_POSITION_CONFIG = Object.freeze({
  [LEAGUE_MEMBER_POSITION.top]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.topMember,
    avatar: leaguePenguinTopImg,
  },
  [LEAGUE_MEMBER_POSITION.middleTop]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.middleTopMember,
    avatar: leaguePenguinMiddleImg,
  },
  [LEAGUE_MEMBER_POSITION.middle]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.middleMember,
    avatar: leaguePenguinMiddleImg,
  },
  [LEAGUE_MEMBER_POSITION.middleBottom]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.middleBottomMember,
    avatar: leaguePenguinMiddleImg,
  },
  [LEAGUE_MEMBER_POSITION.bottom]: {
    className: LEAGUE_MEMBER_POSITION_CLASSNAME.bottomMember,
    avatar: leaguePenguinBottomImg,
  },
});

export const LEAGUE_MEMBER_POSITION_STYLE = Object.freeze({
  [LEAGUE_MEMBER_POSITION_CLASSNAME.topMember]: {
    left: '78%',
    bottom: '64.5%',
  },
  [LEAGUE_MEMBER_POSITION_CLASSNAME.middleTopMember]: {
    left: '59%',
    bottom: '56%',
  },
  [LEAGUE_MEMBER_POSITION_CLASSNAME.middleMember]: {
    left: '38.5%',
    bottom: '47%',
  },
  [LEAGUE_MEMBER_POSITION_CLASSNAME.middleBottomMember]: {
    left: '23%',
    bottom: '40%',
  },
  [LEAGUE_MEMBER_POSITION_CLASSNAME.bottomMember]: {
    left: '0%',
    bottom: '30%',
  },
});

export const DASHBOARD_STORE_KEY = Object.freeze({
  carbonIntensity: 'carbonIntensity',
  cartoonCharacter: 'cartoonCharacter',
  electricityLiveConsumption: 'electricityLiveConsumption',
  gasLiveConsumption: 'gasLiveConsumption',
  electricityTodayConsumption: 'electricityTodayConsumption',
  electricityYesterdayConsumption: 'electricityYesterdayConsumption',
  gasYesterdayConsumption: 'gasYesterdayConsumption',
  energyConsumption: 'energyConsumption',
  cashBack: 'cashBack',
  energyFacts: 'energyFacts',
  energyTips: 'energyTips',
  weather: 'weather',
  offPeakyLeague: 'offPeakyLeague',
  electricityLeague: 'electricityLeague',
  gasLeague: 'gasLeague',
  electricityTodayCost: 'electricityTodayCost',
  electricityYesterdayCost: 'electricityYesterdayCost',
  gasYesterdayCost: 'gasYesterdayCost',
  electricityTariffs: 'electricityTariffs',
  gasTariffs: 'gasTariffs',
  news: 'news',
  schoolInformation: 'schoolInformation',
  lastWeekHistoricalCost: 'lastWeekHistoricalCost',
  currentWeekHistoricalCost: 'currentWeekHistoricalCost',
});

export const ENERGY_DASHBOARD_VERSION = Object.freeze({
  energyDashboardV0: 'energy_dashboard_v0',
  energyDashboardV1: 'energy_dashboard_v1',
  energyDashboardLegacyV1: 'energy_dashboard_legacy_v1',
  energyDashboardV2: 'energy_dashboard_v2',
  energyDashboardLegacyV2: 'energy_dashboard_legacy_v2',
  energyDashboardV3: 'energy_dashboard_v3',
  energyDashboardLegacyV3: 'energy_dashboard_legacy_v3',
});

export const ENERGY_DASHBOARD_VERSIONS = [
  ENERGY_DASHBOARD_VERSION.energyDashboardV3,
  ENERGY_DASHBOARD_VERSION.energyDashboardLegacyV3,
];

export const ENERGY_DASHBOARD_VERSION_CONFIG = Object.freeze({
  [ENERGY_DASHBOARD_VERSION.energyDashboardV3]: {
    path: ROUTE_PATH.energyDashboardV3,
    label: 'Energy dashboard v3 modern',
    subLabel: 'Modern version',
  },
  [ENERGY_DASHBOARD_VERSION.energyDashboardLegacyV3]: {
    path: ROUTE_PATH.energyDashboardLegacyV3,
    label: 'Energy dashboard v3 legacy',
    subLabel: 'Legacy version',
  },
});

export const ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL = 1000 * 60 * 30; // milliseconds per 30 min;

export const getLeagueMemberPosition = (index, value, topMemberValue, variation, count) => {
  if (index === 0) return LEAGUE_MEMBER_POSITION.top;
  if (index === count - 1) return LEAGUE_MEMBER_POSITION.bottom;
  const step = 0.33 * variation;
  const delta = Math.abs(topMemberValue - value);
  switch (true) {
    case delta >= 0 && delta < step:
      return LEAGUE_MEMBER_POSITION.middleTop;
    case delta >= step && delta <= 2 * step:
      return LEAGUE_MEMBER_POSITION.middle;
    case delta > 2 * step && delta <= variation:
      return LEAGUE_MEMBER_POSITION.middleBottom;
    default:
      return '';
  }
};

export const getNameOfLeagueMember = (member, leagueData) => {
  if (member.location_uid === leagueData.own_location_uid) return 'Our school';
  if (member.rank === 1) return 'Top school';
  if (member.rank === leagueData.total_members) return 'Bottom school';
  return 'Median School';
};

export const reduceObjByKeysList = (obj, keys) => {
  if (!isArray(keys) || !isPlainObject(obj)) return {};
  return keys.reduce((res, key) => {
    const objToMerge = isPlainObject(obj[key]) ? obj[key] : {};
    return { ...res, ...objToMerge };
  }, {});
};

export const hasNullableProp = (obj, propsToSkip = []) => {
  for (const key in obj) { // eslint-disable-line no-restricted-syntax
    if (isNil(obj[key]) && !propsToSkip.includes(key)) return true;
  }
  return false;
};

export const getValueUnitLabelFromEnergyData = (data, precision = 1, defaultUnit = UNIT.kilowattHour) => {
  const DEFAULT_UNIT_LABEL = UNIT_TO_LABEL_MAP[defaultUnit];
  if (isNil(data)) {
    return {
      value: 'N/A',
      unit: DEFAULT_UNIT_LABEL,
    };
  }
  return {
    value: roundToNPlaces(data.value, precision),
    unit: data.unit ? UNIT_TO_LABEL_MAP[data.unit] : DEFAULT_UNIT_LABEL,
  };
};
