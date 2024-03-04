import * as types from '../constants/actionTypes';
import { USAGE_STATISTIC_CONFIGS } from '../constants/config';
import { processHistoricalData } from '../components/UsageStatistic/utils';

const instantDataStateKey = USAGE_STATISTIC_CONFIGS.microbit.instantDataStateKey;

const initialState = {
  [instantDataStateKey]: {},
  historicalData: [],
  isHistoricalDataFiltered: false,
};

export default function microbitUsageReducer(state = initialState, action) {
  switch (action.type) {
    case types.MICROBIT_STATISTIC_DATA.liveByMeter.success:
    case types.MICROBIT_STATISTIC_DATA.liveByMeter.failed:
      return {
        ...state,
        [instantDataStateKey]: {
          ...state[instantDataStateKey],
          [action.meterId]: action.data,
        },
      };
    case types.MICROBIT_STATISTIC_DATA.historyByMeter.success: {
      const { filteredInformativeItemsCount, data } = processHistoricalData(action.data);
      const isFiltered = filteredInformativeItemsCount > 0;
      return {
        ...state,
        historicalData: data,
        isHistoricalDataFiltered: isFiltered,
      };
    }
    case types.MICROBIT_STATISTIC_DATA.historyByMeter.failed:
      return {
        ...state,
        historicalData: [],
        isHistoricalDataFiltered: false,
      };
    default:
      return state;
  }
}
