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
    case types.TEMPERATURE_STATISTIC_DATA.totalByLocation.success:
    case types.TEMPERATURE_STATISTIC_DATA.totalByLocation.failed:
      return {
        ...state,
        schoolTotal: action.data,
      };
    case types.TEMPERATURE_STATISTIC_DATA.liveByLocation.success:
    case types.TEMPERATURE_STATISTIC_DATA.liveByLocation.failed:
      return {
        ...state,
        schoolLiveConsumption: action.data,
      };
    case types.TEMPERATURE_STATISTIC_DATA.totalByMeter.success:
    case types.TEMPERATURE_STATISTIC_DATA.totalByMeter.failed:
    case types.TEMPERATURE_STATISTIC_DATA.liveByMeter.success:
    case types.TEMPERATURE_STATISTIC_DATA.liveByMeter.failed:
      return {
        ...state,
        totalByMeters: {
          ...state.totalByMeters,
          [action.meterId]: action.data,
        },
      };
    case types.TEMPERATURE_STATISTIC_DATA.historyByMeter.success:
    case types.TEMPERATURE_STATISTIC_DATA.historyByLocation.success:
      return {
        ...state,
        historicalData: action.data,
      };
    case types.TEMPERATURE_STATISTIC_DATA.historyByLocation.failed:
    case types.TEMPERATURE_STATISTIC_DATA.historyByMeter.failed:
      return {
        ...state,
        historicalData: [],
      };
    default:
      return state;
  }
}
