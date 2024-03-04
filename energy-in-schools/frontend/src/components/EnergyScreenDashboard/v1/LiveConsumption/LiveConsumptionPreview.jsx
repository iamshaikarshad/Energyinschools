import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';

import roundToNPlaces from '../../../../utils/roundToNPlaces';

import backgroundImage from '../../../../images/school-consumption-prev-bg.png';

import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    height: '100%',
    background: `url(${backgroundImage}) no-repeat`,
    backgroundSize: '100% 100%',
    padding: '24px 28px',
  },
  headline: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: '1.1',
    textAlign: 'left',
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  numbersKwatts: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 35,
    fontWeight: 'bold',
    lineHeight: 1.33,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 55,
    },
  },
  kwatts: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 2.13,
    color: 'rgb(255, 255, 255)',
    textTransform: 'uppercase',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 30,
    },
  },
  total: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 1.36,
    color: 'rgb(74, 74, 74)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 30,
    },
  },
});

const LiveConsumptionPreview = ({ classes, gasLiveData, electricityLiveData }) => (
  <Grid
    container
    direction="column"
    wrap="nowrap"
    className={classes.root}
  >
    <Typography className={classes.headline}>
      School consumption
    </Typography>
    <Typography className={classes.numbersKwatts}>
      {roundToNPlaces((gasLiveData.value + electricityLiveData.value), 1)}
    </Typography>
    <Typography className={classes.kwatts}>
      kW
    </Typography>
    <Typography className={classes.total}>
      Total
    </Typography>
  </Grid>
);

LiveConsumptionPreview.propTypes = {
  classes: PropTypes.object.isRequired,
  gasLiveData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  electricityLiveData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default withStyles(styles)(LiveConsumptionPreview);
