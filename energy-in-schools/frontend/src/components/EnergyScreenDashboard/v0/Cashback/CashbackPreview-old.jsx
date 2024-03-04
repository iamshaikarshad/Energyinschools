import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';

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

const CashbackPreviewOld = ({ classes, current, goal }) => (
  <Grid container alignItems="center" justify="center" direction="row" wrap="nowrap" className={classes.root}>
    <Grid item xs={5} className={classes.imgBlock}>
      <img alt="Pig" src={pig} />
    </Grid>
    <Grid xs={7} item className={classes.textBlock} container alignItems="center">
      <Typography className={classes.goalLabel}>
        Your school has earned: <br />
        <span className={classes.goalBlock}>
          £ {roundToNPlaces(current, 0) > goal ? goal : roundToNPlaces(current, 0)} /
          <span className={classes.goal}>{goal}</span>
        </span>
      </Typography>
    </Grid>
  </Grid>
);

CashbackPreviewOld.propTypes = {
  classes: PropTypes.object.isRequired,
  current: PropTypes.number,
  goal: PropTypes.number,
};

CashbackPreviewOld.defaultProps = {
  current: 0,
  goal: 0,
};

export default compose(withStyles(styles))(CashbackPreviewOld);
