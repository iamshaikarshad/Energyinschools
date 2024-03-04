import Intro from '../../../components/EnergyScreenDashboard/v3/Intro/Intro';
import CarbonIntensityMain from '../../../components/EnergyScreenDashboard/v3/CarbonIntensity/CarbonIntensityMain';
import OffPeakyPointsMain from '../../../components/EnergyScreenDashboard/v3/OffPeakyPoints/OffPeakyPointsMain';
import EnergyTips from '../../../components/EnergyScreenDashboard/v3/EnergyTips/EnergyTips';
import ElectricityUsage from '../../../components/EnergyScreenDashboard/v3/ElectricityUsage/ElectricityUsage';

import MessagesSlider from '../../../components/EnergyScreenDashboard/v3/CommonComponents/MessagesSlider';
import Slide from '../../../components/EnergyScreenDashboard/v3/CommonComponents/Slide';

import getCarbonIntensity from '../../../actions/EnergyDashboard/carbonIntensityActions';
import {
  getCurrentWeather,
  getWeatherForecast,
} from '../../../actions/EnergyDashboard/newsWeatherDashboardAction';
import {
  getLiveConsumptionByElectricityType,
} from '../../../actions/EnergyDashboard/liveConsumptionAction';

import {
  getElectricityTodayConsumption,
  getElectricityTodayCostConsumption,
} from '../../../actions/EnergyDashboard/todayConsumptionAction';

import {
  getElectricityCurrentWeekHistoricalCost,
  getElectricityLastWeekHistoricalCost,
} from '../../../actions/EnergyDashboard/weekHistoricalCostAction';


import {
  getElectricityTariffs,
} from '../../../actions/EnergyDashboard/energyTariffsAction';

import getPreviewMessages from '../../../actions/EnergyDashboard/previewMessagesAction';
import getSchoolInformation from '../../../actions/EnergyDashboard/schoolsActions';
import getTipsList from '../../../actions/EnergyDashboard/energyTipsActions';

import reportOnActivity from '../../../actions/EnergyDashboard/auxiliaryActions';

import { ELECTRICITY } from '../../../constants/config';

import CarbonIntensityBg from '../../../images/carbon-intensity-big-bg.png';
import OffPeakyBg from '../../../images/Dashboard_V2_Arts/off_peaky_bg.svg';
import ElectricityBg from '../../../images/Dashboard_V2_Arts/electricity_bg.svg';
import EnergyTipsListingBg from '../../../images/facts_no_data_bg.png';

import {
  DASHBOARD_STORE_KEY,
  ENERGY_DASHBOARD_VERSION,
  ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL,
} from '../../../components/EnergyScreenDashboard/constants';

const MILLISECONDS_PER_MINUTE = 1000 * 60;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60;

export const INITIAL_COMMON_ACTIONS = [
  {
    refreshInterval: ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL,
    action: (params, dispatch) => {
      dispatch(reportOnActivity(ENERGY_DASHBOARD_VERSION.energyDashboardV3));
    },
  },
];

export const introSlide = new Slide(
  Intro,
  {},
  [],
  [DASHBOARD_STORE_KEY.schoolInformation],
  [
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getSchoolInformation(params.schoolId));
      },
    },
  ],
  {
    backgroundImg: OffPeakyBg,
    backgroundColor: 'rgb(53, 110, 183)',
    name: 'Intro',
  },
);

export const carbonIntensitySlide = new Slide(
  CarbonIntensityMain,
  {
    messagesSlider: MessagesSlider,
  },
  [],
  [DASHBOARD_STORE_KEY.carbonIntensity],
  [
    {
      refreshInterval: 30 * MILLISECONDS_PER_MINUTE,
      action: (params, dispatch) => {
        dispatch(getCarbonIntensity());
      },
    },
    {
      refreshInterval: 24 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getPreviewMessages());
      },
    },
  ],
  {
    backgroundImg: CarbonIntensityBg,
    backgroundColor: 'rgb(57, 193, 210)',
    name: 'Carbon intensity',
  },
);

export const offPeakyPointsSlide = new Slide(
  OffPeakyPointsMain,
  {
    messagesSlider: MessagesSlider,
  },
  ['offPeakyLeagueData', 'offPeakyYesterdayValue'],
  [DASHBOARD_STORE_KEY.offPeakyLeague],
  [],
  {
    backgroundImg: OffPeakyBg,
    backgroundColor: 'rgb(53, 110, 183)',
    name: 'Off-peaky points',
  },
);

export const energyTipsSlide = new Slide(
  EnergyTips,
  {},
  [],
  [DASHBOARD_STORE_KEY.energyTips],
  [
    {
      refreshInterval: 24 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getTipsList());
      },
    },
  ],
  {
    backgroundImg: EnergyTipsListingBg,
    backgroundColor: 'rgb(48, 121, 135)',
    name: 'Energy tips',
  },
);

export const electricityUsageSlide = new Slide(
  ElectricityUsage,
  {
    messagesSlider: MessagesSlider,
  },
  [
    'currentWeather',
    'forecastWeather',
    'electricityLiveData',
    'electricityTodayData',
    'electricityTodayCost',
    'electricityLeagueData',
    'lastWeekHistoricalCost',
    'currentWeekHistoricalCost',
  ],
  [
    DASHBOARD_STORE_KEY.electricityLiveConsumption,
    DASHBOARD_STORE_KEY.electricityTodayConsumption,
    DASHBOARD_STORE_KEY.weather,
    DASHBOARD_STORE_KEY.electricityTodayCost,
    DASHBOARD_STORE_KEY.electricityLeague,
    DASHBOARD_STORE_KEY.electricityTariffs,
    DASHBOARD_STORE_KEY.lastWeekHistoricalCost,
    DASHBOARD_STORE_KEY.currentWeekHistoricalCost,
  ],
  [
    {
      refreshInterval: MILLISECONDS_PER_MINUTE,
      action: (params, dispatch) => {
        dispatch(getLiveConsumptionByElectricityType(ELECTRICITY, params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getElectricityTodayConsumption(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getElectricityTodayCostConsumption(params.schoolId));
      },
    },
    {
      refreshInterval: MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getCurrentWeather(params.schoolId));
        dispatch(getWeatherForecast(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getElectricityTariffs());
      },
    },
    {
      refreshInterval: 24 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getElectricityLastWeekHistoricalCost(params.schoolId));
      },
    },
    {
      refreshInterval: 30 * MILLISECONDS_PER_MINUTE,
      action: (params, dispatch) => {
        dispatch(getElectricityCurrentWeekHistoricalCost(params.schoolId));
      },
    },
  ],
  {
    backgroundImg: ElectricityBg,
    backgroundColor: 'rgb(229, 150, 114)',
    name: 'Electricity usage',
  },
);

export const getEnergyDashboardSlides = () => (
  [
    introSlide,
    carbonIntensitySlide,
    electricityUsageSlide,
    offPeakyPointsSlide,
    energyTipsSlide,
  ]
);
