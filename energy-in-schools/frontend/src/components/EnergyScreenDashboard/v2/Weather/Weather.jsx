import React from 'react';
import PropTypes from 'prop-types';

import { isArray } from 'lodash';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import CurrentWeather from './CurrentWeather';
import ForecastWeatherItem from './ForecastWeatherItem';

const styles = theme => ({
  currentWeatherContainer: {
    padding: '8px 8px 16px 0px',
    height: '100%',
    [theme.breakpoints.up('xl')]: {
      padding: '12px 12px 16px 0px',
    },
  },
  currentWeatherWrapper: {
    border: '1px solid rgba(255, 255, 255, 0.87)',
    borderRadius: '25px',
    height: '100%',
  },
  forecastWeatherContainer: {
    padding: '8px 0px 0px 8px',
    height: '100%',
    [theme.breakpoints.up('xl')]: {
      padding: '12px 0px 0px 8px',
    },
  },
  forecastWeatherWrapper: {
    height: '100%',
  },
  forecastWeatherItemWrapper: {
    height: '100%',
  },
  forecastWeatherItemRoot: {},
});

const Weather = ({ classes, currentWeather, forecastWeather }) => (
  <React.Fragment>
    {currentWeather && (
      <Grid item xs={6} className={classes.currentWeatherContainer}>
        <Grid container justify="center" alignItems="center" className={classes.currentWeatherWrapper}>
          <CurrentWeather
            classes={{ root: classes.currentWeatherRoot }}
            currentWeather={currentWeather}
          />
        </Grid>
      </Grid>
    )}
    {(forecastWeather && isArray(forecastWeather.weathers)) && (
      <Grid item xs={6} container className={classes.forecastWeatherContainer}>
        <Grid container justify="center" alignItems="center" className={classes.forecastWeatherWrapper} spacing={2}>
          {
            forecastWeather.weathers.slice(0, 3).map(weather => (
              <Grid key={weather.weather_at} item xs className={classes.forecastWeatherItemWrapper}>
                <ForecastWeatherItem
                  classes={{
                    root: classes.forecastWeatherItemRoot,
                  }}
                  code={weather.code}
                  temperature={weather.temperature.average}
                  windSpeed={weather.wind.speed}
                  weatherAt={weather.weather_at}
                  status={weather.status}
                />
              </Grid>
            ))
          }
        </Grid>
      </Grid>
    )}
  </React.Fragment>
);

Weather.propTypes = {
  classes: PropTypes.object.isRequired,
  currentWeather: PropTypes.object,
  forecastWeather: PropTypes.object,
};

Weather.defaultProps = {
  currentWeather: null,
  forecastWeather: null,
};

export default withStyles(styles)(Weather);
