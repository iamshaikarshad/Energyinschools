import { combineReducers } from 'redux';

import comparisonQuotesReducer from './comparisonQuotesReducer';
import periodsConsumptionReducer from './periodsConsumptionReducer';

const tariffsComparisonReducer = combineReducers({
  quotesData: comparisonQuotesReducer,
  periodsConsumptionData: periodsConsumptionReducer,
});

export default tariffsComparisonReducer;
