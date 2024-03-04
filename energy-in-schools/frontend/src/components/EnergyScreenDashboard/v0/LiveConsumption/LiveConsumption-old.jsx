import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { isNil } from 'lodash';

import consumptionBackground from '../../../../images/live-consumption-big-bg.png';
import roundToNPlaces from '../../../../utils/roundToNPlaces';

import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    height: '100%',
    background: `url(${consumptionBackground}) no-repeat 50% 43%`,
    backgroundSize: 'cover',
  },
  electricityBlock: {
    position: 'absolute',
    top: 34,
    left: '13%',
    textAlign: 'center',
    [mlSreenSizeMediaQuery.up]: {
      top: '5%',
    },
  },
  gasBlock: {
    position: 'absolute',
    bottom: 70,
    right: '13%',
    textAlign: 'center',
    [mlSreenSizeMediaQuery.up]: {
      bottom: '15%',
    },
  },
  liveConsumptionName: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 31,
    fontWeight: 'bold',
    lineHeight: 1.1,
    display: 'block',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  liveConsumptionWatts: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 1.1,
    display: 'block',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 35,
    },
  },
  liveConsumptionValue: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 58,
    fontWeight: 'bold',
    lineHeight: 1.4,
    display: 'block',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 75,
    },
  },
  electricityValue: {
    color: 'rgb(38, 153, 251)',
  },
  gasValue: {
    color: 'rgb(255, 187, 60)',
  },
};

const LiveConsumptionOld = ({ classes, totalUsageByEnergyType }) => (
  <Grid container justify="center" direction="row" wrap="nowrap" className={classes.root}>

    <Grid className={classes.electricityBlock}>
      <Typography className={`${classes.liveConsumptionName} ${classes.electricityValue}`}>
        Electricity live consumption
      </Typography>
      <Typography className={`${classes.liveConsumptionValue} ${classes.electricityValue}`}>
        { isNil(totalUsageByEnergyType[0].value) ? 'N/A' : roundToNPlaces(totalUsageByEnergyType[0].value / 1000, 1) }
      </Typography>
      <Typography className={`${classes.liveConsumptionWatts} ${classes.electricityValue}`}>
        kWatts
      </Typography>
    </Grid>

    <Grid className={classes.gasBlock}>
      <Typography className={`${classes.liveConsumptionName} ${classes.gasValue}`}>
        Gas live consumption
      </Typography>
      <Typography className={`${classes.liveConsumptionValue} ${classes.gasValue}`}>
        { isNil(totalUsageByEnergyType[1].value) ? 'N/A' : roundToNPlaces(totalUsageByEnergyType[1].value / 1000, 1) }
      </Typography>
      <Typography className={`${classes.liveConsumptionWatts} ${classes.gasValue}`}>
        kWatts
      </Typography>
    </Grid>

  </Grid>
);

LiveConsumptionOld.propTypes = {
  classes: PropTypes.object.isRequired,
  totalUsageByEnergyType: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.number,
    selectedUnit: PropTypes.string,
  })).isRequired,
};


export default withStyles(styles)(LiveConsumptionOld);
