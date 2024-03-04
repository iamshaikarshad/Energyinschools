import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { isNil } from 'lodash';
import { getCarbonIntensityCharacter } from '../../common/CarbonIntensity/constants';

import mainBgImg from '../../../../images/carbonIntensity-small-bg.svg';
import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    background: `url(${mainBgImg}) no-repeat center`,
    backgroundSize: 'cover',
    height: '100%',
    padding: '24px 28px',
  },
  carbonIntensityHeading: {
    fontSize: 30,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.1,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 40,
    },
  },
  carbonIntensityValue: {
    fontSize: 35,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.33,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 55,
    },
  },
  carbonIntensityKWh: {
    fontSize: 20,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 2.13,
    color: 'rgb(255, 255, 255)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 30,
    },
  },
  carbonIntensityText: {
    fontSize: 20,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.36,
    color: 'rgb(74, 74, 74)',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 30,
    },
  },
  flowerImg: {
    height: '120%',
    width: 'auto',
    position: 'relative',
    left: '50px',
  },
};

const CarbonIntensityPreviewOld = ({ value, classes }) => {
  const intensityCharacterImage = getCarbonIntensityCharacter(value, 'plant');
  return (
    <Grid container direction="row" className={classes.root}>
      <Grid item xs={7} container direction="column" wrap="nowrap">
        <Typography className={classes.carbonIntensityHeading}>
          Carbon intensity
        </Typography>
        <Typography className={classes.carbonIntensityValue}>
          {isNil(value) ? 'N/A' : `${value}`}
        </Typography>
        <Typography className={classes.carbonIntensityKWh}>
          gCO2/kWh
        </Typography>
        <Typography className={classes.carbonIntensityText}>
          {getCarbonIntensityCharacter(value, 'text')}
        </Typography>
      </Grid>

      <Grid item xs={5}>
        <img alt="flower" src={intensityCharacterImage} className={classes.flowerImg} />
      </Grid>
    </Grid>
  );
};

CarbonIntensityPreviewOld.propTypes = {
  value: PropTypes.number,
  classes: PropTypes.object.isRequired,
};

CarbonIntensityPreviewOld.defaultProps = {
  value: 0,
};

export default withStyles(styles)(CarbonIntensityPreviewOld);
