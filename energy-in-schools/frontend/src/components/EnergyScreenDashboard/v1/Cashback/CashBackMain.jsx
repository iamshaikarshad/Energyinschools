import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { isNil } from 'lodash';

import mainBg from '../../../../images/cash_bg.png';
import roundToNPlaces from '../../../../utils/roundToNPlaces';
import Scale from '../../common/Cashback/Scale';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    height: '100%',
    background: `url(${mainBg}) no-repeat center 20%`,
    backgroundSize: 'cover',
  },
  textBlock: {
    padding: '39px 40px',
  },
  cashbackHeading: {
    fontFamily: DASHBOARD_FONTS.primary,
    fontSize: 35,
    fontWeight: 'bold',
    lineHeight: 1.61,
    color: 'rgb(0, 188, 212)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 60,
    },
  },
  cashbackMain: {
    fontSize: 60,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    color: 'rgb(57, 57, 57)',
    [theme.breakpoints.up('xl')]: {
      fontSize: 65,
    },
  },
  cashbackGoal: {
    fontSize: 45,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    lineHeight: 1.62,
    color: 'rgb(57, 57, 57)',
    position: 'relative',
    right: 125,
    padding: '30px 0 0 0',
    zIndex: 5,
    [theme.breakpoints.up('xl')]: {
      right: 210,
      fontSize: 65,
    },
  },
  scaleBlock: {
    height: '100%',
  },
  goalText: {
    color: 'rgb(247, 148, 30)',
  },
  hiddenElement: {
    display: 'none',
  },
});

const Cashback = ({ classes, current, goal }) => {
  const currentCashBack = +roundToNPlaces(current, 0);
  return (
    <Grid container direction="row" className={classes.root} wrap="nowrap">
      <Grid container direction="column" item xs={4} className={classes.textBlock}>
        <Typography className={classes.cashbackHeading}>
          Your school is close to the goal:
        </Typography>
        <Typography className={classes.cashbackMain}>
          {isNil(current) ? 'N/A' : `£ ${currentCashBack > goal ? goal : currentCashBack} `}
          / <span className={classes.goalText}> {isNil(goal) ? 'N/A' : goal} </span>
        </Typography>
      </Grid>
      <Grid container direction="column" item xs={8} className={classes.scaleBlock}>
        <Typography className={goal ? classes.cashbackGoal : classes.hiddenElement} align="right">
          £ <span className={classes.goalText}> {isNil(goal) ? 'N/A' : goal} </span>
        </Typography>
        <Grid container direction="row" justify="center" className={classes.scale}>
          <Scale goal={+goal} current={currentCashBack} />
        </Grid>
      </Grid>
    </Grid>
  );
};

Cashback.propTypes = {
  classes: PropTypes.object.isRequired,
  current: PropTypes.number.isRequired,
  goal: PropTypes.number.isRequired,
};

export default withStyles(styles)(Cashback);