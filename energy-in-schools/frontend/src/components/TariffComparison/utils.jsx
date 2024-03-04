import React, { Fragment } from 'react';
import moment from 'moment';

import { capitalize, isNil, isEmpty } from 'lodash';

import {
  ENERGY_METER_INFO_KEY, METER_TYPE_LABEL, ADDITIONAL_ENERGY_METER_INFO_KEY, MUG_METER_RATE_TYPE,
} from '../SchoolRegistration/constants';

const getHoursByColorMap = (data, color) => (
  data.reduce((res, range) => {
    const start = parseInt(range[0], 10);
    const end = parseInt(range[1], 10);

    for (let i = start; i < end; i += 1) {
      res[i] = color;
    }
    return res;
  }, {})
);

export const getDayColorMap = (map, colorMap) => (
  Object.keys(map).reduce((res, colorKey) => (
    {
      ...res,
      ...getHoursByColorMap(map[colorKey], colorMap[colorKey]),
    }
  ), {})
);

export const entryColorSetter = (map, dataKey) => entry => map[entry[dataKey]];

export const transformIntegerToHour = (value, hourFormat = 'HH:mm') => moment(value, 'HH').format(hourFormat);

export const tooltipLabelFormatter = (value) => {
  const rangeStartHour = transformIntegerToHour(value);
  const rangeEndHour = transformIntegerToHour(value + 1);
  return `${rangeStartHour} - ${rangeEndHour}`;
};

export const convertPeriodConsumptionDataToLocalTime = data => (
  {
    ...data,
    values: data.values.map(valueData => (
      {
        ...valueData,
        hour: moment.utc(valueData.hour, 'HH').local().hour(),
      }
    )).sort((a, b) => a.hour - b.hour),
  }
);

export const getMeterInfoDetails = (meterInfo, keysToInclude, keyLabelMap) => {
  if (isEmpty(keysToInclude)) return [];
  const { result_id: resultId } = meterInfo;
  return keysToInclude.map((key) => {
    const label = keyLabelMap[key];
    let value;
    switch (key) {
      case ADDITIONAL_ENERGY_METER_INFO_KEY.unit_rate: {
        const meterRateTypeIsSingle = meterInfo[ENERGY_METER_INFO_KEY.unit_rate_type] === MUG_METER_RATE_TYPE.SINGLE;
        value = (
          <Fragment>
            {meterInfo[ENERGY_METER_INFO_KEY.consumption_by_rates].map((ratePeriod, index) => {
              const unitRatePeriod = !meterRateTypeIsSingle
                ? `${ratePeriod.unit_rate_period}: ` : '';
              const unitRate = !meterRateTypeIsSingle
                ? `${ratePeriod.unit_rate}, ` : ratePeriod.unit_rate;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`additional_meter_info_unit_rate_${resultId}_${index}`} style={{ display: 'block' }}>
                  {unitRatePeriod}{unitRate}
                </span>
              );
            })}
          </Fragment>
        );
        break;
      }
      case ADDITIONAL_ENERGY_METER_INFO_KEY.consumption: {
        const meterRateTypeIsSingle = meterInfo[ENERGY_METER_INFO_KEY.unit_rate_type] === MUG_METER_RATE_TYPE.SINGLE;
        value = (
          <Fragment>
            {meterInfo[ENERGY_METER_INFO_KEY.consumption_by_rates].map((ratePeriod, index) => {
              const unitRatePeriod = !meterRateTypeIsSingle
                ? `${ratePeriod.unit_rate_period}: ` : '';
              const consumption = !meterRateTypeIsSingle
                ? `${ratePeriod.consumption}, ` : ratePeriod.consumption;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`additional_meter_info_consumption_${resultId}_${index}`} style={{ display: 'block' }}>
                  {unitRatePeriod}{consumption}
                </span>
              );
            })}
          </Fragment>
        );
        break;
      }
      default:
        value = meterInfo[key];
        break;
    }
    return { key, label, value };
  });
};

export const meterDetailFormatValueFunc = (key, value) => {
  if (isNil(value)) return 'N/A';
  switch (key) {
    case ENERGY_METER_INFO_KEY.meter_type:
      return METER_TYPE_LABEL[value] || capitalize(value);
    case ADDITIONAL_ENERGY_METER_INFO_KEY.unit_rate:
    case ADDITIONAL_ENERGY_METER_INFO_KEY.consumption:
      return value;
    default:
      return capitalize(value);
  }
};
