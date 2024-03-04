import CarbonIntensityMain from '../../../components/EnergyScreenDashboard/v2/CarbonIntensity/CarbonIntensityMain';
import OffPeakyPointsMain from '../../../components/EnergyScreenDashboard/v2/OffPeakyPoints/OffPeakyPointsMain';
import EnergyFactsListingMain from '../../../components/EnergyScreenDashboard/v2/EnergyFacts/EnergyFactsListingMain';
import ElectricityUsage from '../../../components/EnergyScreenDashboard/v2/ElectricityUsage/ElectricityUsage';
import GasUsage from '../../../components/EnergyScreenDashboard/v2/GasUsage/GasUsage';

import MessagesSlider from '../../../components/EnergyScreenDashboard/v2/CommonComponents/MessagesSlider';
import Slide from '../../../components/EnergyScreenDashboard/v2/CommonComponents/Slide';

import getFactsList from '../../../actions/EnergyDashboard/factsActions';
import { getCashbackAmount } from '../../../actions/EnergyDashboard/cashbackActions';
import getOffPeakyLeagueData, { getYesterdayOffPeakyPoints } from '../../../actions/EnergyDashboard/offPeakyLeagueActions';
import getCarbonIntensity from '../../../actions/EnergyDashboard/carbonIntensityActions';
import {
  getCurrentWeather,
  getWeatherForecast,
} from '../../../actions/EnergyDashboard/newsWeatherDashboardAction';
import {
  getElectricityLeagueData,
  getGasLeagueData,
} from '../../../actions/EnergyDashboard/energyLeagueAction';
import {
  getLiveConsumptionByElectricityType,
  getLiveConsumptionByGasType,
} from '../../../actions/EnergyDashboard/liveConsumptionAction';

import {
  getElectricityYesterdayConsumption,
  getGasYesterdayConsumption,
  getElectricityYesterdayCostConsumption,
  getGasYesterdayCostConsumption,
} from '../../../actions/EnergyDashboard/yesterdayConsumptionAction';

import {
  getElectricityTariffs,
  getGasTariffs,
} from '../../../actions/EnergyDashboard/energyTariffsAction';

import getPreviewMessages from '../../../actions/EnergyDashboard/previewMessagesAction';

import reportOnActivity from '../../../actions/EnergyDashboard/auxiliaryActions';

import { ELECTRICITY, GAS } from '../../../constants/config';

import CarbonIntensityBg from '../../../images/carbon-intensity-big-bg.png';
import OffPeakyBg from '../../../images/Dashboard_V2_Arts/off_peaky_bg.svg';
import ElectricityBg from '../../../images/Dashboard_V2_Arts/electricity_bg.svg';
import GasBg from '../../../images/Dashboard_V2_Arts/gas_bg.svg';
import EnergyFactsListingBg from '../../../images/facts_no_data_bg.png';

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
      dispatch(reportOnActivity(ENERGY_DASHBOARD_VERSION.energyDashboardV2));
    },
  },
];

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
  ['offPeakyYesterdayValue'],
  [DASHBOARD_STORE_KEY.cashBack, DASHBOARD_STORE_KEY.offPeakyLeague],
  [
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getCashbackAmount(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getYesterdayOffPeakyPoints(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getOffPeakyLeagueData());
      },
    },
  ],
  {
    backgroundImg: OffPeakyBg,
    backgroundColor: 'rgb(53, 110, 183)',
    name: 'Off-peaky points',
  },
);

export const energyFactsSlide = new Slide(
  EnergyFactsListingMain,
  {},
  [],
  [DASHBOARD_STORE_KEY.energyFacts],
  [
    {
      refreshInterval: 24 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getFactsList(params.schoolId));
      },
    },
  ],
  {
    backgroundImg: EnergyFactsListingBg,
    backgroundColor: 'rgb(48, 121, 135)',
    name: 'Energy facts',
  },
);

export const electricityUsageSlide = new Slide(
  ElectricityUsage,
  {
    messagesSlider: MessagesSlider,
  },
  ['currentWeather', 'forecastWeather', 'electricityLiveData', 'electricityYesterdayData', 'electricityYesterdayCost'],
  [
    DASHBOARD_STORE_KEY.electricityLiveConsumption,
    DASHBOARD_STORE_KEY.electricityYesterdayConsumption,
    DASHBOARD_STORE_KEY.weather,
    DASHBOARD_STORE_KEY.electricityLeague,
    DASHBOARD_STORE_KEY.electricityYesterdayCost,
    DASHBOARD_STORE_KEY.electricityTariffs,
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
        dispatch(getElectricityYesterdayConsumption(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getElectricityYesterdayCostConsumption(params.schoolId));
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
        dispatch(getElectricityLeagueData());
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getElectricityTariffs());
      },
    },
  ],
  {
    backgroundImg: ElectricityBg,
    backgroundColor: 'rgb(229, 150, 114)',
    name: 'Electricity usage',
  },
);

export const gasUsageSlide = new Slide(
  GasUsage,
  {
    messagesSlider: MessagesSlider,
  },
  ['currentWeather', 'forecastWeather', 'gasLiveData', 'gasYesterdayData', 'gasYesterdayCost'],
  [
    DASHBOARD_STORE_KEY.gasLiveConsumption,
    DASHBOARD_STORE_KEY.gasYesterdayConsumption,
    DASHBOARD_STORE_KEY.weather,
    DASHBOARD_STORE_KEY.gasLeague,
    DASHBOARD_STORE_KEY.gasYesterdayCost,
    DASHBOARD_STORE_KEY.gasTariffs,
  ],
  [
    {
      refreshInterval: MILLISECONDS_PER_MINUTE,
      action: (params, dispatch) => {
        dispatch(getLiveConsumptionByGasType(GAS, params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getGasYesterdayConsumption(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getGasYesterdayCostConsumption(params.schoolId));
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getGasLeagueData());
      },
    },
    {
      refreshInterval: 3 * MILLISECONDS_PER_HOUR,
      action: (params, dispatch) => {
        dispatch(getGasTariffs());
      },
    },
  ],
  {
    backgroundImg: GasBg,
    backgroundColor: 'rgb(77, 209, 241)',
    name: 'Gas usage',
  },
);

export const getEnergyDashboardSlides = useGas => (
  useGas
    ? [
      carbonIntensitySlide,
      electricityUsageSlide,
      gasUsageSlide,
      offPeakyPointsSlide,
      energyFactsSlide,
    ]
    : [
      carbonIntensitySlide,
      electricityUsageSlide,
      offPeakyPointsSlide,
      energyFactsSlide,
    ]
);
