import * as types from '../constants/actionTypes';

const initialState = {
  schoolTotal: null,
  schoolLiveConsumption: null,
  totalByMeters: {},
  historicalData: [],
  alwaysOnValue: 0,
};

export default function energyUsageReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DATA.totalByLocation.success:
    case types.ENERGY_DATA.totalByLocation.failed:
      return {
        ...state,
        schoolTotal: action.data,
      };
    case types.ENERGY_DATA.liveByLocation.success:
    case types.ENERGY_DATA.liveByLocation.failed:
      return {
        ...state,
        schoolLiveConsumption: action.data,
      };
    case types.ENERGY_DATA.totalByMeter.success:
    case types.ENERGY_DATA.totalByMeter.failed:
    case types.ENERGY_DATA.liveByMeter.success:
    case types.ENERGY_DATA.liveByMeter.failed:
      return {
        ...state,
        totalByMeters: {
          ...state.totalByMeters,
          [action.meterId]: action.data,
        },
      };
    case types.ENERGY_DATA.historyByMeter.success:
    case types.ENERGY_DATA.historyByLocation.success:
      return {
        ...state,
        historicalData: action.data,
      };
    case types.ENERGY_DATA.historyByLocation.failed:
    case types.ENERGY_DATA.historyByMeter.failed:
      return {
        ...state,
        historicalData: [],
      };
    case types.ENERGY_DATA.alwaysOn.success:
      return {
        ...state,
        alwaysOnValue: action.data / 1000, // data is in watt hour
      };
    case types.ENERGY_TARIFF_DATA.currentTariffs.success:
    case types.ENERGY_TARIFF_DATA.currentTariffs.failed:
      return {
        ...state,
        currentTariffs: action.data,
      };
    case types.ENERGY_DATA.yesterdayGasConsumptionByLocation.success:
    case types.ENERGY_DATA.yesterdayGasConsumptionByLocation.failed:
      return {
        ...state,
        yesterdayGasUsage: action.data,
      };
    default:
      return state;
  }
}
