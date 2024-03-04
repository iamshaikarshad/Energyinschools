import React from 'react';
import { compose } from 'redux';
import moment from 'moment';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import alertIcon from '../../images/alert.svg';
import costIcon from '../../images/cost.svg';
import { energyTypeTab } from './constants';
import roundToNPlaces from '../../utils/roundToNPlaces';

import { mlSreenSizeMediaQuery } from '../../styles/stylesConstants';

const styles = theme => ({
  root: {
    opacity: 0.8,
    borderRadius: '7px',
    fontFamily: 'Roboto',
    backgroundImage: 'linear-gradient(166deg, #f38f31, #ffbb3c);',
    color: '#fff',
    [theme.breakpoints.down('md')]: {
      paddingTop: 8,
      paddingBottom: 8,
      marginLeft: 30,
      marginRight: 30,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginRight: 0,
      borderRadius: 0,
    },
  },
  costUsageBlock: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
      marginBottom: 5,
    },
  },
  smallAlertIcon: {
    height: 40,
    marginRight: 15,
    [theme.breakpoints.down('xs')]: {
      height: 25,
      marginRight: 25,
      alignSelf: 'center',
      marginLeft: 25,
    },
  },
  yearConsumption: {
    paddingTop: 20,
    display: 'block',
    fontSize: 20,
    fontWeight: 500,
    [theme.breakpoints.down('md')]: {
      fontSize: 28,
      paddingTop: 0,
    },
  },
  yearConsumptionUnits: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 1.2,
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: 14,
      marginTop: 10,
    },
  },
  horizontalDivider: {
    borderTop: '1px solid white',
    width: '90%',
    margin: '5px 0px',
  },
  verticalDivider: {
    borderRight: '1px solid white',
    height: 60,
    [theme.breakpoints.down('xs')]: {
      height: 70,
    },
  },
  shiftContainer: {
    maxWidth: '100%',
    backgroundColor: '#f38f31',
    borderRadius: 7,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    [mlSreenSizeMediaQuery.only]: {
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 0,
      borderRadius: 0,
    },
    [theme.breakpoints.down('md')]: {
      textAlign: 'center',
      marginBottom: 0,
    },
  },
  shiftText: {
    display: 'block',
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 1.42,
    [mlSreenSizeMediaQuery.only]: {
      fontSize: 10,
    },
    [theme.breakpoints.between('sm', 'md')]: {
      letterSpacing: '2px',
    },
  },
  shiftTextBottom: {
    paddingBottom: 3,
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
  },
  largeScreenPriceContainer: {
    paddingLeft: 5,
    paddingTop: 5,
    [mlSreenSizeMediaQuery.only]: {
      paddingLeft: 0,
    },
    [theme.breakpoints.up('lg')]: {
      paddingBottom: 2,
    },
  },
  largeScreenCostIcon: {
    height: 11,
    paddingRight: 3,
    [theme.breakpoints.up('lg')]: {
      display: 'block',
      margin: '0px auto',
      paddingRight: 0,
    },
  },
  date: {
    fontSize: 14,
    fontWeight: 500,
    color: '#b5b5b5',
    lineHeight: 1.67,
    margin: 'auto',
    [mlSreenSizeMediaQuery.only]: {
      fontSize: 13,
    },
  },
  timeBasedPrice: {
    [theme.breakpoints.up('lg')]: {
      display: 'block',
      margin: '5px auto 0px',
      textAlign: 'center',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 21,
    },
  },
});

const EnergyCostAdvice = ({
  classes, saving, shiftPercent, yearUsage, energyType, largeScreenMode,
}) => {
  const shiftPercentLabel = roundToNPlaces(shiftPercent, 0);
  const yearUsageLabel = roundToNPlaces(yearUsage, 0);
  const savingLabel = roundToNPlaces(saving, 0);

  if (largeScreenMode) {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
      >
        <Grid item style={{ flexBasis: '17%' }} />
        <Grid
          item
          container
          style={{ flexBasis: '75%', maxWidth: '100%' }}
          className={classes.root}
          direction="column"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item style={{ maxWidth: '100%', flexBasis: '10%' }}>
            <div style={{ paddingTop: 20 }}>
              <img alt="Alert" src={alertIcon} style={{ height: 38 }} />
            </div>
          </Grid>
          <Grid item container direction="column" alignItems="center" style={{ maxWidth: '100%', flexBasis: '35%' }}>
            <span className={classes.yearConsumption}>{yearUsageLabel}</span>
            <span className={classes.yearConsumptionUnits}>kWh/year</span>
            <div className={classes.horizontalDivider} />
            <span className={classes.timeLabel}>based on your <br /> current usage</span>
          </Grid>
          <Grid
            item
            container
            direction="column"
            style={{ maxWidth: '100%', flexGrow: 1, overflow: 'hidden' }}
            justify="flex-end"
            alignItems="center"
          >
            <div className={classes.shiftContainer}>
              {energyType === energyTypeTab.gas ? (
                <span className={classes.shiftText}>
                  REDUCE YOUR TOTAL GAS CONSUMPTION BY&nbsp;
                  <span style={{ fontSize: 16 }}>{shiftPercentLabel}%</span> AND SAVE
                </span>
              ) : (
                <span className={classes.shiftText}>
                  REDUCE YOUR ALWAYS ON USAGE BY&nbsp;
                  <span style={{ fontSize: 16 }}>{shiftPercentLabel}%</span> AND SAVE
                </span>
              )}
              <Grid item className={classes.largeScreenPriceContainer}>
                <img alt="Cost" src={costIcon} className={classes.largeScreenCostIcon} />
                <span className={classes.timeBasedPrice}>
                  {`£${savingLabel}`}
                  <span className={classes.priceLabel}>/year</span>
                </span>
              </Grid>
            </div>
          </Grid>
        </Grid>
        <Grid style={{ display: 'flex', flexBasis: '8%' }}>
          <Typography
            variant="h4"
            className={classes.date}
            align="center"
          >{moment().format('DD MMM YYYY')}
          </Typography>
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
    >
      <Grid container item className={classes.root} direction="row" alignItems="center">
        <Grid item container xs={4} direction="column" justify="center" alignItems="center">
          <Grid item container xs={11} sm={10} md={9} alignItems="flex-end" className={classes.costUsageBlock}>
            <Grid item>
              <img alt="Alert" src={alertIcon} className={classes.smallAlertIcon} />
            </Grid>
            <Grid item>
              <span className={classes.yearConsumption}>{yearUsageLabel}</span>
              <span className={classes.yearConsumptionUnits}>kWh/year</span>
            </Grid>
          </Grid>
          <Grid item container xs={11} sm={10} md={9}>
            <span className={classes.timeLabel}>based on current usage</span>
          </Grid>
        </Grid>
        <Grid item xs={8} container direction="row" alignItems="center">
          <div className={classes.verticalDivider} />
          <Grid item container xs direction="column" justify="center" alignItems="center">
            <div className={classes.shiftContainer}>
              {energyType === energyTypeTab.gas ? (
                <span className={classes.shiftText}>
                  REDUCE YOUR TOTAL GAS CONSUMPTION BY &nbsp;
                  <span style={{ fontSize: 20 }}>{shiftPercentLabel}%</span>
                </span>
              ) : (
                <span className={classes.shiftText}>
                  REDUCE YOUR ALWAYS ON USAGE BY&nbsp;
                  <span style={{ fontSize: 16 }}>{shiftPercentLabel}%</span>
                </span>
              )}
              <Grid container item style={{ padding: '5px 15px' }} justify="center" alignItems="center">
                <span className={`${classes.shiftText} ${classes.shiftTextBottom}`}>AND SAVE&nbsp;</span>
                <img alt="Cost" src={costIcon} style={{ height: 12, paddingRight: 5 }} />
                <span className={classes.timeBasedPrice}>
                  {`£${savingLabel}`}
                  <span className={classes.priceLabel}>/year</span>
                </span>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Grid>
      <Grid container item style={{ marginTop: 15 }}>
        <Typography
          variant="h4"
          className={classes.date}
        >{moment().format('DD MMM YYYY')}
        </Typography>
      </Grid>
    </Grid>
  );
};

EnergyCostAdvice.propTypes = {
  classes: PropTypes.object.isRequired,
  yearUsage: PropTypes.number.isRequired,
  shiftPercent: PropTypes.number.isRequired,
  saving: PropTypes.number.isRequired,
  energyType: PropTypes.string.isRequired,
  largeScreenMode: PropTypes.bool,
};

EnergyCostAdvice.defaultProps = {
  largeScreenMode: true,
};

export default compose(withStyles(styles))(EnergyCostAdvice);
