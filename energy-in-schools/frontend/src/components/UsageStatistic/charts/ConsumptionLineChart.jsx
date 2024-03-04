import React, { memo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  Area, Brush, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { getNiceTickValues } from 'recharts-scale';

import ChartTooltip from './ChartTooltip';
import {
  MAX_POINTS_COUNT_TO_DISPLAY_BRUSH,
  MIN_POINTS_COUNT_TO_DISPLAY_BRUSH,
  CHART_COMPONENT_DATA_KEY,
} from '../constants';
import { UNIT, UNIT_TO_LABEL_MAP } from '../../../constants/config';

const minValue = 0;
const tickCount = 5;
const allowDecimals = true;
const highlightColor = 'rgba(0, 188, 212, 0.2)';
const highlightStartTime = 16;
const highlightEndTime = 19;

const getDataMax = (dataset, isComparison) => {
  const valueMax = Math.max(...dataset.map(item => item.value));
  if (!isComparison) {
    return Math.max(0, valueMax);
  }
  const cmpValueMax = Math.max(...dataset.map(item => item[CHART_COMPONENT_DATA_KEY.cmpKey]));
  return Math.max(0, valueMax, cmpValueMax);
};

const getHighlightValue = (time, value, highlightTickValueGetter) => {
  const hour = highlightTickValueGetter(time).hour();
  const needHighlight = hour >= highlightStartTime && hour < highlightEndTime;
  return needHighlight ? value : null;
};

const getMaxTickValue = (min, max, tCount, decimals) => {
  const ticks = getNiceTickValues([min, max], tCount, decimals);
  if (ticks && ticks.length) {
    return ticks[ticks.length - 1];
  }
  return max;
};

const getExtendedDataWithHighlight = (dataset, highlightValue, highlightTickValueGetter) => (
  dataset.map(item => (
    Object.assign(
      {},
      item,
      { [CHART_COMPONENT_DATA_KEY.highlightValue]: getHighlightValue(item.time, highlightValue, highlightTickValueGetter) },
    )
  ))
);

const ConsumptionLineChart = (props) => {
  const {
    data, unitLabel, isComparison, highlight, connectNulls, tooltipDateFormatter, xAxisTickFormatter, highlightTickValueGetter,
  } = props;

  const highlightValue = highlight ? getMaxTickValue(minValue, getDataMax(data, isComparison), tickCount, allowDecimals) : null;

  const { length: dataLength } = data || [];

  const showBrush = (dataLength >= MIN_POINTS_COUNT_TO_DISPLAY_BRUSH && dataLength <= MAX_POINTS_COUNT_TO_DISPLAY_BRUSH);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        width={600}
        height={300}
        data={highlight ? getExtendedDataWithHighlight(data, highlightValue, highlightTickValueGetter) : data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <XAxis
          dataKey="time"
          axisLine={false}
          tickFormatter={xAxisTickFormatter}
          padding={{ left: 40, right: 20 }}
        />
        <YAxis
          tickFormatter={tick => (unitLabel === UNIT_TO_LABEL_MAP[UNIT.poundSterling] ? `${unitLabel}${tick}` : `${tick} ${unitLabel}`)}
          axisLine={false}
          tickCount={tickCount}
          domain={[minValue, 'auto']}
          allowDecimals={allowDecimals}
        />
        {showBrush && (
          <Brush
            x={70}
            dataKey="time"
            height={30}
            stroke="#00bcd4"
            tickFormatter={xAxisTickFormatter}
            travellerWidth={10}
          />
        )}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip content={<ChartTooltip unit={unitLabel} dateFormatter={tooltipDateFormatter} />} />
        <Line
          type="linear"
          dataKey={CHART_COMPONENT_DATA_KEY.value}
          stroke="#00bcd4"
          fill="#00bcd4"
          strokeWidth={4}
          connectNulls={connectNulls}
          dot={{
            stroke: 'rgb(0, 188, 212)', fill: 'rgb(0, 188, 212)', fillOpacity: 1, r: 1,
          }}
          // important: need disable animation (workaround) in order to see discrete points. See https://github.com/recharts/recharts/issues/1426
          isAnimationActive={false}
        />
        {isComparison ? (
          <Line
            type="linear"
            dataKey={CHART_COMPONENT_DATA_KEY.cmpValue}
            stroke="#00bcd4"
            fill="#00bcd4"
            strokeOpacity={0.6}
            strokeWidth={4}
            dot={{
              stroke: 'rgba(0, 188, 212, 0.6)', fill: 'rgba(0, 188, 212, 0.6)', fillOpacity: 1, r: 1,
            }}
            isAnimationActive={false}
          />
        ) : null}
        {highlight ? (
          <Area
            type="monotone"
            dataKey={CHART_COMPONENT_DATA_KEY.highlightValue}
            fill={highlightColor}
            stroke="none"
            fillOpacity={0.5}
            dot={false}
          />
        ) : null
        }
      </ComposedChart>
    </ResponsiveContainer>
  );
};

ConsumptionLineChart.propTypes = {
  data: PropTypes.array.isRequired,
  unitLabel: PropTypes.string.isRequired,
  isComparison: PropTypes.bool,
  highlight: PropTypes.bool,
  connectNulls: PropTypes.bool,
  tooltipDateFormatter: PropTypes.func.isRequired,
  xAxisTickFormatter: PropTypes.func,
  highlightTickValueGetter: PropTypes.func,
};

ConsumptionLineChart.defaultProps = {
  isComparison: false,
  highlight: true,
  connectNulls: false,
  xAxisTickFormatter: undefined,
  highlightTickValueGetter: value => moment(value),
};


export default memo(ConsumptionLineChart);
