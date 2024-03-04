import React from 'react';
import PropTypes from 'prop-types';

import { range } from 'lodash';

import { withStyles } from '@material-ui/core/styles';

import { scaleLinear } from '@devexpress/dx-chart-core';
import { ArgumentScale, ValueScale } from '@devexpress/dx-react-chart';
import {
  ArgumentAxis,
  ValueAxis,
  Chart,
  Legend,
  Title,
  LineSeries,
} from '@devexpress/dx-react-chart-material-ui';

import * as ChartComponents from './chartPluginComponents';

import bear from '../../../../images/omar_think.svg';
import penguin from '../../../../images/Dashboard_V2_Arts/flippers_middle.svg';
import { MIDDAY_OF } from '../../constants';

const styles = () => ({
  chart: {
    width: '100%',
    height: '100% !important',
  },
});

class ElectricityUsageChart extends React.PureComponent {
  constructor(props) {
    super(props);

    this.scaleX = scaleLinear();
    this.scaleY = scaleLinear();

    this.scaleX.ticks = () => [
      MIDDAY_OF.Monday, MIDDAY_OF.Tuesday, MIDDAY_OF.Wednesday, MIDDAY_OF.Thursday, MIDDAY_OF.Friday,
    ];

    this.step = Math.floor((props.maxValue / 5) / 10) * 10 || 10;
    this.scaleY.ticks = () => range(0, this.step * 6 + 1, this.step);
  }

  modifyDomain = () => [0, this.step * 6 + 1];

  render() {
    const { classes, data, currentTime } = this.props;

    data[currentTime].bear = data[currentTime].lastWeekValue;
    data[currentTime].penguin = data[currentTime].currentWeekValue;

    return (
      <Chart data={data} className={classes.chart}>
        <ValueScale factory={() => this.scaleY} modifyDomain={this.modifyDomain} />
        <ArgumentScale factory={() => this.scaleX} />

        <ArgumentAxis labelComponent={ChartComponents.ArgumentAxisLabelComponent} />
        <ValueAxis labelComponent={ChartComponents.ValueAxisLabelComponent} />

        <Legend
          position="bottom"
          rootComponent={ChartComponents.LegendRoot}
          itemComponent={ChartComponents.LegendItem}
          markerComponent={ChartComponents.LegendMarker}
        />
        <Title text="Cost of Electricity (£)" textComponent={ChartComponents.TitleTextComponent} />

        <LineSeries
          valueField="lastWeekValue"
          argumentField="argument"
          name="Last week"
          seriesComponent={ChartComponents.LineSeriesComponent}
        />
        <LineSeries
          valueField="currentWeekValue"
          argumentField="argument"
          name="This week"
          color="green"
          seriesComponent={ChartComponents.LineSeriesComponent}
        />
        <LineSeries
          name=""
          color="#00000000"
          valueField="bear"
          argumentField="argument"
          seriesComponent={props => (
            <ChartComponents.AnimalMarker
              {...props}
              firstRow="spent up to"
              secondRow="this time last week"
              marker={bear}
              above={data[currentTime].lastWeekValue > data[currentTime].currentWeekValue}
            />
          )}
        />
        <LineSeries
          name=" "
          color="#00000000"
          valueField="penguin"
          argumentField="argument"
          seriesComponent={props => (
            <ChartComponents.AnimalMarker
              {...props}
              firstRow="spent so"
              secondRow="far this week"
              marker={penguin}
              above={data[currentTime].lastWeekValue <= data[currentTime].currentWeekValue}
            />
          )}
        />
      </Chart>
    );
  }
}

ElectricityUsageChart.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  currentTime: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
};

export default withStyles(styles)(ElectricityUsageChart);
