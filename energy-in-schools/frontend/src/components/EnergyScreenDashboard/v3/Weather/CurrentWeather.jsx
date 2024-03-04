import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import getIconClass from '../../../../utils/weatherIconTool';
import { WEATHER_UNIT_TO_LABEL_MAP } from '../../common/NewsWeather/constants';
import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    height: '100%',
    width: '100%',
  },
  location: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    color: 'rgb(255, 255, 255)',
    fontSize: 24,
    lineHeight: '1.33',
    padding: '5px 5px 0px 0px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 36,
    },
  },
  temp: {
    color: 'rgb(255, 255, 255)',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1.33,
    paddingTop: 8,
    paddingBottom: 8,
    [theme.breakpoints.up('xl')]: {
      fontSize: 50,
      paddingTop: 12,
      paddingBottom: 12,
    },
  },
  status: {
    marginBottom: 10,
    textTransform: 'uppercase',
    color: 'rgb(255, 255, 255)',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1.62,
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
    },
  },
  detailWrapper: {
    height: '100%',
    alignContent: 'center',
    '&:first-child': {
      borderRight: '1px solid rgb(255, 255, 255)',
    },
  },
  detailValue: {
    width: '100%',
    marginBottom: 4,
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.17,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 24,
      marginBottom: 8,
    },
  },
  detailName: {
    width: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.17,
    color: 'rgba(255, 255, 255, 0.87)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
    },
  },
  icon: {
    color: 'rgb(255, 255, 255)',
    fontSize: 70,
    [theme.breakpoints.up('xl')]: {
      fontSize: 96,
    },
  },
  mainInfoContainer: {
    height: '60%',
    borderBottom: '1px solid rgb(255, 255, 255)',
  },
  detailedInfoContainer: {
    height: '40%',
  },
});

const CurrentWeather = ({ classes, currentWeather }) => {
  const weather = currentWeather && currentWeather.weather;
  const location = currentWeather && currentWeather.location;

  return weather && (
    <Grid className={classes.root}>
      <Grid container justify="center" alignItems="center" className={classes.mainInfoContainer}>
        <Grid item xs={6} container justify="center" alignItems="center">
          <i className={`${getIconClass(weather.code)} ${classes.icon}`} />
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.location}>
            {location.name}
          </Typography>
          <Typography className={classes.temp}>
            {`${Math.round(weather.temperature && weather.temperature.average)}${WEATHER_UNIT_TO_LABEL_MAP.celsius}`}
          </Typography>
          <Typography className={classes.status}>
            {weather.status}
          </Typography>
        </Grid>
      </Grid>
      <Grid container justify="center" alignItems="center" className={classes.detailedInfoContainer}>
        <Grid item xs={6} container alignItems="center" className={classes.detailWrapper}>
          <Typography align="center" className={classes.detailValue}>
            {`${Math.round(weather.wind.speed)} ${WEATHER_UNIT_TO_LABEL_MAP.kilometresPerHour}`}
          </Typography>
          <Typography align="center" className={classes.detailName}>
            wind speed
          </Typography>
        </Grid>
        <Grid item xs={6} container alignItems="center" className={classes.detailWrapper}>
          <Typography align="center" className={classes.detailValue}>
            {`${weather.clouds_percentage} ${WEATHER_UNIT_TO_LABEL_MAP.percentage}`}
          </Typography>
          <Typography align="center" className={classes.detailName}>
            cloudy
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

CurrentWeather.propTypes = {
  classes: PropTypes.object.isRequired,
  currentWeather: PropTypes.object,
};

CurrentWeather.defaultProps = {
  currentWeather: {},
};

export default withStyles(styles)(CurrentWeather);
