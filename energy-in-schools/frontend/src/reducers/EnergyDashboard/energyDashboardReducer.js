import { combineReducers } from 'redux';
import factsReducer from './factsReducer';
import carbonIntensityReducer from './carbonIntensityReducer';
import cashBackReducer from './cashbackReducer';
import cartoonCharacterReducer from './cartoonCharacterReducer';
import electricityLiveConsumptionReducer from './electricityLiveConsumptionReducer';
import gasLiveConsumptionReducer from './gasLiveConsumptionReducer';
import gasYesterdayConsumptionReducer from './gasYesterdayConsumptionReducer';
import electricityTodayConsumptionReducer from './electricityTodayConsumptionReducer';
import electricityYesterdayConsumptionReducer from './electricityYesterdayConsumptionReducer';
import weatherDashboardReducer from './weatherDashboardReducer';
import newsDashboardReducer from './newsDashboardReducer';
import loadingStatusReducer from './loadingStatusReducer';
import offPeakyLeagueReducer from './offPeakyLeagueReducer';
import electricityLeagueReducer from './electricityLeagueReducer';
import gasLeagueReducer from './gasLeagueReducer';
import electricityTodayCostReducer from './electricityTodayCostReducer';
import electricityYesterdayCostReducer from './electricityYesterdayCostReducer';
import gasYesterdayCostReducer from './gasYesterdayCostReducer';
import electricityTariffsReducer from './electricityTariffsReducer';
import gasTariffsReducer from './gasTariffsReducer';
import schoolInformationReducer from './schoolInformationReducer';
import energyTipsReducer from './energyTipsReducer';
import lastWeekHistoricalCostReducer from './lastWeekHistoricalCostReducer';
import currentWeekHistoricalCostReducer from './currentWeekHistoricalCostReducer';

import { DASHBOARD_STORE_KEY } from '../../components/EnergyScreenDashboard/constants';

const energyDashboardReducer = combineReducers({
  [DASHBOARD_STORE_KEY.energyFacts]: factsReducer,
  [DASHBOARD_STORE_KEY.weather]: weatherDashboardReducer,
  [DASHBOARD_STORE_KEY.news]: newsDashboardReducer,
  [DASHBOARD_STORE_KEY.carbonIntensity]: carbonIntensityReducer,
  [DASHBOARD_STORE_KEY.cashBack]: cashBackReducer,
  [DASHBOARD_STORE_KEY.cartoonCharacter]: cartoonCharacterReducer,
  [DASHBOARD_STORE_KEY.electricityLiveConsumption]: electricityLiveConsumptionReducer,
  [DASHBOARD_STORE_KEY.gasLiveConsumption]: gasLiveConsumptionReducer,
  [DASHBOARD_STORE_KEY.gasYesterdayConsumption]: gasYesterdayConsumptionReducer,
  [DASHBOARD_STORE_KEY.electricityTodayConsumption]: electricityTodayConsumptionReducer,
  [DASHBOARD_STORE_KEY.electricityYesterdayConsumption]: electricityYesterdayConsumptionReducer,
  [DASHBOARD_STORE_KEY.offPeakyLeague]: offPeakyLeagueReducer,
  [DASHBOARD_STORE_KEY.electricityLeague]: electricityLeagueReducer,
  [DASHBOARD_STORE_KEY.gasLeague]: gasLeagueReducer,
  [DASHBOARD_STORE_KEY.electricityTodayCost]: electricityTodayCostReducer,
  [DASHBOARD_STORE_KEY.electricityYesterdayCost]: electricityYesterdayCostReducer,
  [DASHBOARD_STORE_KEY.gasYesterdayCost]: gasYesterdayCostReducer,
  [DASHBOARD_STORE_KEY.electricityTariffs]: electricityTariffsReducer,
  [DASHBOARD_STORE_KEY.gasTariffs]: gasTariffsReducer,
  [DASHBOARD_STORE_KEY.schoolInformation]: schoolInformationReducer,
  [DASHBOARD_STORE_KEY.energyTips]: energyTipsReducer,
  [DASHBOARD_STORE_KEY.lastWeekHistoricalCost]: lastWeekHistoricalCostReducer,
  [DASHBOARD_STORE_KEY.currentWeekHistoricalCost]: currentWeekHistoricalCostReducer,
  loadingEnds: loadingStatusReducer,
});

export default energyDashboardReducer;
