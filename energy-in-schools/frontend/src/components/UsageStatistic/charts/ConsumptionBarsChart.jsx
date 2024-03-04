import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import ShapedVerticalBar from './ShapedVerticalBar';
import { CHART_COMPONENT_DATA_KEY } from '../constants';
import { UNIT, UNIT_TO_LABEL_MAP } from '../../../constants/config';

const MAX_BARS_COUNT_TO_DISPLAY = 360;

const ConsumptionBarsChart = (props) => {
  const {
    data, unitLabel, tooltipLabelFormat, isComparison, showAlwaysOn, alwaysOnValue, onBarClick, tooltipDateFormatter, xAxisTickFormatter,
  } = props;
  // todo: make it better! this is a hack for prevent rendering chart with wrong and very long data
  const chartData = (data || []).length <= MAX_BARS_COUNT_TO_DISPLAY ? data : [];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        width={800}
        height={300}
        data={chartData}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickFormatter={xAxisTickFormatter}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis
          tickFormatter={tick => (unitLabel === UNIT_TO_LABEL_MAP[UNIT.poundSterling] ? `${unitLabel}${tick}` : `${tick} ${unitLabel}`)}
          axisLine={false}
        />
        <Tooltip
          content={
            <ChartTooltip unit={unitLabel} labelFormat={tooltipLabelFormat} dateFormatter={tooltipDateFormatter} />
          }
        />
        {isComparison ? (
          <Area
            type="monotone"
            dataKey={CHART_COMPONENT_DATA_KEY.cmpValue}
            fill="#00bcd4"
            fillOpacity={0.1}
            stroke="#00bcd4"
            strokeOpacity={0.6}
            dot={{
              stroke: 'rgb(0, 188, 212)', fill: 'rgb(0, 188, 212)', fillOpacity: 1, r: 2,
            }}
          />
        ) : null}
        {showAlwaysOn && (
          <ReferenceLine
            inFront
            y={alwaysOnValue}
            stroke="red"
            strokeDasharray="10 10"
            strokeWidth="2"
          />
        )
        }
        <Bar
          dataKey={CHART_COMPONENT_DATA_KEY.value}
          maxBarSize={50}
          shape={(
            <ShapedVerticalBar fill={!isComparison ? 'rgb(0, 188, 212)' : 'rgba(0, 188, 212, 0.6)'} />
          )}
          onClick={onBarClick}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

ConsumptionBarsChart.propTypes = {
  data: PropTypes.array.isRequired,
  unitLabel: PropTypes.string.isRequired,
  isComparison: PropTypes.bool.isRequired,
  showAlwaysOn: PropTypes.bool.isRequired,
  tooltipLabelFormat: PropTypes.string.isRequired,
  alwaysOnValue: PropTypes.number,
  onBarClick: PropTypes.func,
  tooltipDateFormatter: PropTypes.func.isRequired,
  xAxisTickFormatter: PropTypes.func,
};

ConsumptionBarsChart.defaultProps = {
  alwaysOnValue: 0,
  xAxisTickFormatter: undefined,
  onBarClick: () => {},
};

export default memo(ConsumptionBarsChart);
