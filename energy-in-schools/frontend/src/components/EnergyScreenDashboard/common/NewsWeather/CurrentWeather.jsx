import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import { isNull } from 'lodash';

import getIconClass from '../../../../utils/weatherIconTool';
import { WEATHER_UNIT_TO_LABEL_MAP } from './constants';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

import noWeatherImage from '../../../../images/no_weather.png';

const styles = {
  root: {
    backgroundColor: 'rgb(255, 217, 87)',
    backgroundImage: 'linear-gradient(to left, rgba(255, 217, 87, 0.5), rgb(255, 158, 0, 0.9))',
    padding: '10px 10px 11px',
  },
  location: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 900,
    color: 'rgb(142, 120, 77)',
    fontSize: 20,
    lineHeight: '1.33',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  temp: {
    color: 'rgb(255, 255, 255)',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 30,
    fontWeight: 900,
    lineHeight: '1.33',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 50,
    },
  },
  status: {
    marginBottom: 10,
    textTransform: 'uppercase',
    color: 'rgb(255, 255, 255)',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: '21px',
    fontWeight: 900,
    lineHeight: 1.62,
  },
  measurement: {
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.17,
    color: 'rgb(142, 120, 77)',
  },
  noWeatherData: {
    paddingBottom: 20,
    background: `url(${noWeatherImage}) no-repeat center top`,
    backgroundSize: '100% 100%',
  },
  icon: {
    color: 'rgb(255, 255, 255)',
    fontSize: 95,
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 120,
    },
  },
};

const CurrentWeather = ({ classes, currentWeather }) => {
  const weather = currentWeather && currentWeather.weather;
  const location = currentWeather && currentWeather.location;
  return (
    <Grid className={classes.root}>
      {weather && Object.keys(weather).length > 0 ? (
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={8} container direction="row" justify="center" alignItems="center">
            <i className={`${getIconClass(weather.code)} ${classes.icon}`} />
          </Grid>
          <Grid item xs={4}>
            <Typography className={classes.location}>
              {location.name}
            </Typography>
            <Typography className={classes.temp}>
              {`${Math.round(weather.temperature && weather.temperature.average)}${WEATHER_UNIT_TO_LABEL_MAP.celsius}`}
            </Typography>
            <Typography className={classes.status}>
              {weather.status}
            </Typography>
            <Grid>
              <Typography className={classes.measurement}>
                Pressure: { isNull(weather.pressure) ? 'N/A' : `${weather.pressure && weather.pressure.pressure} ${WEATHER_UNIT_TO_LABEL_MAP.millimeterOfMercury}`}
              </Typography>
              <Typography className={classes.measurement}>
                Clouds percentage: {`${weather.clouds_percentage}${WEATHER_UNIT_TO_LABEL_MAP.percentage}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid container className={classes.noWeatherData} />
      )}
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
