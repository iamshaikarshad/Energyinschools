import React from 'react';
import PropTypes from 'prop-types';

import { isNil, isEmpty } from 'lodash';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import LeagueComponent from '../CommonComponents/LeagueComponent';
import Weather from '../Weather/Weather';
import PreviewComponent from '../CommonComponents/PreviewComponent';
import NoTariffMessage from '../CommonComponents/NoTariffMessage';

import mainBg from '../../../../images/Dashboard_V2_Arts/electricity_bg.svg';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

import { ELECTRICITY_LEAGUE_MEMBER_POSITION_CONFIG } from './constants';

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
});

class ElectricityUsage extends React.PureComponent {
  render() {
    const {
      classes,
      electricityLiveData,
      electricityYesterdayData,
      electricityYesterdayCost,
      currentWeather,
      forecastWeather,
      electricityLeagueData,
      electricityTariffs,
      previewMessages,
      messagesSlider,
    } = this.props;
    const liveData = getValueUnitLabelFromEnergyData(electricityLiveData, 1, UNIT.kilowatt);
    const yesterdayData = getValueUnitLabelFromEnergyData(electricityYesterdayData);
    const yesterdayCost = getValueUnitLabelFromEnergyData(electricityYesterdayCost, 1, UNIT.poundSterling);
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
                    <span className={classes.pointsValue}>{yesterdayData.value}</span>
                    <span className={classes.unit}>{yesterdayData.unit}</span>
                  </Typography>
                </Grid>
                <Grid container>
                  <Typography align="center" className={classes.consumptionType}>
                    yesterday total consumption
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} className={classes.valueBlock} style={{ paddingRight: 0 }}>
              {(!isNil(electricityYesterdayCost) || !isEmpty(electricityTariffs)) ? (
                <Grid container direction="column" justify="center" className={classes.valueWrapper}>
                  <Grid container justify="center">
                    <Typography align="center" className={classes.pointsValue}>
                      <img src={costIcon} className={classes.costIcon} alt="coins" style={{ display: 'inline-block' }} />
                      <span>{yesterdayCost.value}</span>
                      <span className={classes.costUnit}>{yesterdayCost.unit}</span>
                    </Typography>
                  </Grid>
                  <Grid container>
                    <Typography align="center" className={classes.consumptionType}>
                      yesterday total cost
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
        <Grid container item xs={6} className={classes.leagueContainer}>
          <LeagueComponent
            leagueData={electricityLeagueData}
            leagueConfig={ELECTRICITY_LEAGUE_MEMBER_POSITION_CONFIG}
          />
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
  electricityYesterdayData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  electricityYesterdayCost: PropTypes.object,
  currentWeather: PropTypes.object,
  forecastWeather: PropTypes.object,
  electricityLeagueData: PropTypes.object,
  electricityTariffs: PropTypes.array.isRequired,
  previewMessages: PropTypes.array.isRequired,
  messagesSlider: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // need it to avoid warning when using react lazy
  ]).isRequired,
};

ElectricityUsage.defaultProps = {
  electricityLiveData: null,
  electricityYesterdayData: null,
  electricityYesterdayCost: null,
  electricityLeagueData: null,
  currentWeather: null,
  forecastWeather: null,
};

export default withStyles(styles)(ElectricityUsage);
