import React from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { isNull } from 'lodash';

import getIconClass from '../../../../utils/weatherIconTool';
import { WEATHER_UNIT_TO_LABEL_MAP } from './constants';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    padding: '10px 0',
  },
  dotElem: {
    display: 'inline-block',
    width: 14,
    height: 14,
    marginLeft: 14,
    borderRadius: '50%',
    backgroundColor: 'rgb(142, 120, 77)',
  },
  time: {
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: 17,
    fontWeight: 500,
    lineHeight: 1.14,
    color: 'rgb(142, 120, 77)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 22,
    },
  },
  temperature: {
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: '23px',
    fontWeight: 500,
    lineHeight: 1.17,
    color: 'rgb(255, 255, 255)',
    letterSpacing: '1.2px',
  },
  temperatureStatus: {
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.16,
    color: 'rgb(255, 255, 255)',
    letterSpacing: '0.8px',
  },
  measurement: {
    fontFamily: DASHBOARD_FONTS.secondary,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.17,
    color: 'rgb(142, 120, 77)',
  },
  icon: {
    color: 'rgb(255, 255, 255)',
    fontSize: 33,
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 50,
    },
  },
};

const ForecastWeather = ({
  classes, code, temperature, weatherAt, windSpeed, status, indexNumber,
}) => {
  const dotsArray = [];
  for (let i = 0; i <= indexNumber; i += 1) {
    dotsArray.push(<div key={i} className={classes.dotElem} />);
  }
  return (
    <Grid container direction="row" alignItems="center" className={classes.root}>
      <Grid item container alignItems="center" xs={8} wrap="nowrap">
        <Grid item xs={3} container justify="flex-end">
          {dotsArray}
        </Grid>
        <Grid item xs={3}>
          <Typography align="center" className={classes.time}>
            {moment(weatherAt).format('HH:mm')}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography>
            <i className={`${getIconClass(code)} ${classes.icon}`} />
          </Typography>
        </Grid>
        <Grid container item xs={3} direction="column" justify="center">
          <Typography className={classes.temperature}>
            {`${Math.round(temperature)}${WEATHER_UNIT_TO_LABEL_MAP.celsius}`}
          </Typography>
          <Typography className={classes.temperatureStatus}>
            {status}
          </Typography>
        </Grid>
      </Grid>
      <Grid item container xs={4} direction="column" justify="center">
        <Typography className={classes.measurement}>
          Temperature: {`${Math.round(temperature)}${WEATHER_UNIT_TO_LABEL_MAP.celsius}`}
        </Typography>
        <Typography className={classes.measurement}>
          Wind speed: {isNull(windSpeed) ? 'N/A' : `${Math.round(windSpeed)} ${WEATHER_UNIT_TO_LABEL_MAP.kilometresPerHour}`}
        </Typography>
      </Grid>
    </Grid>
  );
};

ForecastWeather.propTypes = {
  classes: PropTypes.object.isRequired,
  code: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  weatherAt: PropTypes.string.isRequired,
  windSpeed: PropTypes.number,
  status: PropTypes.string.isRequired,
  indexNumber: PropTypes.number.isRequired,
};

ForecastWeather.defaultProps = {
  windSpeed: null,
};

export default withStyles(styles)(ForecastWeather);
