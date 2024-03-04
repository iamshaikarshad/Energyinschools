import React from 'react';
import PropTypes from 'prop-types';

import { isNil, isEmpty, findLastIndex } from 'lodash';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import Weather from '../Weather/Weather';
import ElectricityUsageChart from '../ElectricityUsageChart/ElectricityUsageChart';
import PreviewComponent from '../CommonComponents/PreviewComponent';
import NoTariffMessage from '../CommonComponents/NoTariffMessage';

import mainBg from '../../../../images/Dashboard_V2_Arts/electricity_bg.svg';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

import { getValueUnitLabelFromEnergyData } from '../../constants';

import { UNIT } from '../../../../constants/config';

import costIcon from '../../../../images/cost.svg';

const styles = theme => ({
  root: {
    height: '100%',
    backgroundImage: `url(${mainBg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  },
  textBlock: {
    width: '50%',
    height: '80%',
    padding: '10px 20px',
    [theme.breakpoints.up('xl')]: {
      padding: 40,
    },
  },
  textBlockHeading: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 35,
    },
  },
  valuesContainer: {
    height: '30%',
    paddingTop: 0,
  },
  valueBlock: {
    height: '100%',
    padding: 8,
    [theme.breakpoints.up('xl')]: {
      padding: 10,
    },
  },
  valueWrapper: {
    backgroundColor: 'rgba(199, 97, 66, 0.5)',
    borderRadius: 25,
    border: '1px solid rgba(255, 255, 255, 0.87)',
    height: '100%',
  },
  pointsValue: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 38,
    fontWeight: 900,
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    letterSpacing: '3px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 52,
    },
  },
  unit: {
    display: 'inline-block',
    marginLeft: 6,
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 21,
    fontWeight: 700,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      marginLeft: 10,
      fontSize: 24,
    },
  },
  consumptionType: {
    width: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.61,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 22,
    },
  },
  weatherContainer: {
    height: '62%',
    [theme.breakpoints.up('xl')]: {
      height: '60%',
    },
  },
  chartContainer: {
    width: '50%',
    height: '80%',
    padding: '10px 70px 10px 20px',
    [theme.breakpoints.up('xl')]: {
      padding: 40,
    },
  },
  currentWeatherWrapper: {
    backgroundColor: 'rgba(199, 97, 66, 0.5)',
  },
  forecastWeatherItemRoot: {
    backgroundColor: 'rgba(199, 97, 66, 0.5)',
  },
  leagueContainer: {
    height: '100%',
    paddingTop: 10,
    position: 'relative',
    [theme.breakpoints.up('xl')]: {
      paddingTop: 40,
    },
  },
  costIcon: {
    height: 21,
    marginRight: 12,
    [theme.breakpoints.up('xl')]: {
      height: 28,
    },
  },
  costUnit: {
    display: 'inline-block',
    fontSize: 24,
    marginLeft: 6,
    [theme.breakpoints.up('xl')]: {
      marginLeft: 10,
    },
  },
  previewSlider: {
    position: 'absolute',
    height: '15%',
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  paceMessageContainer: {
    position: 'relative',
    margin: 'auto',
    width: 470,
    textAlign: 'center',
    top: -25,
  },
  paceMessageText: {
    padding: 15,
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 15,
    fontSize: 17,
    fontFamily: DASHBOARD_FONTS.primary,
  },
});

const HALF_HOUR_PERIODS_NUMBER = 5 * 2 * 24; // 5 days, 2 * 24 half hour periods per day

class ElectricityUsage extends React.PureComponent {
  render() {
    const {
      classes,
      electricityLiveData,
      electricityTodayData,
      electricityTodayCost,
      currentWeather,
      forecastWeather,
      electricityTariffs,
      previewMessages,
      messagesSlider,
      lastWeekHistoricalCost,
      currentWeekHistoricalCost,
    } = this.props;

    const liveData = getValueUnitLabelFromEnergyData(electricityLiveData, 1, UNIT.kilowatt);
    const todayElectricityData = getValueUnitLabelFromEnergyData(electricityTodayData);
    const todayElectricityCost = getValueUnitLabelFromEnergyData(electricityTodayCost, 2, UNIT.poundSterling);

    let currentWeekSum = 0;
    let lastWeekSum = 0;
    const data = [];

    for (let index = 0; index < HALF_HOUR_PERIODS_NUMBER; index += 1) {
      const lastWeekValue = lastWeekHistoricalCost[index];
      const currentWeekValue = currentWeekHistoricalCost[index];

      lastWeekSum += lastWeekValue ? lastWeekValue.value : 0;
      currentWeekSum += currentWeekValue ? currentWeekValue.value : 0;
      data.push({
        argument: index,
        lastWeekValue: lastWeekSum,
        currentWeekValue: currentWeekValue === undefined ? undefined : currentWeekSum,
      });
    }

    if (!data[0].currentWeekValue) {
      data[0].currentWeekValue = 0;
    }

    const currentTime = findLastIndex(data, record => record.currentWeekValue !== undefined);

    const paceMessage = data[currentTime].lastWeekValue < data[currentTime].currentWeekValue
      ? 'At the current rate you will spend more this week than last week!'
      : 'Well done! You’re on track to spend less this week than last week';

    return (
      <Grid container direction="row" className={classes.root} wrap="nowrap">
        <Grid container direction="column" item xs={6} className={classes.textBlock} wrap="nowrap">
          <Grid item container alignItems="center">
            <Typography className={classes.textBlockHeading}>
              Electricity usage
            </Typography>
          </Grid>
          <Grid item container className={classes.valuesContainer} wrap="nowrap">
            <Grid item xs={4} className={classes.valueBlock} style={{ paddingLeft: 0 }}>
              <Grid container direction="column" justify="center" className={classes.valueWrapper}>
                <Grid container justify="center">
                  <Typography align="center">
                    <span className={classes.pointsValue}>{liveData.value}</span>
                    <span className={classes.unit}>{liveData.unit}</span>
                  </Typography>
                </Grid>
                <Grid container>
                  <Typography align="center" className={classes.consumptionType}>
                    right now consumption
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} className={classes.valueBlock}>
              <Grid container direction="column" justify="center" className={classes.valueWrapper}>
                <Grid container justify="center">
                  <Typography align="center">
                    <span className={classes.pointsValue}>{todayElectricityData.value}</span>
                    <span className={classes.unit}>{todayElectricityData.unit}</span>
                  </Typography>
                </Grid>
                <Grid container>
                  <Typography align="center" className={classes.consumptionType}>
                    today so far
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} className={classes.valueBlock} style={{ paddingRight: 0 }}>
              {(!isNil(electricityTodayCost) || !isEmpty(electricityTariffs)) ? (
                <Grid container direction="column" justify="center" className={classes.valueWrapper}>
                  <Grid container justify="center">
                    <Typography align="center" className={classes.pointsValue}>
                      <img src={costIcon} className={classes.costIcon} alt="coins" style={{ display: 'inline-block' }} />
                      <span>{todayElectricityCost.value}</span>
                      <span className={classes.costUnit}>{todayElectricityCost.unit}</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Typography align="center" className={classes.consumptionType}>
                      cost so far today
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Grid container direction="column" justify="center" className={classes.valueWrapper}>
                  <NoTariffMessage />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item container className={classes.weatherContainer}>
            <Weather
              classes={{
                currentWeatherWrapper: classes.currentWeatherWrapper,
                forecastWeatherItemRoot: classes.forecastWeatherItemRoot,
              }}
              currentWeather={currentWeather}
              forecastWeather={forecastWeather}
            />
          </Grid>
        </Grid>
        <Grid item className={classes.chartContainer}>
          <ElectricityUsageChart data={data} currentTime={currentTime} maxValue={Math.max(lastWeekSum, currentWeekSum)} />
          <div className={classes.paceMessageContainer}>
            <p className={`${classes.valueWrapper} ${classes.paceMessageText}`}>
              {paceMessage}
            </p>
          </div>
        </Grid>
        <Grid item container direction="row" className={classes.previewSlider}>
          <PreviewComponent
            previewMessages={previewMessages}
            sliderComponent={messagesSlider}
          />
        </Grid>
      </Grid>
    );
  }
}

ElectricityUsage.propTypes = {
  classes: PropTypes.object.isRequired,
  electricityLiveData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  electricityTodayData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  electricityTodayCost: PropTypes.object,
  currentWeather: PropTypes.object,
  forecastWeather: PropTypes.object,
  electricityTariffs: PropTypes.array.isRequired,
  previewMessages: PropTypes.array.isRequired,
  messagesSlider: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // need it to avoid warning when using react lazy
  ]).isRequired,
  lastWeekHistoricalCost: PropTypes.array.isRequired,
  currentWeekHistoricalCost: PropTypes.array.isRequired,
};

ElectricityUsage.defaultProps = {
  electricityLiveData: null,
  electricityTodayData: null,
  electricityTodayCost: null,
  currentWeather: null,
  forecastWeather: null,
};

export default withStyles(styles)(ElectricityUsage);
