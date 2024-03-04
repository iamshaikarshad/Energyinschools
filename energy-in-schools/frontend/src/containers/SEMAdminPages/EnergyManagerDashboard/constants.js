import { isNil, isEmpty } from 'lodash';

import EnergyTotalConsumption from './EnergyTotalConsumption';
import EnergyAlwaysOn from './EnergyAlwaysOn';

import { ENERGY_TYPE } from '../../../constants/config';

import roundToNPlaces from '../../../utils/roundToNPlaces';

export const ENERGY_MANAGER_DASHBOARD_ITEM_NAME = Object.freeze({
  energyTotalConsumption: 'energyTotalConsumption',
  energyAlwaysOn: 'energyAlwaysOn',
});

export const ENERGY_MANAGER_DASHBOARD_ITEMS = [
  {
    id: 1,
    component: EnergyTotalConsumption,
    name: ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyTotalConsumption,
  },
  {
    id: 2,
    component: EnergyAlwaysOn,
    name: ENERGY_MANAGER_DASHBOARD_ITEM_NAME.energyAlwaysOn,
  },
];

export const CONSUMPTION_PERIOD_TYPE = Object.freeze({
  live: 'live',
  today: 'today',
  yesterday: 'yesterday',
});

export const CUSTOM_CONSUMPTION_PERIOD = 'custom';

export const CONSUMPTION_PERIOD_TYPE_LABEL = Object.freeze({
  [CONSUMPTION_PERIOD_TYPE.live]: 'Live (last 15 mins)',
  [CONSUMPTION_PERIOD_TYPE.today]: 'Today',
  [CONSUMPTION_PERIOD_TYPE.yesterday]: 'Yesterday',
  [CUSTOM_CONSUMPTION_PERIOD]: 'Custom',
});

export const CONSUMPTION_PERIODS_ENABLED_TO_REFRESH = [
  CONSUMPTION_PERIOD_TYPE.live,
  CONSUMPTION_PERIOD_TYPE.today,
];

export const CONSUMPTION_ENERGY_TYPE = Object.freeze({
  total: 'total',
  electricity: ENERGY_TYPE.electricity,
  gas: ENERGY_TYPE.gas,
});

export const CONSUMPTION_ENERGY_TYPE_LABEL = Object.freeze({
  [CONSUMPTION_ENERGY_TYPE.total]: 'Total',
  [CONSUMPTION_ENERGY_TYPE.electricity]: 'Electricity',
  [CONSUMPTION_ENERGY_TYPE.gas]: 'Gas',
});

export const ENERGY_TYPE_COLOR_MAP = Object.freeze({
  [ENERGY_TYPE.electricity]: 'rgb(78, 120, 251)',
  [ENERGY_TYPE.gas]: 'rgb(250, 143, 49)',
  [ENERGY_TYPE.solar]: 'rgb(255, 187, 60)',
  [ENERGY_TYPE.unknown]: 'rgba(255, 255, 255, 0.6)',
});

export const CONSUMPTION_ENERGY_TYPE_QUERY_VALUE_MAP = Object.freeze({
  [CONSUMPTION_ENERGY_TYPE.total]: undefined,
  [CONSUMPTION_ENERGY_TYPE.electricity]: ENERGY_TYPE.electricity,
  [CONSUMPTION_ENERGY_TYPE.gas]: ENERGY_TYPE.gas,
});

const ENERGY_MANAGER_DASHBOARD_THEME = Object.freeze({
  dark: {
    main: {
      backgroundImage: 'linear-gradient(to bottom left, #216e93, #21648a, #1f5881)',
      backgroundColor: 'transparent',
    },
    card: {
      backgroundImage: 'none',
      backgroundColor: 'rgba(29, 27, 65, 0.4)',
    },
    header: {
      backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), #21648a, #1f5881)',
      backgroundColor: 'transparent',
    },
  },
  normal: {
    main: {
      backgroundImage: 'linear-gradient(to bottom left, #6cacca, #3084a6, #3978a5)',
      backgroundColor: 'transparent',
    },
    card: {
      backgroundImage: 'none',
      backgroundColor: 'rgba(1, 37, 83, 0.5)',
    },
    header: {
      backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), #21648a, #2d6187)',
      backgroundColor: 'transparent',
    },
  },
});

export const ENERGY_MANAGER_DASHBOARD_CURRENT_THEME = ENERGY_MANAGER_DASHBOARD_THEME.normal;

export const CARD_STYLE = Object.freeze({
  backgroundColor: ENERGY_MANAGER_DASHBOARD_CURRENT_THEME.card.backgroundColor,
  height: 500,
  borderRadius: 5,
});

export const DEFAULT_PERIOD_TYPE_SELECT_OPTIONS = Object.values(CONSUMPTION_PERIOD_TYPE).map(type => ({ value: type, label: CONSUMPTION_PERIOD_TYPE_LABEL[type] }));

export const PERIOD_TYPE_SELECT_OPTIONS_WITH_CUSTOM_SELECT = DEFAULT_PERIOD_TYPE_SELECT_OPTIONS.concat({ value: CUSTOM_CONSUMPTION_PERIOD, label: CONSUMPTION_PERIOD_TYPE_LABEL[CUSTOM_CONSUMPTION_PERIOD] });

export const DEFAULT_ENERGY_TYPE_SELECT_OPTIONS = Object.values(CONSUMPTION_ENERGY_TYPE).map(type => ({ value: type, label: CONSUMPTION_ENERGY_TYPE_LABEL[type] }));

export const WINDOW_SCROLL_DELAY = 150;

export const MIN_WINDOW_SCROLL_PIXELS = 200;

const ALWAYS_ON_YEARLY_HOURS = 190 * 12 + 175 * 24; // 190 - school days (12 hours), 175 - non-school days (24 hours)

export const DATE_RANGE_SELECT_THEME = {
  overrides: {
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: 'rgba(47, 104, 160, 1)',
      },
    },
    MuiPickerDTTabs: {
      tabs: {
        backgroundColor: 'rgba(55, 111, 157, 1)',
      },
    },
    MuiPickersDay: {
      day: {
        color: 'rgba(0, 0, 0, 0.87)',
      },
      daySelected: {
        backgroundColor: 'rgb(37, 173, 223)',
        '&:hover': {
          backgroundColor: 'rgb(37, 173, 223)',
        },
      },
      current: {
        color: 'rgba(0, 120, 255, 1)',
      },
    },
    MuiPickersYear: {
      yearSelected: {
        color: 'rgb(37, 173, 223)',
      },
    },
    MuiPickersClock: {
      pin: {
        backgroundColor: 'rgb(37, 173, 223)',
      },
    },
    MuiPickersClockPointer: {
      pointer: {
        backgroundColor: 'rgb(37, 173, 223)',
      },
      thumb: {
        borderColor: 'rgb(37, 173, 223)',
      },
      noPoint: {
        backgroundColor: 'rgb(37, 173, 223)',
      },
    },
  },
};

export const calcYearlyEnergySavingCostByTodayAlwaysOn = (percentageReduceValue, alwaysOnEnergy, tariffs) => {
  if (isNil(alwaysOnEnergy)) {
    return {
      value: null,
      message: 'Requires always-on data!',
    };
  }
  if (isEmpty(tariffs)) {
    return {
      value: null,
      message: 'There is no tariff info!',
    };
  }
  const minWattHourCost = Math.min(...tariffs.map(item => item.watt_hour_cost));
  // here calculation is (50% x always on usage x 190 x 12 (hours))
  // [school days where savings are only for 12 hours] +
  // (50% x always on usage x 175 x 24 (hours))
  // [non-school days where savings are for 24 hours]
  return {
    value: roundToNPlaces(minWattHourCost * alwaysOnEnergy.value * (ALWAYS_ON_YEARLY_HOURS) * percentageReduceValue / 100, 0),
  };
};
