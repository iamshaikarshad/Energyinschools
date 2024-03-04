import React from 'react';
import moment from 'moment';

import {
  isEmpty, isNil, capitalize, round, isInteger, mapKeys,
} from 'lodash';

import { UNIT, UNIT_TO_LABEL_MAP } from '../../../constants/config';

import objectHasNonEmptyValue from '../../../utils/objectHasNonEmptyValue';
import getOrdinal from '../../../utils/getOrdinal';

import gasIcon from '../../../images/gas_filled_orange.svg';
import electricityIcon from '../../../images/electricity_filled_blue.svg';

export const WINDOW_SCROLL_DELAY = 150;

export const MIN_WINDOW_SCROLL_PIXELS = 150;

export const PAGE_ELEMENT_ID = Object.freeze({
  pageTitle: 'schools_monitoring_page_title_id',
  menuTitle: 'schools_monitoring_page_title_id',
});

export const MENU_SCROLL_BUTTON_TYPE = Object.freeze({
  desktop: 'desktop',
  mobile: 'mobile',
});

export const SCHOOL_SELECT_OPTIONS = Object.freeze({
  all_schools: 'all_schools',
  real_schools: 'real_schools',
  test_schools: 'test_schools',
});

export const LABELED_SCHOOL_SELECT_OPTIONS = [
  {
    value: SCHOOL_SELECT_OPTIONS.all_schools,
    label: 'All schools',
  }, {
    value: SCHOOL_SELECT_OPTIONS.real_schools,
    label: 'Real schools',
  }, {
    value: SCHOOL_SELECT_OPTIONS.test_schools,
    label: 'Test schools',
  },
];

export const STATUS_COLOR = Object.freeze({
  alert: 'rgba(243, 20, 49, 1)',
  success: 'rgba(75, 181, 67, 1)',
  warning: 'rgba(255, 174, 66, 1)',
  strongWarning: 'rgba(255, 134, 66, 1)',
  liteWarning: 'rgba(255, 204, 66, 1)',
  unknown: 'rgba(168, 168, 168, 1)',
});

const STATUS_BASE = Object.freeze({
  dataNotAvailable: 'dataNotAvailable',
  success: 'success',
  unknown: 'unknown',
});

const STATUS_BASE_TEXT = Object.freeze({
  [STATUS_BASE.dataNotAvailable]: 'data is not available!',
  [STATUS_BASE.success]: 'success',
  [STATUS_BASE.unknown]: 'unknown status!',
});

const STATUS_BASE_COLOR = Object.freeze({
  [STATUS_BASE.dataNotAvailable]: STATUS_COLOR.alert,
  [STATUS_BASE.success]: STATUS_COLOR.success,
  [STATUS_BASE.unknown]: STATUS_COLOR.unknown,
});

export const NOT_AVAILABLE_LABEL = Object.freeze({
  nullable: '—',
  question: '?',
  nA: 'N/A',
});

export const SMART_APP_CONNECTION_STATUS = Object.freeze({
  connected: 'Smart app connected',
  noSmartApp: 'No connected smart app',
  refreshTokenExpired: 'Refresh token expired',
  refreshTokenShouldBeRefreshed: 'Refresh token should be refreshed',
  refreshTokenBroken: 'Refresh token broken',
  unknown: 'Unknown',
});

export const AVALAIBILITY_STATUS = Object.freeze({
  present: 'present',
  missing: 'missing',
});

export const AVALAIBILITY_STATUS_LABEL = Object.freeze({
  [AVALAIBILITY_STATUS.present]: 'present',
  [AVALAIBILITY_STATUS.missing]: 'missing',
});

export const OFF_PEAKY_POINTS_DATA_PROP = Object.freeze({
  total: 'total',
  yesterdayValue: 'yesterday_value',
  daysWithPositiveValue: 'days_with_positive_value',
  dayAvgValue: 'day_avg_value',
});

export const OFF_PEAKY_POINTS_DATA_PROPS = Object.values(OFF_PEAKY_POINTS_DATA_PROP);

export const OFF_PEAKY_POINTS_DATA_PROP_LABEL = Object.freeze({
  [OFF_PEAKY_POINTS_DATA_PROP.total]: 'Total',
  [OFF_PEAKY_POINTS_DATA_PROP.yesterdayValue]: 'Yesterday value',
  [OFF_PEAKY_POINTS_DATA_PROP.daysWithPositiveValue]: 'Days with positive value',
  [OFF_PEAKY_POINTS_DATA_PROP.dayAvgValue]: 'Daily average value',
});

export const OFF_PEAKY_POINTS_HISTORICAL_DATA_ITEM_PROP = Object.freeze({
  day: 'day',
  value: 'value',
});

export const OFF_PEAKY_POINTS_HISTORICAL_DATA_ITEM_PROPS = Object.values(OFF_PEAKY_POINTS_HISTORICAL_DATA_ITEM_PROP);

export const OFF_PEAKY_POINTS_HISTORICAL_DATA_ITEM_PROP_DISPLAY_CONFIG = Object.freeze({
  [OFF_PEAKY_POINTS_HISTORICAL_DATA_ITEM_PROP.day]: {
    label: 'Day',
    sorting: true,
  },
  [OFF_PEAKY_POINTS_HISTORICAL_DATA_ITEM_PROP.value]: {
    label: 'Value',
    sorting: true,
    transformRule: value => (!isNil(value) ? round(value, 1) : NOT_AVAILABLE_LABEL.nA),
  },
});

export const ENERGY_TYPE = Object.freeze({
  electricity: 'electricity',
  gas: 'gas',
});

export const ENERGY_TYPES = Object.values(ENERGY_TYPE);

export const ENERGY_TYPE_LABEL = Object.freeze({
  [ENERGY_TYPE.electricity]: 'Electricity',
  [ENERGY_TYPE.gas]: 'Gas',
});

export const ENERGY_CONSUMPTION_TYPE = Object.freeze({
  live: 'live',
  today: 'today',
  yesterday: 'yesterday',
});

export const ENERGY_CONSUMPTION_TYPES = Object.values(ENERGY_CONSUMPTION_TYPE);

export const ENERGY_CONSUMPTION_TYPE_LABEL = Object.freeze({
  [ENERGY_CONSUMPTION_TYPE.live]: 'Live',
  [ENERGY_CONSUMPTION_TYPE.today]: 'Today',
  [ENERGY_CONSUMPTION_TYPE.yesterday]: 'Yesterday',
});

export const DEFAULT_ENERGY_TYPE_DISPLAY_CONFIG = Object.freeze({
  color: 'rgba(0, 0, 0, 0.87)',
  icon: null,
  /*
    energy type data is null if there is no meter of current energy type.
    option showOnDataUnavailable is needed to know if to display energy type details in case of current type meters unavalability
  */
  showOnDataUnavailable: false,
});

export const ENERGY_TYPE_TO_DISPLAY_CONFIG_MAP = Object.freeze({
  [ENERGY_TYPE.electricity]: {
    icon: electricityIcon,
    color: 'rgb(41, 180, 240)',
    showOnDataUnavailable: true,
  },
  [ENERGY_TYPE.gas]: {
    icon: gasIcon,
    color: 'rgb(243, 143, 49)',
    showOnDataUnavailable: true,
  },
});

const ENERGY_USAGE_STATUS = Object.freeze({
  ...STATUS_BASE,
  electricityDataNotAvailable: 'electricityDataNotAvailable',
  gasDataNotAvailable: 'gasDataNotAvailable',
  electricityLiveValueNotAvailable: 'electricityLiveValueNotAvailable',
  electricityTodayValueNotAvailable: 'electricityTodayValueNotAvailable',
  gasLiveValueNotAvailable: 'gasLiveValueNotAvailable',
  gasTodayValueNotAvailable: 'gasTodayValueNotAvailable',
  unknownEnergyTypeMetersPresent: 'unknownEnergyTypeMetersPresent',
});

const ENERGY_TYPE_STATUS_CONFIG = Object.freeze({
  [ENERGY_TYPE.electricity]: {
    isMandatory: true,
    typeNoDataStatus: ENERGY_USAGE_STATUS.electricityDataNotAvailable,
    typeNoValueStatus: {
      [ENERGY_CONSUMPTION_TYPE.live]: ENERGY_USAGE_STATUS.electricityLiveValueNotAvailable,
      [ENERGY_CONSUMPTION_TYPE.today]: ENERGY_USAGE_STATUS.electricityTodayValueNotAvailable,
    },
  },
  [ENERGY_TYPE.gas]: {
    isMandatory: false,
    typeNoDataStatus: ENERGY_USAGE_STATUS.gasDataNotAvailable,
    typeNoValueStatus: {
      [ENERGY_CONSUMPTION_TYPE.live]: ENERGY_USAGE_STATUS.gasLiveValueNotAvailable,
      [ENERGY_CONSUMPTION_TYPE.today]: ENERGY_USAGE_STATUS.gasTodayValueNotAvailable,
    },
  },
});

const ENERGY_USAGE_STATUS_TEXT = Object.freeze({
  ...STATUS_BASE_TEXT,
  [ENERGY_USAGE_STATUS.electricityDataNotAvailable]: 'no electricity meter!',
  [ENERGY_USAGE_STATUS.gasDataNotAvailable]: 'no gas meter!',
  [ENERGY_USAGE_STATUS.electricityLiveValueNotAvailable]: 'electricity live value is not available!',
  [ENERGY_USAGE_STATUS.electricityTodayValueNotAvailable]: 'electricity today consumption is not available!',
  [ENERGY_USAGE_STATUS.gasLiveValueNotAvailable]: 'gas live value is not available!',
  [ENERGY_USAGE_STATUS.gasTodayValueNotAvailable]: 'gas today consumption is not available!',
  [ENERGY_USAGE_STATUS.unknownEnergyTypeMetersPresent]: 'the school has meter(s) of unknown energy type!',
  [ENERGY_USAGE_STATUS.success]: 'consumption data(live, today) is available',
});

const ENERGY_USAGE_STATUS_COLOR = Object.freeze({
  ...STATUS_BASE_COLOR,
  [ENERGY_USAGE_STATUS.electricityDataNotAvailable]: STATUS_COLOR.alert,
  [ENERGY_USAGE_STATUS.gasDataNotAvailable]: STATUS_COLOR.alert,
  [ENERGY_USAGE_STATUS.electricityLiveValueNotAvailable]: STATUS_COLOR.warning,
  [ENERGY_USAGE_STATUS.electricityTodayValueNotAvailable]: STATUS_COLOR.alert,
  [ENERGY_USAGE_STATUS.gasLiveValueNotAvailable]: STATUS_COLOR.warning,
  [ENERGY_USAGE_STATUS.gasTodayValueNotAvailable]: STATUS_COLOR.alert,
  [ENERGY_USAGE_STATUS.unknownEnergyTypeMetersPresent]: STATUS_COLOR.warning,
});

export const ENERGY_LEAGUE = Object.freeze({
  electricityLive: 'electricityLive',
  electricityYesterday: 'electricityYesterday',
  gasYesterday: 'gasYesterday',
  alwaysOn: 'alwaysOn',
});

export const ENERGY_LEAGUES = Object.values(ENERGY_LEAGUE);

export const ENERGY_LEAGUE_LABEL = Object.freeze({
  [ENERGY_LEAGUE.electricityLive]: 'Electricity live',
  [ENERGY_LEAGUE.electricityYesterday]: 'Electricity yesterday',
  [ENERGY_LEAGUE.gasYesterday]: 'Gas yesterday',
  [ENERGY_LEAGUE.alwaysOn]: 'Always-on usage',
});

export const ENERGY_LEAGUE_RESPONSE_DATA_PROP = Object.freeze({
  [ENERGY_LEAGUE.electricityLive]: 'electricity_live',
  [ENERGY_LEAGUE.electricityYesterday]: 'electricity_yesterday',
  [ENERGY_LEAGUE.gasYesterday]: 'gas_yesterday',
  [ENERGY_LEAGUE.alwaysOn]: 'always_on',
});

export const ENERGY_LEAGUE_DETAIL = Object.freeze({
  name: 'name',
  points: 'points',
  unit: 'unit',
  position: 'position',
  totalMembers: 'totalMembers',
});

export const ENERGY_LEAGUE_DETAILS = Object.values(ENERGY_LEAGUE_DETAIL);

const LEAGUE_POINTS_UNIT = Object.freeze({
  watt: 'watt',
  watt_per_pupil: 'watt_per_pupil',
  watt_hour_per_pupil: 'watt_hour_per_pupil',
  point: 'point',
  point_per_pupil: 'point_per_pupil',
});

export const LEAGUE_POINTS_UNIT_LABEL = Object.freeze({
  [LEAGUE_POINTS_UNIT.watt]: 'watt',
  [LEAGUE_POINTS_UNIT.watt_per_pupil]: 'watt per pupil',
  [LEAGUE_POINTS_UNIT.watt_hour_per_pupil]: 'watt-hour per pupil',
  [LEAGUE_POINTS_UNIT.point]: 'points',
  [LEAGUE_POINTS_UNIT.point_per_pupil]: 'points per pupil',
});

export const ENERGY_LEAGUE_DETAIL_CONFIG = Object.freeze({
  [ENERGY_LEAGUE_DETAIL.name]: {
    name: 'League',
    getValue: leaderboardKey => ENERGY_LEAGUE_LABEL[leaderboardKey],
  },
  [ENERGY_LEAGUE_DETAIL.points]: {
    name: 'School points',
    getValue: (leaderboardKey, leaderboardData) => {
      if (isNil(leaderboardData)) return NOT_AVAILABLE_LABEL.nA;
      const value = leaderboardData.own_points;
      return !isNil(value) ? round(value, 2) : NOT_AVAILABLE_LABEL.nA;
    },
  },
  [ENERGY_LEAGUE_DETAIL.unit]: {
    name: 'Points unit',
    getValue: (leaderboardKey, leaderboardData) => {
      if (isNil(leaderboardData)) return NOT_AVAILABLE_LABEL.nA;
      const value = leaderboardData.points_unit;
      return LEAGUE_POINTS_UNIT_LABEL[value] || NOT_AVAILABLE_LABEL.question;
    },
  },
  [ENERGY_LEAGUE_DETAIL.position]: {
    name: 'School position',
    getValue: (leaderboardKey, leaderboardData) => {
      if (isNil(leaderboardData)) return NOT_AVAILABLE_LABEL.nA;
      const { own_rank: ownRank } = leaderboardData;
      if (!isInteger(ownRank)) return NOT_AVAILABLE_LABEL.nA;
      return getOrdinal(ownRank).fullText;
    },
  },
  [ENERGY_LEAGUE_DETAIL.totalMembers]: {
    name: 'Number of participants',
    getValue: (leaderboardKey, leaderboardData) => {
      if (isNil(leaderboardData)) return NOT_AVAILABLE_LABEL.nA;
      const { total_members: totalMembers } = leaderboardData;
      return totalMembers || NOT_AVAILABLE_LABEL.nA;
    },
  },
});

export const METERS_CONNECTIVITY_RESOURCE_TYPE = Object.freeze({
  energyMeters: 'energy_meters',
  smartThingsEnergyMeters: 'smart_things_energy_meters',
});

export const METERS_CONNECTIVITY_RESOURCE_TYPES = Object.values(METERS_CONNECTIVITY_RESOURCE_TYPE);

export const METERS_CONNECTIVITY_RESOURCE_TYPE_LABEL = Object.freeze({
  [METERS_CONNECTIVITY_RESOURCE_TYPE.energyMeters]: 'Energy meters',
  [METERS_CONNECTIVITY_RESOURCE_TYPE.smartThingsEnergyMeters]: 'SmartThings energy meters',
});

export const METERS_CONNECTIVITY_DETAIL = Object.freeze({
  name: 'name',
  online: 'online',
  total: 'total',
});

export const METERS_CONNECTIVITY_DETAILS = Object.values(METERS_CONNECTIVITY_DETAIL);

export const METERS_CONNECTIVITY_DETAIL_CONFIG = Object.freeze({
  [METERS_CONNECTIVITY_DETAIL.name]: {
    name: 'Meters type',
    getValue: resourceTypeKey => METERS_CONNECTIVITY_RESOURCE_TYPE_LABEL[resourceTypeKey],
  },
  [METERS_CONNECTIVITY_DETAIL.online]: {
    name: 'Connected meters count',
    getValue: (resourceTypeKey, resourceTypeData) => {
      if (isNil(resourceTypeData)) return 0;
      const { online: onlineMetersCount } = resourceTypeData;
      return !isNil(onlineMetersCount) ? onlineMetersCount : 0;
    },
  },
  [METERS_CONNECTIVITY_DETAIL.total]: {
    name: 'Total meters count',
    getValue: (resourceTypeKey, resourceTypeData) => {
      if (isNil(resourceTypeData)) return 0;
      const { total: totalMetersCount } = resourceTypeData;
      return !isNil(totalMetersCount) ? totalMetersCount : 0;
    },
  },
});

export const METERS_CONNECTIVITY_DETAIL_ACTION = Object.freeze({
  showNotOnlineMetersList: 'showNotOnlineMetersList',
});

export const METERS_CONNECTIVITY_DETAIL_ACTIONS = Object.values(METERS_CONNECTIVITY_DETAIL_ACTION);

export const METERS_CONNECTIVITY_DETAIL_ACTION_CONFIG = Object.freeze({
  [METERS_CONNECTIVITY_DETAIL_ACTION.showNotOnlineMetersList]: {
    name: 'Disconnected meters list*', // incudes meters with offline and unknown statuses for smarthings energy meters resource type
    label: 'Show list',
    key: METERS_CONNECTIVITY_DETAIL_ACTION.showNotOnlineMetersList,
    getActionIsDisabled: (resourceTypeKey, resourceTypeData) => (isEmpty(resourceTypeData) || isEmpty(resourceTypeData.not_online)),
  },
});

export const METERS_CONNECTIVITY_STATUS = Object.freeze({
  ...STATUS_BASE,
  noMeters: 'noMeters',
  disconnectedMetersPresent: 'disconnectedMetersPresent',
});

export const METERS_CONNECTIVITY_STATUS_TEXT = Object.freeze({
  ...STATUS_BASE_TEXT,
  [METERS_CONNECTIVITY_STATUS.noMeters]: 'no energy meter!',
  [METERS_CONNECTIVITY_STATUS.disconnectedMetersPresent]: 'there is disconnected meter(s)!',
  [METERS_CONNECTIVITY_STATUS.success]: 'all the meters are connected',
});

export const METERS_CONNECTIVITY_STATUS_COLOR = Object.freeze({
  ...STATUS_BASE_COLOR,
  [METERS_CONNECTIVITY_STATUS.noMeters]: STATUS_COLOR.alert,
  [METERS_CONNECTIVITY_STATUS.disconnectedMetersPresent]: STATUS_COLOR.alert,
});

export const TARIFF_USE_TYPE = Object.freeze({
  normal: 'normal',
});

export const TARIFF_USE_TYPES = Object.values(TARIFF_USE_TYPE);

export const TARIFF_USE_TYPE_LABEL = Object.freeze({
  [TARIFF_USE_TYPE.normal]: 'Normal',
});

const TARIFF_USE_TYPE_UNAVAILABLE_STATUS = Object.freeze({
  [TARIFF_USE_TYPE.normal]: 'normalTariffsUnavailable',
});

const TARIFF_USE_TYPE_UNAVAILABLE_STATUS_TEXT = Object.freeze({
  [TARIFF_USE_TYPE_UNAVAILABLE_STATUS[TARIFF_USE_TYPE.normal]]: 'missing normal tariffs',
});

const TARIFF_USE_TYPE_UNAVAILABLE_STATUS_COLOR = Object.freeze({
  [TARIFF_USE_TYPE_UNAVAILABLE_STATUS[TARIFF_USE_TYPE.normal]]: STATUS_COLOR.warning,
});

const TARIFFS_AVAILABILITY_STATUS = Object.freeze({
  ...STATUS_BASE,
  noTariff: 'noTariff',
  ...mapKeys(TARIFF_USE_TYPE_UNAVAILABLE_STATUS),
});

const TARIFFS_AVAILABILITY_STATUS_TEXT = Object.freeze({
  ...STATUS_BASE_TEXT,
  ...TARIFF_USE_TYPE_UNAVAILABLE_STATUS_TEXT,
  [TARIFFS_AVAILABILITY_STATUS.noTariff]: 'no tariff!',
  [TARIFFS_AVAILABILITY_STATUS.success]: 'present for all the tariffs use types',
});

const TARIFFS_AVAILABILITY_STATUS_COLOR = Object.freeze({
  ...STATUS_BASE_COLOR,
  ...TARIFF_USE_TYPE_UNAVAILABLE_STATUS_COLOR,
  [TARIFFS_AVAILABILITY_STATUS.noTariff]: STATUS_COLOR.alert,
});

export const TARIFF_USE_TYPE_SCHOOL_METRICS_RESPONSE_PROP = Object.freeze({
  [TARIFF_USE_TYPE.normal]: 'current_energy_tariffs',
});

export const TARIFF_PROP = Object.freeze({
  meterType: 'meterType',
  wattHourCost: 'wattHourCost',
  dailyFixedCost: 'dailyFixedCost',
  resourceId: 'resourceId',
  activeTimeStart: 'activeTimeStart',
  activeTimeEnd: 'activeTimeEnd',
  activeDateStart: 'activeDateStart',
  activeDateEnd: 'activeDateEnd',
});

export const TARIFF_PROPS = Object.values(TARIFF_PROP);

export const TARIFF_PROP_TO_RESPONSE_PROP_MAP = Object.freeze({
  [TARIFF_PROP.meterType]: 'meter_type',
  [TARIFF_PROP.wattHourCost]: 'watt_hour_cost',
  [TARIFF_PROP.dailyFixedCost]: 'daily_fixed_cost',
  [TARIFF_PROP.resourceId]: 'resource_id',
  [TARIFF_PROP.activeTimeStart]: 'active_time_start',
  [TARIFF_PROP.activeTimeEnd]: 'active_time_end',
  [TARIFF_PROP.activeDateStart]: 'active_date_start',
  [TARIFF_PROP.activeDateEnd]: 'active_date_end',
});

const POUND_WH_TO_PENCE_KWH_RATIO = 10 ** 5;
const POUND_TO_PENCE_RATIO = 10 ** 2;
const DEFAULT_DECIMAL_PLACES = 2;

const TARIFF_INFO_DISPLAY_GETTER = Object.freeze({
  capitalize: value => capitalize(value),
  getValue: value => (!isNil(value) ? value : NOT_AVAILABLE_LABEL.nullable),
  round: (value, dp = DEFAULT_DECIMAL_PLACES) => Math.round(value * 10 ** dp) / 10 ** dp,
});

export const TARIFF_PROP_TO_DISPLAY_CONFIG = Object.freeze({
  [TARIFF_PROP.meterType]: {
    name: 'Energy type',
    getValue: TARIFF_INFO_DISPLAY_GETTER.capitalize,
  },
  [TARIFF_PROP.wattHourCost]: {
    name: `Cost(p/${UNIT_TO_LABEL_MAP[UNIT.kilowattHour]})`,
    getValue: value => TARIFF_INFO_DISPLAY_GETTER.getValue(
      TARIFF_INFO_DISPLAY_GETTER.round(value * POUND_WH_TO_PENCE_KWH_RATIO),
    ),
  },
  [TARIFF_PROP.dailyFixedCost]: {
    name: 'Daily fixed cost(p)',
    getValue: value => TARIFF_INFO_DISPLAY_GETTER.getValue(
      TARIFF_INFO_DISPLAY_GETTER.round(value * POUND_TO_PENCE_RATIO),
    ),
  },
  [TARIFF_PROP.resourceId]: {
    name: 'Resource id',
    getValue: TARIFF_INFO_DISPLAY_GETTER.getValue,
  },
  [TARIFF_PROP.activeTimeStart]: {
    name: 'Active time start',
    getValue: TARIFF_INFO_DISPLAY_GETTER.getValue,
  },
  [TARIFF_PROP.activeTimeEnd]: {
    name: 'Active time end',
    getValue: value => (!isNil(value) ? value : '00:00:00'),
  },
  [TARIFF_PROP.activeDateStart]: {
    name: 'Active date start',
    getValue: TARIFF_INFO_DISPLAY_GETTER.getValue,
  },
  [TARIFF_PROP.activeDateEnd]: {
    name: 'Active date end',
    getValue: TARIFF_INFO_DISPLAY_GETTER.getValue,
  },
});

export const MUG_SWITCHES_STATISTIC_PROP = Object.freeze({
  sentToMUG: 'sent_to_mug',
  supplierDownloadedContract: 'supplier_downloaded_contract',
  switchAccepted: 'switch_accepted',
  liveSwitchComplete: 'live_switch_complete',
  failedContract: 'failed_contract',
});

const MUG_SITE_PROP = Object.freeze({
  sublocationName: 'sub_location_name',
  sublocationId: 'sub_location_id',
  mugSiteId: 'mug_site_id',
});

export const MUG_SITE_PROPS = Object.values(MUG_SITE_PROP);

export const MUG_SITE_PROP_DISPLAY_CONFIG = Object.freeze({
  [MUG_SITE_PROP.sublocationName]: {
    label: 'Sublocation name',
    sorting: false,
  },
  [MUG_SITE_PROP.sublocationId]: {
    label: 'Sublocation id',
    sorting: false,
  },
  [MUG_SITE_PROP.mugSiteId]: {
    label: 'MUG site id',
    sorting: false,
  },
});

const MUG_METER_PROP = Object.freeze({
  meterId: 'meter_id',
  mugMeterId: 'mug_meter_id',
});

export const MUG_METER_PROPS = Object.values(MUG_METER_PROP);

export const MUG_METER_PROP_DISPLAY_CONFIG = Object.freeze({
  [MUG_METER_PROP.meterId]: {
    label: 'MPAN/MPRN',
    sorting: true,
  },
  [MUG_METER_PROP.mugMeterId]: {
    label: 'MUG meter id',
    sorting: true,
  },
});

export const MUG_SWITCHES_STATISTIC_PROPS = Object.values(MUG_SWITCHES_STATISTIC_PROP);

export const MUG_SWITCHES_STATISTIC_PROP_LABEL = Object.freeze({
  [MUG_SWITCHES_STATISTIC_PROP.sentToMUG]: 'Sent to MUG',
  [MUG_SWITCHES_STATISTIC_PROP.supplierDownloadedContract]: 'Suppliers contracts downloaded',
  [MUG_SWITCHES_STATISTIC_PROP.switchAccepted]: 'Switches accepted',
  [MUG_SWITCHES_STATISTIC_PROP.liveSwitchComplete]: 'Live switches complete',
  [MUG_SWITCHES_STATISTIC_PROP.failedContract]: 'Failed contracts',
});

const MUG_DATA_STATUS = Object.freeze({
  ...STATUS_BASE,
  noMugCustomerId: 'noMugCustomerId',
  noMugSites: 'noMugSites',
  existSiteWithNullableMUGSiteId: 'existSiteWithNullableMUGSiteId',
  existMeterWithNullableMUGMeterId: 'existMeterWithNullableMUGMeterId',
  existMeterNotBindedToResource: 'existMeterNotBindedToResource',
  noMugMeters: 'noMugMeters',
});

const MUG_DATA_STATUS_TEXT = Object.freeze({
  ...STATUS_BASE_TEXT,
  [MUG_DATA_STATUS.noMugCustomerId]: 'no MUG customer id!',
  [MUG_DATA_STATUS.noMugSites]: 'no MUG site!',
  [MUG_DATA_STATUS.existSiteWithNullableMUGSiteId]: 'there exists location with nullable MUG site id!',
  [MUG_DATA_STATUS.existMeterWithNullableMUGMeterId]: 'there exists energy meter billing info with nullable MUG meter id!',
  [MUG_DATA_STATUS.existMeterNotBindedToResource]: 'there exists energy meter billing info that is not binded to any resource',
  [MUG_DATA_STATUS.noMugMeters]: 'no MUG meters!',
  [MUG_DATA_STATUS.success]: 'data is ok',
});

const MUG_DATA_STATUS_COLOR = Object.freeze({
  ...STATUS_BASE_COLOR,
  [MUG_DATA_STATUS.noMugCustomerId]: STATUS_COLOR.alert,
  [MUG_DATA_STATUS.noMugSites]: STATUS_COLOR.alert,
  [MUG_DATA_STATUS.existSiteWithNullableMUGSiteId]: STATUS_COLOR.warning,
  [MUG_DATA_STATUS.existMeterWithNullableMUGMeterId]: STATUS_COLOR.warning,
  [MUG_DATA_STATUS.existMeterNotBindedToResource]: STATUS_COLOR.warning,
  [MUG_DATA_STATUS.noMugMeters]: STATUS_COLOR.warning,
});

export const METRIC_ITEM = Object.freeze({
  metersConnectivity: 'metersConnectivity',
  energyUsage: 'energyUsage',
  tariffs: 'tariffs',
  mugIntegration: 'mugIntegration',
});

const metricStatusInfoGetter = (title, statusTextDict, defaultText = STATUS_BASE_TEXT[STATUS_BASE.unknown]) => (status) => {
  const statusText = statusTextDict[status] || defaultText;
  return (
    <span>
      <span>{title}</span>
      <br />
      {statusText}
    </span>
  );
};

const metricStatusColorGetter = (statusColorDict, defaultColor = STATUS_COLOR.unknown) => status => (statusColorDict[status] || defaultColor);

export const METRIC_DISPLAY_CONFIG = Object.freeze({
  [METRIC_ITEM.metersConnectivity]: {
    order: 1,
    title: 'Meters',
    dataProp: 'energy_meters',
    getStatus: (data) => {
      const truncatedData = Object
        .values(METERS_CONNECTIVITY_RESOURCE_TYPE)
        .reduce((acc, key) => {
          acc[key] = data[key];

          return acc;
        }, {});

      if (isEmpty(truncatedData)) return METERS_CONNECTIVITY_STATUS.dataNotAvailable;
      if (!objectHasNonEmptyValue(truncatedData)) return METERS_CONNECTIVITY_STATUS.noMeters;
      let statusSuccess = true;
      for (let resourceTypeIndex = 0; resourceTypeIndex < METERS_CONNECTIVITY_RESOURCE_TYPES.length; resourceTypeIndex += 1) {
        const resourceType = METERS_CONNECTIVITY_RESOURCE_TYPES[resourceTypeIndex];
        const resourceTypeData = truncatedData[resourceType];
        if (!isEmpty(resourceTypeData)) {
          const { online, total } = resourceTypeData;
          if ((online === total) && (online * total > 0)) continue; // eslint-disable-line no-continue
          if (online < total) return METERS_CONNECTIVITY_STATUS.disconnectedMetersPresent;
          statusSuccess = false;
        }
      }
      return statusSuccess ? METERS_CONNECTIVITY_STATUS.success : METERS_CONNECTIVITY_STATUS.unknown;
    },
    getStatusInfo: metricStatusInfoGetter('Energy meters connectivity:', METERS_CONNECTIVITY_STATUS_TEXT),
    getStatusColor: metricStatusColorGetter(METERS_CONNECTIVITY_STATUS_COLOR),
  },
  [METRIC_ITEM.energyUsage]: {
    order: 2,
    title: 'Energy Usage',
    dataProp: 'consumption',
    getStatus: (data) => {
      // check data existence
      if (isEmpty(data)) return ENERGY_USAGE_STATUS.dataNotAvailable;
      let statusSuccess = false;
      // check each energy type
      for (let energyTypeindex = 0; energyTypeindex < ENERGY_TYPES.length; energyTypeindex += 1) {
        const energyType = ENERGY_TYPES[energyTypeindex];
        const energyTypeData = data[energyType];
        const typeStatusConfig = ENERGY_TYPE_STATUS_CONFIG[energyType];
        if (isNil(typeStatusConfig)) { continue; } // eslint-disable-line no-continue
        const { isMandatory, typeNoDataStatus, typeNoValueStatus } = typeStatusConfig;
        const energyTypeDataAvailable = !isEmpty(energyTypeData);
        if (!energyTypeDataAvailable && isMandatory) return typeNoDataStatus;
        let energyTypeDataStatusSuccess = false;
        if (energyTypeDataAvailable) {
          // check each consumption type(live, today)
          for (let consumptionTypeIndex = 0; consumptionTypeIndex < ENERGY_CONSUMPTION_TYPES.length; consumptionTypeIndex += 1) {
            const consumptionType = ENERGY_CONSUMPTION_TYPES[consumptionTypeIndex];
            const consumptionTypeData = energyTypeData[consumptionType];
            if (isEmpty(consumptionTypeData) || isNil(consumptionTypeData.value)) return typeNoValueStatus[consumptionType];
          }
          energyTypeDataStatusSuccess = true;
        }
        statusSuccess = statusSuccess || energyTypeDataStatusSuccess;
      }
      if (statusSuccess) {
        // show warning if there are unknown meters (data for unknown type is not empty)
        return isEmpty(data[ENERGY_TYPE.unknown]) ? ENERGY_USAGE_STATUS.success : ENERGY_USAGE_STATUS.unknownEnergyTypeMetersPresent;
      }
      return ENERGY_USAGE_STATUS.unknown;
    },
    getStatusInfo: metricStatusInfoGetter('Energy consumption:', ENERGY_USAGE_STATUS_TEXT),
    getStatusColor: metricStatusColorGetter(ENERGY_USAGE_STATUS_COLOR),
  },
  [METRIC_ITEM.tariffs]: {
    order: 3,
    title: 'Energy Tariffs',
    dataProp: 'tariffs',
    getStatus: (data) => {
      if (isEmpty(data)) return TARIFFS_AVAILABILITY_STATUS.dataNotAvailable;
      if (!objectHasNonEmptyValue(data)) return TARIFFS_AVAILABILITY_STATUS.noTariff;
      for (let tariffUseTypeIndex = 0; tariffUseTypeIndex < TARIFF_USE_TYPES.length; tariffUseTypeIndex += 1) {
        const typeKey = TARIFF_USE_TYPES[tariffUseTypeIndex];
        const typeData = data[TARIFF_USE_TYPE_SCHOOL_METRICS_RESPONSE_PROP[typeKey]];
        if (isEmpty(typeData)) return TARIFF_USE_TYPE_UNAVAILABLE_STATUS[typeKey] || TARIFFS_AVAILABILITY_STATUS.unknown;
      }
      return TARIFFS_AVAILABILITY_STATUS.success;
    },
    getStatusInfo: metricStatusInfoGetter('Energy tariffs:', TARIFFS_AVAILABILITY_STATUS_TEXT),
    getStatusColor: metricStatusColorGetter(TARIFFS_AVAILABILITY_STATUS_COLOR),
  },
  [METRIC_ITEM.mugIntegration]: {
    order: 4,
    title: 'MUG data',
    dataProp: 'mug_data',
    getStatus: (data) => {
      if (isEmpty(data)) return MUG_DATA_STATUS.dataNotAvailable;
      if (isNil(data.mug_customer_id)) return MUG_DATA_STATUS.noMugCustomerId;
      const { mug_sites: mugSites } = data;
      if (isEmpty(mugSites)) return MUG_DATA_STATUS.noMugSites;
      if (mugSites.find(site => isNil(site.mug_site_id))) return MUG_DATA_STATUS.existSiteWithNullableMUGSiteId;
      const { mug_meters: mugMeters } = data;
      if (isEmpty(mugMeters)) return MUG_DATA_STATUS.noMugMeters;
      if (mugMeters.find(meter => isNil(meter.mug_meter_id))) return MUG_DATA_STATUS.existMeterWithNullableMUGMeterId;
      if (data.require_resource_linking) return MUG_DATA_STATUS.existMeterNotBindedToResource;
      return MUG_DATA_STATUS.success;
    },
    getStatusInfo: metricStatusInfoGetter('MUG data:', MUG_DATA_STATUS_TEXT),
    getStatusColor: metricStatusColorGetter(MUG_DATA_STATUS_COLOR),
  },
});

export const getElementHeight = (elementId, defaultHeight = 0) => {
  const element = $(`#${elementId}`);
  const height = element.outerHeight();
  return !isNil(height) ? height : defaultHeight;
};

export const formatTime = (time, format = 'D MMM, YYYY h:mm a', defaultValue = NOT_AVAILABLE_LABEL.question) => {
  if (isNil(time)) return defaultValue;
  return moment(time).format(format);
};

export const METRIC_ITEMS_TO_DISPLAY_IN_SCHOOLS_LIST = [...Object.values(METRIC_ITEM)].sort((a, b) => (
  METRIC_DISPLAY_CONFIG[a].order - METRIC_DISPLAY_CONFIG[b].order
));

export const ABNORMAL_VALUE_NOTIFICATION_PROP = Object.freeze({
  eventTime: 'eventTime',
  location: 'location',
  parentLocation: 'parentLocation',
  triggerData: 'triggerData',
});

export const ABNORMAL_VALUE_NOTIFICATION_PROPS = Object.values(ABNORMAL_VALUE_NOTIFICATION_PROP);

export const ABNORMAL_VALUE_NOTIFICATION_PROP_TO_RESPONSE_PROP_MAP = Object.freeze({
  [ABNORMAL_VALUE_NOTIFICATION_PROP.eventTime]: 'event_time',
  [ABNORMAL_VALUE_NOTIFICATION_PROP.location]: 'location',
  [ABNORMAL_VALUE_NOTIFICATION_PROP.triggerData]: 'trigger_data',
});

const ABNORMAL_VALUE_NOTIFICATION_INFO_DISPLAY_GETTER = Object.freeze({
  capitalize: value => capitalize(value),
  getValue: value => (!isNil(value) ? value : NOT_AVAILABLE_LABEL.nullable),
});

export const ABRNORMAL_VALUE_NOTIFICATION_PROP_TO_DISPAY_CONFIG = Object.freeze({
  [ABNORMAL_VALUE_NOTIFICATION_PROP.eventTime]: {
    name: 'Event time',
    getValue: ABNORMAL_VALUE_NOTIFICATION_INFO_DISPLAY_GETTER.getValue,
    transformRule: value => (!isNil(value) ? moment(value).format('D MMM YYYY, HH:mm') : NOT_AVAILABLE_LABEL.nA),
  },
  [ABNORMAL_VALUE_NOTIFICATION_PROP.location]: {
    name: 'Location',
    getValue: ABNORMAL_VALUE_NOTIFICATION_INFO_DISPLAY_GETTER.getValue,
    transformRule: (location, parentLocation) => (!isNil(parentLocation) ? `${location} (${parentLocation})` : location),
  },
  [ABNORMAL_VALUE_NOTIFICATION_PROP.triggerData]: {
    name: 'Trigger data',
    getValue: ABNORMAL_VALUE_NOTIFICATION_INFO_DISPLAY_GETTER.getValue,
  },
});
