import React from 'react';
import PropTypes from 'prop-types';

import { range } from 'lodash';

import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Grid } from '@material-ui/core';

import { scaleLinear } from '@devexpress/dx-chart-core';
import { ValueScale, Animation, ArgumentScale } from '@devexpress/dx-react-chart';
import {
  ArgumentAxis,
  ValueAxis,
  Chart,
  Legend,
  Title,
  LineSeries,
} from '@devexpress/dx-react-chart-material-ui';

import formatErrorMessageFromError from '../../utils/errorHandler';

import { hideLoader, showLoader, showMessageSnackbar } from '../../actions/dialogActions';

import { getMeterSavings, getMeterCarbonIntensity } from '../../actions/schoolsActions';

import {
  ArgumentAxisLabelComponent,
  LegendMarker,
  LegendItem,
  LegendRoot,
} from './SavingsChartComponents';

const styles = theme => ({
  chartWrapper: {
    position: 'relative',
  },
  chart: {
    width: '100%',
    height: '100% !important',
    padding: '10px 20px 0 10px',
  },
  savingsValues: {
    position: 'absolute',
    fontSize: '16px',
    lineHeight: 1.2,
    right: '10%',
    bottom: '7.5%',
    [theme.breakpoints.down('md')]: {
      fontSize: 15,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
});

const DEFAULT_BATTERY_STATE_ARRAY = [];
class BatterySavingsChart extends React.PureComponent {
  state = {
    chartData: [],
  };


  constructor(props) {
    super(props);

    this.scaleX = scaleLinear();
    this.scaleY = scaleLinear();

    this.scaleX.ticks = () => range(0, 49, 6);
  }

  componentDidMount() {
    const { meter } = this.props;
    if (this.isMPANValid(meter.meter_id)) {
      this.getCarbonIntensity().then(totalCarbonIntensity => totalCarbonIntensity && this.setCarbonIntensity(totalCarbonIntensity));
      this.getMeterSavings().then(realBatteryStateArray => this.getChartData(realBatteryStateArray));
    } else {
      this.getChartData(DEFAULT_BATTERY_STATE_ARRAY);
    }
  }

  getMeterSavings = () => {
    const { actions, meter } = this.props;

    return actions
      .getMeterSavings(meter)
      .then((result) => {
        const savings = result.data;
        if (
          savings.charging_start_time
          && savings.charging_hours
          && savings.discharging_start_time
          && savings.discharging_hours
        ) {
          const batteryStateArray = this.getBatteryStateArray(
            savings.charging_start_time,
            savings.charging_hours,
            savings.discharging_start_time,
            savings.discharging_hours,
          );
          return batteryStateArray;
        }
        return DEFAULT_BATTERY_STATE_ARRAY;
      });
  }

  getPeriodNumber = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(int => parseInt(int, 10));

    return Math.floor((hours * 60 + minutes) / 30);
  }

  getBatteryStateArray = (chargeStart, chargeDuration, dischargeStart, dischargeDuration) => {
    const chargePeriodNumber = this.getPeriodNumber(chargeStart);
    const dischargePeriodNumber = this.getPeriodNumber(dischargeStart);
    const stateArray = new Array(48).fill(0);
    const chargePeriods = chargeDuration * 2;
    const chargeStep = 100 / chargePeriods;
    const chargingState = [...new Array(chargePeriods).keys()].map(index => Math.round((index * chargeStep + chargeStep) * 10 ** 6) / 10 ** 6);
    const dischargePeriods = dischargeDuration * 2;
    const dischargeStep = 100 / dischargePeriods;
    const dischargingState = [...new Array(dischargePeriods).keys()].reverse().map(index => Math.round((index * dischargeStep) * 10 ** 6) / 10 ** 6);
    const chargeEndPeriod = chargePeriodNumber + chargePeriods;
    const fullBatteryDuration = dischargePeriodNumber - chargeEndPeriod;

    stateArray.splice(chargePeriodNumber, chargePeriods, ...chargingState);
    stateArray.splice(dischargePeriodNumber, dischargePeriods, ...dischargingState);
    stateArray.splice(chargeEndPeriod, fullBatteryDuration, ...new Array(fullBatteryDuration).fill(100));

    return stateArray;
  }

  getCarbonIntensity = () => {
    const { actions, meter } = this.props;

    return actions
      .getMeterCarbonIntensity(meter)
      .then((result) => {
        const carbonIntensity = result.data;
        if (carbonIntensity) {
          return carbonIntensity.cumulative_net_carbon_intensity;
        }
        return null;
      });
  }

  setCarbonIntensity = (totalIntensity) => {
    this.setState({ totalSavings: totalIntensity });
  }

  getChartData = (batteryStateArray) => {
    const { actions: { showLoader: showSpinner, hideLoader: hideSpinner } } = this.props;
    const renewableResources = ['solar', 'wind', 'hydro', 'biomass'];
    const date = new Date();
    const dateToday = date.toISOString();
    date.setUTCHours(0, 0, 0, 0);
    showSpinner();
    axios.get(`https://api.carbonintensity.org.uk/generation/${dateToday}/pt24h`)
      .then((response) => {
        const { data } = response.data;
        const todaysData = data.filter(generation => new Date(generation.from) >= date);
        const timeTillMidnight = data
          .filter(generation => new Date(generation.from) < date)
          .map(genObject => genObject.from.slice(-6, -1))
          .map((timeValue, index) => ({ cleanEnergyValue: null, argument: index + todaysData.length, batteryState: batteryStateArray[todaysData.length + index] }));
        const cleanEnergyArray = todaysData.map(genObject => genObject.generationmix.filter(genMix => renewableResources.includes(genMix.fuel)));
        const totalRenewableGen = cleanEnergyArray.map(genObj => Math.floor(genObj.reduce((prevValue, currentValue) => prevValue + currentValue.perc, 0)));
        const chartData = totalRenewableGen.map((hhGen, index) => ({ cleanEnergyValue: hhGen, argument: index, batteryState: batteryStateArray[index] }));

        chartData.push(...timeTillMidnight, { cleanEnergyValue: null, argument: 48, batteryState: 0 });
        this.setState({ chartData });
        hideSpinner();
      })
      .catch((error) => {
        hideSpinner();
        showMessageSnackbar(formatErrorMessageFromError(error));
        console.log(error); // eslint-disable-line no-console
      });
  }

  isMPANValid = (mpan) => {
    const regex = new RegExp('^03|04\\d{18,21');
    return regex.test(mpan);
  }

  render() {
    const {
      classes,
      meterIndex,
    } = this.props;
    const {
      chartData,
      totalSavings,
      // TODO: uncomment next line when savings value appears
      // savingsToday
    } = this.state;

    return (
      <div className={classes.chartWrapper}>
        <Paper className={classes.chart}>
          <Chart data={chartData}>
            <ValueScale modifyDomain={domain => [domain[0], 100]} factory={() => this.scaleY} />
            <ArgumentScale factory={() => this.scaleX} />

            <ArgumentAxis labelComponent={ArgumentAxisLabelComponent} />
            <ValueAxis />

            <Legend
              position="bottom"
              markerComponent={LegendMarker}
              LegendRoot={LegendRoot}
              LegendItem={LegendItem}
            />
            <Title text={`Battery charging state for Meter #${meterIndex + 1}`} />
            <LineSeries
              name="Battery charging state"
              valueField="batteryState"
              argumentField="argument"
            />
            <LineSeries
              name="Renewable generation"
              valueField="cleanEnergyValue"
              argumentField="argument"
            />
            <Animation />
          </Chart>
        </Paper>
        {totalSavings ? (
          <Grid item xs={5} className={classes.savingsValues}>
            {/* Uncomment next line when total savings gotten */}
            {/* Cost savings since start of scheme: {savingsToday} £s <br /><br /> */}
            Carbon savings since start of scheme: {totalSavings} kgs
          </Grid>
        ) : ''}
      </div>
    );
  }
}

BatterySavingsChart.propTypes = {
  classes: PropTypes.object.isRequired,
  meterIndex: PropTypes.number.isRequired,
  meter: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getMeterSavings,
      getMeterCarbonIntensity,
      showLoader,
      hideLoader,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(BatterySavingsChart);
