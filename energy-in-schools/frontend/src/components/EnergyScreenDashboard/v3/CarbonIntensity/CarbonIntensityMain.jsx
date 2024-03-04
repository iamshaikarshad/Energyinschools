import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { isNil, startCase, toLower } from 'lodash';

import PreviewComponent from '../CommonComponents/PreviewComponent';

import isLegacy from '../../../../utils/isLegacy';

import mainBg from '../../../../images/carbon-intensity-big-bg.png';
import dirtyEnergy from '../../../../images/dirty.svg';
import clearEnergy from '../../../../images/green.svg';
import dirtyEnergyLegacy from '../../../../images/dirty.png';
import clearEnergyLegacy from '../../../../images/green.png';
import energyCloud from '../../../../images/Dashboard_V2_Arts/carbon_intensity_cloud.png';
import messageCloudBg from '../../../../images/Dashboard_V2_Arts/carbon_message_cloud_bg.svg';

import {
  getCarbonIntensityCharacter,
} from './constants';
import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    height: '100%',
    backgroundImage: `url(${mainBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    padding: '20px 0px',
    [theme.breakpoints.up('xl')]: {
      padding: '40px 0',
    },
  },
  energyBlock: {
    height: '100%',
    textAlign: 'center',
  },
  intensity: {
    margin: '3% 0 4%',
    backgroundSize: '65% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    height: '38%',
    position: 'relative',
    [theme.breakpoints.up('xl')]: {
      margin: '1% 0 2%',
      height: '45%',
      backgroundSize: '56% 100%',
    },
  },
  textBlock: {
    backgroundImage: `url(${energyCloud})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: '60% 100%',
    width: '100%',
    height: '28%',
    marginTop: '10%',
  },
  energyHeading: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 21,
    fontWeight: 'bold',
    lineHeight: 1.35,
    [theme.breakpoints.up('xl')]: {
      fontSize: 26,
    },
  },
  energySmallHeading: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.25,
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
    },
  },
  energyNumbers: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 1.7,
    [theme.breakpoints.up('xl')]: {
      fontSize: 35,
    },
  },
  carbonIntensityTextWrapper: {
    width: '100%',
    position: 'absolute',
    left: 0,
    top: '62%',
    [theme.breakpoints.up('xl')]: {
      top: '60%',
    },
  },
  carbonIntensityHeading: {
    fontSize: 21,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.07,
    color: 'rgba(0, 188, 212, 1)',
    marginBottom: '2%',
    [theme.breakpoints.up('xl')]: {
      fontSize: 26,
    },
  },
  carbonIntensityIndex: {
    fontSize: 32,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    color: 'rgba(0, 188, 212, 1)',
    lineHeight: 1.07,
    [theme.breakpoints.up('xl')]: {
      lineHeight: 1.5,
      fontSize: 40,
    },
  },
  carbonIntensityUnit: {
    fontSize: 18,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    [theme.breakpoints.up('xl')]: {
      fontSize: 21,
    },
  },
  dirtyEnergyImg: {
    width: 300,
    [theme.breakpoints.up('xl')]: {
      width: 400,
    },
  },
  clearEnergyImg: {
    position: 'relative',
    right: '10%',
    width: 300,
    [theme.breakpoints.up('xl')]: {
      width: 400,
    },
  },
  dirtyEnergyText: {
    color: 'rgb(77, 130, 137)',
  },
  clearEnergyText: {
    color: 'rgb(57, 194, 233)',
  },
  markIcon: {
    height: 30,
    width: 'auto',
    display: 'inline-block !important',
    verticalAlign: 'text-bottom',
  },
  messageContainer: {
    backgroundImage: `url(${messageCloudBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 98%',
    height: '22%',
  },
  messageText: {
    width: '75%',
    padding: '4px 0 6px',
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 20,
    fontWeight: 700,
    [theme.breakpoints.up('xl')]: {
      width: '70%',
      padding: '4px 8px 5px 12px',
      fontSize: 24,
    },
  },
  carbonScaleBlock: {
    position: 'absolute',
    left: 0,
    bottom: '15%',
  },
  carbonScaleHeader: {
    width: '100%',
    fontFamily: DASHBOARD_FONTS.primary,
    color: 'rgb(255, 255, 255)',
    fontSize: 21,
    fontWeight: 700,
    [theme.breakpoints.up('xl')]: {
      fontSize: 28,
    },
  },
  scaleHeaderUnit: {
    fontSize: 18,
    fontWeight: 700,
    [theme.breakpoints.up('xl')]: {
      fontSize: 24,
    },
  },
  scaleImg: {
    height: 50,
    [theme.breakpoints.up('xl')]: {
      height: 70,
    },
  },
  previewSlider: {
    position: 'absolute',
    height: '15%',
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
});

class CarbonIntensity extends React.PureComponent {
  render() {
    const {
      value, index, biomass, nuclear, imports, gas, coal, solar, hydro, wind, classes, previewMessages, messagesSlider,
    } = this.props;
    const intensityCharacter = getCarbonIntensityCharacter(value);
    let dirtyValue,
      cleanValue;

    if (!isNil(gas) && !isNil(coal)) {
      dirtyValue = gas + coal;
    }

    if (!isNil(solar) && !isNil(hydro) && !isNil(wind) && !isNil(biomass)) {
      cleanValue = solar + hydro + wind + biomass;
    }

    return (
      <Grid container className={classes.root} wrap="nowrap">
        <Grid item xs={4} container direction="column" alignItems="center" className={classes.energyBlock} wrap="nowrap">
          {isLegacy() ? (
            <img src={dirtyEnergyLegacy} alt="dirtyEnergy" className={classes.dirtyEnergyImg} />
          ) : (
            <object
              type="image/svg+xml"
              data={dirtyEnergy}
              aria-label="svg are not supported"
              className={classes.dirtyEnergyImg}
            />
          )}
          <Grid container alignItems="center" justify="center" className={classes.textBlock}>
            <Grid item className={classes.energyTextWrapper}>
              <Typography className={`${classes.energyHeading} ${classes.dirtyEnergyText}`}>
                Fossil fuel generation
              </Typography>
              <Typography className={`${classes.energyNumbers} ${classes.dirtyEnergyText}`}>
                {isNil(dirtyValue) ? 'N/A' : `${Math.round(dirtyValue)} %`}
              </Typography>
              <Typography className={`${classes.energySmallHeading} ${classes.dirtyEnergyText}`}>
                from gas, coal, or oil
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={4}
          container
          justify="center"
          alignContent="flex-start"
          style={{ height: '100%' }}
        >
          <Grid
            item
            xs={12}
            container
            direction="column"
            alignItems="center"
            justify="center"
            className={classes.messageContainer}
          >
            <Typography align="center" className={classes.messageText}>
              Carbon intensity shows how much fossil fuels are being used to make our electricity
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            container
            alignItems="center"
            justify="center"
            className={classes.intensity}
            style={{ backgroundImage: `url(${intensityCharacter.img})` }}
          >
            <Grid item className={classes.carbonIntensityTextWrapper}>
              <Typography align="center" className={classes.carbonIntensityHeading} style={{ color: intensityCharacter.color }}>
                Carbon intensity is
              </Typography>
              <Typography align="center" className={classes.carbonIntensityIndex} style={{ color: intensityCharacter.color }}>
                {startCase(toLower(index))}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            container
            direction="column"
            alignItems="center"
            justify="center"
            className={classes.messageContainer}
          >
            <Typography align="center" className={classes.messageText}>
              Imported Electricity (from the EU) = {Math.round(imports)}%<br />Nuclear energy = {Math.round(nuclear)}%
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={4} container direction="column" alignItems="center" className={classes.energyBlock} wrap="nowrap">
          {isLegacy() ? (
            <img src={clearEnergyLegacy} alt="clearEnergy" className={classes.clearEnergyImg} />
          ) : (
            <object
              type="image/svg+xml"
              data={clearEnergy}
              className={classes.clearEnergyImg}
              aria-label="svg are not supported"
            />
          )}
          <Grid container alignItems="center" justify="center" className={classes.textBlock}>
            <Grid item className={classes.energyTextWrapper}>
              <Typography className={`${classes.energyHeading} ${classes.clearEnergyText}`}>
                Clean energy
              </Typography>
              <Typography className={`${classes.energyNumbers} ${classes.clearEnergyText}`}>
                {isNil(cleanValue) ? 'N/A' : `${Math.round(cleanValue)} %`}
              </Typography>
              <Typography className={`${classes.energySmallHeading} ${classes.clearEnergyText}`}>
                from solar, wind, and <br /> hydro power or biomass
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container className={classes.previewSlider}>
          <PreviewComponent
            previewMessages={previewMessages}
            sliderComponent={messagesSlider}
          />
        </Grid>
      </Grid>
    );
  }
}

CarbonIntensity.propTypes = {
  value: PropTypes.number.isRequired,
  index: PropTypes.string.isRequired,
  biomass: PropTypes.number.isRequired,
  nuclear: PropTypes.number.isRequired,
  imports: PropTypes.number.isRequired,
  gas: PropTypes.number.isRequired,
  coal: PropTypes.number.isRequired,
  solar: PropTypes.number.isRequired,
  hydro: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  previewMessages: PropTypes.array.isRequired,
  messagesSlider: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // need it to avoid warning when using react lazy
  ]).isRequired,
};

export default withStyles(styles)(CarbonIntensity);
