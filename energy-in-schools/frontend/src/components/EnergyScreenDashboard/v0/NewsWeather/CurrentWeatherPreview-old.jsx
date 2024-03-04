import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import getIconClass from '../../../../utils/weatherIconTool';
import { WEATHER_UNIT_TO_LABEL_MAP } from '../../common/NewsWeather/constants';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

import noWeatherImage from '../../../../images/no_weather.png';
import mainBg from '../../../../images/weatherPreviewBg.png';

const styles = {
  root: {
    height: '100%',
  },
  withWeatherData: {
    height: '100%',
    background: `url(${mainBg}) no-repeat`,
    backgroundSize: '100% 100%',
    padding: '24px 28px',
  },
  headline: {
    fontSize: 30,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.1,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  temp: {
    fontSize: 35,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.33,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 55,
    },
  },
  status: {
    fontSize: 20,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 2.13,
    color: 'rgb(255, 255, 255)',
    textTransform: 'uppercase',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 30,
    },
  },
  location: {
    fontSize: 20,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.36,
    color: 'rgb(74, 74, 74)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 30,
    },
  },
  noWeatherData: {
    height: '100%',
    background: `rgb(255, 192, 74) url(${noWeatherImage}) no-repeat center top`,
    backgroundSize: '100% 100%',
  },
  icon: {
    color: 'rgb(255, 255, 255)',
    fontSize: 115,
  },
};

const CurrentWeatherPreviewOld = ({ classes, currentWeather }) => {
  const weather = currentWeather && currentWeather.weather;
  const location = currentWeather && currentWeather.location;
  return (
    <Grid className={classes.root}>
      {(weather && Object.keys(weather).length > 0) ? (
        <Grid container direction="row" justify="flex-end" className={classes.withWeatherData}>
          <Grid item xs={6}>
            <Typography className={classes.headline}>
              Weather
            </Typography>
            <Typography className={classes.temp}>
              {`${Math.round(weather.temperature.average)}${WEATHER_UNIT_TO_LABEL_MAP.celsius}`}
            </Typography>
            <Typography className={classes.status}>
              {weather.status}
            </Typography>
            <Typography className={classes.location}>
              {location.name}
            </Typography>
          </Grid>
          <Grid item xs={6} container direction="row" justify="center" alignItems="center">
            <i className={`${getIconClass(weather.code)} ${classes.icon}`} />
          </Grid>
        </Grid>
      ) : (
        <Grid container className={classes.noWeatherData} />
      )}
    </Grid>
  );
};

CurrentWeatherPreviewOld.propTypes = {
  classes: PropTypes.object.isRequired,
  currentWeather: PropTypes.object.isRequired,
};


export default compose(withStyles(styles))(CurrentWeatherPreviewOld);
