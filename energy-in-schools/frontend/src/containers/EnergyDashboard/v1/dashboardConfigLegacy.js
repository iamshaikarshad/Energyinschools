import React from 'react';

import { isEqual, isNull, omitBy } from 'lodash';

import CartoonCharacterMain from '../../../components/EnergyScreenDashboard/v1/CartoonCharacter/CartoonCharacterLegacyMain';
import CartoonCharacterPreview from '../../../components/EnergyScreenDashboard/v1/CartoonCharacter/CartoonCharacterLegacyPreview';
import CarbonIntensityMain from '../../../components/EnergyScreenDashboard/v1/CarbonIntensity/CarbonIntensityLegacyMain';
import CarbonIntensityPreview from '../../../components/EnergyScreenDashboard/v1/CarbonIntensity/CarbonIntensityLegacyPreview';
import CashBackMain from '../../../components/EnergyScreenDashboard/v1/Cashback/CashBackLegacyMain';
import CashBackPreview from '../../../components/EnergyScreenDashboard/v1/Cashback/CashbackLegacyPreview';
import LiveConsumptionMain from '../../../components/EnergyScreenDashboard/v1/LiveConsumption/LiveConsumptionLegacyMain';
import LiveConsumptionPreview from '../../../components/EnergyScreenDashboard/v1/LiveConsumption/LiveConsumptionLegacyPreview';
import EnergyFactsListingMain from '../../../components/EnergyScreenDashboard/v1/EnergyFacts/EnergyFactsListingLegacyMain';
import EnergyFactsListingPreview from '../../../components/EnergyScreenDashboard/v1/EnergyFacts/EnergyFactsListingPreview';
import NewsWeatherMain from '../../../components/EnergyScreenDashboard/v1/NewsWeather/NewsWeatherLegacyMain';
import CurrentWeatherPreview from '../../../components/EnergyScreenDashboard/v1/NewsWeather/CurrentWeatherLegacyPreview';

import getFactsList from '../../../actions/EnergyDashboard/factsActions';
import { getCashbackAmount } from '../../../actions/EnergyDashboard/cashbackActions';
import getCarbonIntensity from '../../../actions/EnergyDashboard/carbonIntensityActions';
import getCartoonCharacterMood from '../../../actions/EnergyDashboard/cartoonCharacterAction';
import {
  getCurrentWeather,
  getNewsList,
  getWeatherForecast,
} from '../../../actions/EnergyDashboard/newsWeatherDashboardAction';
import {
  getLiveConsumptionByElectricityType,
  getLiveConsumptionByGasType,
} from '../../../actions/EnergyDashboard/liveConsumptionAction';
import { ELECTRICITY, GAS } from '../../../constants/config';

import reportOnActivity from '../../../actions/EnergyDashboard/auxiliaryActions';

import Loader from '../../../components/EnergyScreenDashboard/common/SlideLoad/Loader';
import LoadingFailed from '../../../components/EnergyScreenDashboard/common/SlideLoad/LoadingFailedLegacy';

import CartoonCharacterMainBg from '../../../images/energy_impact_bg.png';
import CartoonCharacterPreviewBg from '../../../images/cartoon_character_preview_bg.png';
import CarbonIntensityMainBg from '../../../images/carbon-intensity-big-bg.png';
import CashBackMainBg from '../../../images/cash_bg.png';
import CashBackPreviewBg from '../../../images/school-goal-prev-bg.png';
import LiveConsumptionMainBg from '../../../images/live-consumption-big-bg.png';
import LiveConsumptionPreviewBg from '../../../images/school-consumption-prev-bg.png';
import EnergyFactsListingMainBg from '../../../images/big-facts-without-cloud.png';
import EnergyFactsListingPreviewBg from '../../../images/small-facts-bg.png';
import WeatherNewsMainBg from '../../../images/no_weather_500.png';
import WeatherPreviewBg from '../../../images/weatherPreviewBg.png';

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
      dispatch(reportOnActivity(ENERGY_DASHBOARD_VERSION.energyDashboardLegacyV1));
    },
  },
];

/** Class representing a slide. */
class Slide {
  /**
   * Create a slide.
   * @param {object} mainComponent - component for main slide.
   * @param {object} previewComponent - component for preview slide.
   * @param {string} slideKeys - slide store keys.
   * @callback actionCallback
   * @param {actionCallback} invokeActions - the callback that dispatch the action.
   * @param refreshInterval - interval for dispatch the action.
   * @param mainLoadingFailedImage - background for main LoadingFailed component.
   * @param previewLoadingFailedImage - background for preview LoadingFailed component.
   */
  constructor(mainComponent, previewComponent, slideKeys, invokeActions, refreshInterval, mainLoadingFailedImage, previewLoadingFailedImage) {
    this.mainComponent = mainComponent;
    this.previewComponent = previewComponent;
    this.slideKeys = slideKeys;
    this.invokeActions = invokeActions;
    this.refreshInterval = refreshInterval;
    this.mainLoadingFailedImage = mainLoadingFailedImage;
    this.previewLoadingFailedImage = previewLoadingFailedImage;
  }

  /**
   * @param {object} parameters - additional parameters for rendering component
   * @param {object} status - dispatch status
   * @param mainLoadingFailedImage - background for main LoadingFailed component
   */
  renderMain(parameters, status, mainLoadingFailedImage) {
    /* eslint no-underscore-dangle: ["error", { "allow": ["_renderComponent"] }] */
    return Slide._renderComponent(this.mainComponent, parameters, status, mainLoadingFailedImage);
  }

  /**
   * @param {object} parameters - additional parameters for rendering component
   * @param {object} status - dispatch status
   * @param previewLoadingFailedImage - background for preview LoadingFailed component
   */
  renderPreview(parameters, status, previewLoadingFailedImage) {
    return Slide._renderComponent(this.previewComponent, parameters, status, previewLoadingFailedImage);
  }

  /**
   * @param {object} component - slide component
   * @param {object} parameters - additional parameters for rendering component
   * @param {object} loadingEnds - component loading status
   * @param {object} loadingFailedImage - component loading failed image
   */
  static _renderComponent(component, parameters, loadingEnds, loadingFailedImage) {
    const containsNull = !isEqual(parameters, omitBy(parameters, isNull));

    if (containsNull) {
      if (loadingEnds.status) {
        return React.createElement(Loader, {}, null);
      }
      return React.createElement(LoadingFailed, { backgroundImg: loadingFailedImage }, null);
    }

    return React.createElement(component, { ...parameters }, null);
  }
}

export const cartoonCharacterSlide = new Slide(
  CartoonCharacterMain,
  CartoonCharacterPreview,
  [DASHBOARD_STORE_KEY.cartoonCharacter],
  (params, dispatch) => {
    dispatch(getCartoonCharacterMood(params.schoolId));
  },
  10 * MILLISECONDS_PER_MINUTE,
  CartoonCharacterMainBg,
  CartoonCharacterPreviewBg,
);

export const carbonIntensitySlide = new Slide(
  CarbonIntensityMain,
  CarbonIntensityPreview,
  [DASHBOARD_STORE_KEY.carbonIntensity],
  (params, dispatch) => {
    dispatch(getCarbonIntensity());
  },
  30 * MILLISECONDS_PER_MINUTE,
  CarbonIntensityMainBg,
  WeatherPreviewBg,
);

export const cashBackSlide = new Slide(
  CashBackMain,
  CashBackPreview,
  [DASHBOARD_STORE_KEY.cashBack],
  (params, dispatch) => {
    dispatch(getCashbackAmount(params.schoolId));
  },
  MILLISECONDS_PER_HOUR,
  CashBackMainBg,
  CashBackPreviewBg,
);

export const liveConsumptionSlide = new Slide(
  LiveConsumptionMain,
  LiveConsumptionPreview,
  [
    DASHBOARD_STORE_KEY.electricityLiveConsumption,
    DASHBOARD_STORE_KEY.gasLiveConsumption,
  ],
  (params, dispatch) => {
    dispatch(getLiveConsumptionByElectricityType(ELECTRICITY, params.schoolId));
    dispatch(getLiveConsumptionByGasType(GAS, params.schoolId));
  },
  MILLISECONDS_PER_MINUTE,
  LiveConsumptionMainBg,
  LiveConsumptionPreviewBg,
);

export const energyFactsSlide = new Slide(
  EnergyFactsListingMain,
  EnergyFactsListingPreview,
  [DASHBOARD_STORE_KEY.energyFacts],
  (params, dispatch) => {
    dispatch(getFactsList(params.schoolId));
  },
  24 * MILLISECONDS_PER_HOUR,
  EnergyFactsListingMainBg,
  EnergyFactsListingPreviewBg,
);

export const newsWeatherSlide = new Slide(
  NewsWeatherMain,
  CurrentWeatherPreview,
  [
    DASHBOARD_STORE_KEY.weather,
    DASHBOARD_STORE_KEY.news,
  ],
  (params, dispatch) => {
    dispatch(getCurrentWeather(params.schoolId));
    dispatch(getWeatherForecast(params.schoolId));
    dispatch(getNewsList());
  },
  MILLISECONDS_PER_HOUR,
  WeatherNewsMainBg,
  WeatherPreviewBg,
);

export const ENERGY_DASHBOARD_CONFIG = [
  cartoonCharacterSlide,
  carbonIntensitySlide,
  cashBackSlide,
  liveConsumptionSlide,
  energyFactsSlide,
  newsWeatherSlide,
];
