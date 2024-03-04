import { compose } from 'redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { isNil } from 'lodash';

import pig from '../../../../images/pig_mini.svg';
import roundToNPlaces from '../../../../utils/roundToNPlaces';

import DASHBOARD_FONTS, { mlSreenSizeMediaQuery } from '../../../../styles/stylesConstants';

const styles = {
  root: {
    height: '100%',
    backgroundImage: 'linear-gradient(rgb(255,255,255), rgb(210,243,247));',
  },
  imgBlock: {
    padding: 30,
  },
  textBlock: {
    height: '100%',
  },
  goalLabel: {
    color: 'rgb(0,188,212)',
    fontSize: 35,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    letterSpacing: '2px',
    [mlSreenSizeMediaQuery.up]: {
      fontSize: 45,
    },
  },
  goalBlock: {
    fontSize: 40,
    color: 'rgb(85,85,85)',
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
  },
  goal: {
    color: 'rgb(255,187,60)',
  },
};

const CashbackPreview = ({ classes, current, goal }) => {
  const currentCashBack = +roundToNPlaces(current, 0);
  return (
    <Grid container alignItems="center" justify="center" direction="row" wrap="nowrap" className={classes.root}>
      <Grid item xs={5} className={classes.imgBlock}>
        <img alt="Pig" src={pig} />
      </Grid>
      <Grid xs={7} item className={classes.textBlock} container alignItems="center">
        <Typography className={classes.goalLabel}>
          Your school has earned: <br />
          <span className={classes.goalBlock}>
            {isNil(current) ? 'N/A' : `£ ${currentCashBack > goal ? goal : currentCashBack} `}
            / <span className={classes.goal}>{isNil(goal) ? 'N/A' : goal}</span>
          </span>
        </Typography>
      </Grid>
    </Grid>
  );
};

CashbackPreview.propTypes = {
  classes: PropTypes.object.isRequired,
  current: PropTypes.number.isRequired,
  goal: PropTypes.number.isRequired,
};

export default compose(withStyles(styles))(CashbackPreview);
