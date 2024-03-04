import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { isNil } from 'lodash';

import mainBg from '../../../../images/carbon-intensity-big-bg.png';
import dirtyEnergy from '../../../../images/dirty.svg';
import clearEnergy from '../../../../images/green.svg';
import energyCloud from '../../../../images/carbon-intensity-cloud.svg';

import { getCarbonIntensityCharacter } from '../../common/CarbonIntensity/constants';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    height: '100%',
    background: `url(${mainBg}) no-repeat center bottom`,
    backgroundSize: '100% 100%',
    padding: '3% 0',
  },
  energyBlock: {
    height: '100%',
    textAlign: 'center',
  },
  intensity: {
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    height: '100%',
  },
  textBlock: {
    background: `url(${energyCloud}) no-repeat center`,
    backgroundSize: 'auto 100%',
    width: '100%',
    height: '40%',
    marginTop: '40px',
  },
  energyHeading: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 1.35,
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 26,
    },
  },
  energyNumbers: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 35,
    fontWeight: 'bold',
    lineHeight: 1.15,
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  carbonIntensityHeading: {
    fontSize: 35,
    marginTop: 135,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.84,
    color: 'rgba(0, 188, 212, 1)',
    marginBottom: '2%',
    [mlSreenSizeMediaQuery.up]: {
      marginTop: 210,
    },
  },
  carbonIntensityText: {
    fontSize: 30,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.07,
    color: 'rgba(255, 187, 60, 1)',
    width: '70%',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  dirtyEnergyImg: {
    maxWidth: 400,
  },
  clearEnergyImg: {
    position: 'relative',
    right: '10%',
    maxWidth: 400,
  },
  dirtyEnergyText: {
    color: 'rgb(77, 130, 137)',
  },
  clearEnergyText: {
    color: 'rgb(255, 187, 60)',
  },
};

const CarbonIntensityOld = ({
  value, gas, solar, coal, hydro, wind, classes,
}) => {
  const intensityCharacterImage = `url(${getCarbonIntensityCharacter(value, 'image')})`;
  const dirtyValue = gas + coal;
  const cleanValue = solar + hydro + wind;
  return (
    <Grid container direction="row" className={classes.root} wrap="nowrap">
      <Grid item container direction="column" alignItems="center" className={classes.energyBlock} wrap="nowrap">
        <object type="image/svg+xml" data={dirtyEnergy} aria-label="svg are not supported" className={classes.dirtyEnergyImg} />
        <Grid container direction="column" alignItems="center" justify="center" className={classes.textBlock}>
          <Typography className={`${classes.energyHeading} ${classes.dirtyEnergyText}`}>
            Dirty generation
          </Typography>
          <Typography className={`${classes.energyNumbers} ${classes.dirtyEnergyText}`}>
            { isNil(dirtyValue) ? 'N/A' : `${(dirtyValue).toFixed(2)} %` }
          </Typography>
        </Grid>
      </Grid>

      <Grid item container direction="column" alignItems="center" justify="center" className={classes.intensity} style={{ backgroundImage: intensityCharacterImage }}>
        <Typography className={classes.carbonIntensityHeading}>
          Carbon intensity
        </Typography>
        <Typography className={classes.carbonIntensityText} align="center">
          { getCarbonIntensityCharacter(value, 'text') }
        </Typography>
      </Grid>

      <Grid item container direction="column" alignItems="center" className={classes.energyBlock} wrap="nowrap">
        <object type="image/svg+xml" data={clearEnergy} className={classes.clearEnergyImg} aria-label="svg are not supported" />
        <Grid container direction="column" alignItems="center" justify="center" className={classes.textBlock}>
          <Typography className={`${classes.energyHeading} ${classes.clearEnergyText}`}>
            Green energy
          </Typography>
          <Typography className={`${classes.energyNumbers} ${classes.clearEnergyText}`}>
            { isNil(cleanValue) ? 'N/A' : `${(cleanValue).toFixed(2)} %` }
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

CarbonIntensityOld.propTypes = {
  value: PropTypes.number,
  gas: PropTypes.number,
  coal: PropTypes.number,
  solar: PropTypes.number,
  hydro: PropTypes.number,
  wind: PropTypes.number,
  classes: PropTypes.object.isRequired,
};

CarbonIntensityOld.defaultProps = {
  value: 0,
  gas: 0,
  coal: 0,
  solar: 0,
  hydro: 0,
  wind: 0,
};
export default withStyles(styles)(CarbonIntensityOld);
