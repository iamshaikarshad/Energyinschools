import moment from 'moment';

import { isNil } from 'lodash';

import {
  HISTORICAL_DATA_TIME_RESOLUTION, HISTORICAL_DATA_UPDATE_TIME_INTERVAL, MAX_HISTORICAL_DATA_LENGTH_NOT_TO_FILTER,
} from './constants';

export const getLocalTimeFromUTC = (timeStr, utcOffset) => {
  if (!isNil(utcOffset)) return moment.utc(timeStr).utcOffset(utcOffset);
  return moment(timeStr);
};

const formatHourlyDateRange = (startTime, endTime) => {
  if (endTime.hour() >= startTime.hour()) {
    return `${startTime.format('MMMM Do, HH:mm')} - ${endTime.format('HH:mm')}`;
  }
  return `${startTime.format('MMMM Do HH:mm')} - ${endTime.format('MMMM Do HH:mm')}`;
};

export const tooltipDateFormatter = (comparisonPeriodOffset, selectedPeriod, utcOffset) => (timeStr, labelFormat) => {
  const localTime = getLocalTimeFromUTC(timeStr, utcOffset);
  const result = {
    mainDataDateLabel: localTime.format(labelFormat),
    comparisonDataDateLabel: '',
  };
  if (comparisonPeriodOffset > 0) {
    const comparisonDate = localTime.clone().subtract(comparisonPeriodOffset, selectedPeriod);
    result.comparisonDataDateLabel = comparisonDate.format(labelFormat);
  }
  return result;
};

export const hourlyRangeTooltipDateFormatter = (comparisonPeriodOffset, selectedPeriod, utcOffset) => (timeStr) => {
  const result = { mainDataDateLabel: '', comparisonDataDateLabel: '' };
  const startDate = getLocalTimeFromUTC(timeStr, utcOffset);
  const dateNow = moment();
  const hoursDiff = dateNow.diff(startDate, 'hours');
  const { timeValue, timeUnit } = hoursDiff !== 0 ? HISTORICAL_DATA_TIME_RESOLUTION : HISTORICAL_DATA_UPDATE_TIME_INTERVAL;
  const endDate = startDate.clone().add(timeValue, timeUnit);

  result.mainDataDateLabel = formatHourlyDateRange(startDate, endDate);

  if (comparisonPeriodOffset > 0) {
    const comparisonStartDate = startDate.clone().subtract(comparisonPeriodOffset, selectedPeriod);
    const comparisonEndDate = comparisonStartDate.clone().add(HISTORICAL_DATA_TIME_RESOLUTION.timeValue, HISTORICAL_DATA_TIME_RESOLUTION.timeUnit);
    result.comparisonDataDateLabel = formatHourlyDateRange(comparisonStartDate, comparisonEndDate);
  }
  return result;
};

export const utcToLocalTimeFormatter = (format, utcOffset) => (timeStr) => {
  const localTime = getLocalTimeFromUTC(timeStr, utcOffset);
  return localTime.format(format);
};

export const isValidDate = date => (!isNil(date) && moment.isMoment(date) && date.isValid());

const isInformativeHistoricalDataItem = item => (!isNil(item) && !isNil(item.value));

// make sure the data length is greater than 3
// skipped extra checks to improve performance
export const filterHistoricalData = (data = []) => {
  const { length } = data;
  const filteredData = [data[0]];
  // 3 is minimal step we may assess density of items with non-nullable values(further "non-nullable" items)
  const step = Math.max(Math.ceil(data.length / MAX_HISTORICAL_DATA_LENGTH_NOT_TO_FILTER), 3);
  let filteredInformativeItemsCount = 0;
  let isInformativePrevElem = isInformativeHistoricalDataItem(filteredData[0]);
  let informativeItemsCount = isInformativePrevElem ? 1 : 0;
  let index = 1;
  while (index < length - 1) {
    const elem = data[index];
    const indexStepRemainder = index % step;
    const isMultipleToStep = indexStepRemainder === 0;
    const isInformativeCurrElem = isInformativeHistoricalDataItem(elem);
    if (isMultipleToStep) {
      filteredData.push(elem);
    } else if (isInformativeCurrElem) {
      const isInformativeNextElem = isInformativeHistoricalDataItem(data[index + 1]);
      if (
        /* assess density of "non-nullable" items in curr elem neighborhood. */
        (informativeItemsCount >= Math.ceil(index / step))
        && (
          /* Use only the first condition to decrease the count of deleted "non-nullable" items */
          (isInformativePrevElem && isInformativeNextElem)
          || (isInformativePrevElem && isInformativeHistoricalDataItem(data[index + step - indexStepRemainder]))
          || (isInformativeNextElem && isInformativeHistoricalDataItem(data[index - indexStepRemainder]))
        )
      ) {
        filteredInformativeItemsCount += 1;
      } else {
        filteredData.push(elem);
      }
    }
    informativeItemsCount += Number(isInformativeCurrElem);
    isInformativePrevElem = isInformativeCurrElem;
    index += 1;
  }
  filteredData.push(data[length - 1]);
  return {
    data: filteredData,
    filteredInformativeItemsCount,
  };
};

export const processHistoricalData = (data = []) => {
  const { length } = data;
  if (length <= MAX_HISTORICAL_DATA_LENGTH_NOT_TO_FILTER) {
    return {
      data,
      filteredInformativeItemsCount: 0,
    };
  }
  return filterHistoricalData(data);
};
