import React from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { isNull } from 'lodash';

import getIconClass from '../../../../utils/weatherIconTool';
import { WEATHER_UNIT_TO_LABEL_MAP } from '../../common/NewsWeather/constants';
import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    height: '100%',
    border: '1px solid rgba(255, 255, 255, 0.87)',
    borderRadius: '25px',
  },
  timeContainer: {
    borderBottom: '1px solid rgb(255, 255, 255)',
    height: 50,
    [theme.breakpoints.up('xl')]: {
      height: 60,
    },
  },
  time: {
    height: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 17,
    fontWeight: 500,
    lineHeight: '40px',
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 22,
    },
  },
  temperature: {
    width: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 1.17,
    color: 'rgb(255, 255, 255)',
    letterSpacing: '1.2px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 28,
    },
  },
  status: {
    width: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.0,
    color: 'rgb(255, 255, 255)',
    letterSpacing: '0.8px',
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
    },
  },
  windSpeedValue: {
    width: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.17,
    color: 'rgb(255, 255, 255)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
  },
  icon: {
    color: 'rgb(255, 255, 255)',
    fontSize: 33,
    [theme.breakpoints.up('xl')]: {
      fontSize: 50,
    },
  },
});

const ForecastWeatherItem = ({
  classes, code, temperature, weatherAt, windSpeed, status,
}) => (
  <Grid container alignItems="center" className={classes.root}>
    <Grid item xs={12} className={classes.timeContainer}>
      <Typography align="center" className={classes.time}>
        {moment(weatherAt).format('h A')}
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography align="center">
        <i className={`${getIconClass(code)} ${classes.icon}`} />
      </Typography>
    </Grid>
    <Grid container item xs={12}>
      <Typography align="center" className={classes.status}>
        {status}
      </Typography>
    </Grid>
    <Grid container item xs={12}>
      <Typography align="center" className={classes.temperature}>
        {`${Math.round(temperature)}${WEATHER_UNIT_TO_LABEL_MAP.celsius}`}
      </Typography>
    </Grid>
    <Grid item container xs={12}>
      <Typography align="center" className={classes.windSpeedValue}>
        {isNull(windSpeed) ? 'N/A' : `${Math.round(windSpeed)} ${WEATHER_UNIT_TO_LABEL_MAP.kilometresPerHour}`}
      </Typography>
    </Grid>
  </Grid>
);

ForecastWeatherItem.propTypes = {
  classes: PropTypes.object.isRequired,
  code: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  weatherAt: PropTypes.string.isRequired,
  windSpeed: PropTypes.number,
  status: PropTypes.string.isRequired,
};

ForecastWeatherItem.defaultProps = {
  windSpeed: null,
};

export default withStyles(styles)(ForecastWeatherItem);
