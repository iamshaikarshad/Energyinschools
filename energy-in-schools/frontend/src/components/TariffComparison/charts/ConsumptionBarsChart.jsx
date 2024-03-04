import React from 'react';
import PropTypes from 'prop-types';

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import BarCell from './BarCell';
import ChartTooltip from './ChartTooltip';

const ConsumptionBarsChart = (props) => {
  const {
    data, xDataKey, yDataKey, unitLabel, labelFormat, setCellColor, tooltipLabelFormatter, xTickFormatter,
  } = props;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        width={800}
        height={300}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={xDataKey}
          axisLine={false}
          tickFormatter={tick => xTickFormatter(tick, labelFormat)}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis
          tickFormatter={tick => `${tick} ${unitLabel}`}
          axisLine={false}
          width={64}
        />
        <Tooltip content={
          <ChartTooltip unit={unitLabel} labelFormatter={tooltipLabelFormatter} />
          }
        />
        <Bar dataKey={yDataKey} maxBarSize={50} shape={<BarCell />}>
          {
            data.map((entry, index) => (
              <Cell key={`cell_${index}`} fill={setCellColor(entry)} /> // eslint-disable-line react/no-array-index-key
            ))
          }
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

ConsumptionBarsChart.propTypes = {
  data: PropTypes.array,
  xDataKey: PropTypes.string,
  yDataKey: PropTypes.string,
  unitLabel: PropTypes.string,
  labelFormat: PropTypes.string,
  setCellColor: PropTypes.func,
  xTickFormatter: PropTypes.func,
  tooltipLabelFormatter: PropTypes.func,
};

ConsumptionBarsChart.defaultProps = {
  data: [],
  xDataKey: 'time',
  yDataKey: 'value',
  labelFormat: 'HH:mm',
  unitLabel: '',
  setCellColor: () => {},
  xTickFormatter: str => str,
  tooltipLabelFormatter: () => '',
};

export default ConsumptionBarsChart;
