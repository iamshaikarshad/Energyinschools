import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import dialogs from './dialogsReducer';
import users from './usersReducer';
import schools from './schoolsReducer';
import openSchools from './openSchoolsReducer';
import hubs from './hubsReducer';
import meters from './metersReducer';
import providers from './providersReducer';
import devices from './devicesReducer';
import facts from './EnergyDashboard/factsReducer';
import newsWeather from './newsWeatherReducer';
import energyUsage from './energyUsageReducer';
import temperatureStatistic from './temperatureStatisticReducer';
import microbitStatistic from './microbitStatisticReducer';
import carbonIntensity from './EnergyDashboard/carbonIntensityReducer';
import cashback from './EnergyDashboard/cashbackReducer';
import variables from './variablesReducer';
import historicalData from './historicalDataReducer';
import alerts from './alertsReducer';
import energyAlertsEdit from './energyAlertsEditReducer';
import floorsMapsData from './FloorsMaps/floorsMapsDataReducer';
import feedbacks from './feedbacksReducer';
import lessonsCategories from './lessonsCategoriesReducer';
import lessonsGroups from './lessonsGroupsReducer';
import lessons from './lessonsReducer';
import manuals from './manualsReducer';
import manual from './manualReducer';
import categories from './categoriesReducer';
import smartThingsSensors from './smartThingsSensorsReducer';
import smartThingsLiveBySensor from './smartThingsLiveBySensorReducer';
import activeCallsReducer from './activeCallsReducer';
import energyDashboard from './EnergyDashboard/energyDashboardReducer';
import energyResources from './energyResourcesReducer';
import energyMetersBillingData from './energyMetersBillingInfoReducer';
import suppliers from './suppliersReducer';
import switches from './tariffSwitchesReducer';
import tariffsComparisonData from './TariffsComparison/tariffsComparisonReducer';
import energyManagerDashboardData from './EnergyManagerDashboard/energyManagerDashboardReducer';
import schoolsMonitoringData from './SchoolsMonitoring/schoolsMonitoringReducer';

const rootReducer = history => combineReducers({
  dialogs,
  users,
  schools,
  openSchools,
  hubs,
  meters,
  providers,
  devices,
  facts,
  newsWeather,
  energyUsage,
  temperatureStatistic,
  microbitStatistic,
  carbonIntensity,
  cashback,
  alerts,
  energyAlertsEdit,
  variables,
  historicalData,
  floorsMapsData,
  feedbacks,
  lessonsCategories,
  lessonsGroups,
  lessons,
  manuals,
  manual,
  categories,
  smartThingsSensors,
  smartThingsLiveBySensor,
  energyDashboard,
  energyResources,
  energyMetersBillingData,
  suppliers,
  switches,
  tariffsComparisonData,
  energyManagerDashboardData,
  schoolsMonitoringData,
  callsCounter: activeCallsReducer,
  router: connectRouter(history),
});

export default rootReducer;
