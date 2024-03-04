import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import scaleBg from '../../../../images/scale_bg.png';
import scaleLine from '../../../../images/line.svg';
import scale from '../../../../images/scale.svg';

import DASHBOARD_FONTS from '../../../../styles/stylesConstants';

const styles = theme => ({
  root: {
    right: 0,
    height: '100%',
    bottom: 0,
    position: 'absolute',
    background: `url(${scaleBg}) no-repeat right top`,
    width: 660,
    backgroundSize: '660px 120%',
    [theme.breakpoints.up('xl')]: {
      width: 1000,
      backgroundSize: '1000px 120%',
    },
  },
  numbersBlock: {
    height: '70%',
    position: 'absolute',
    bottom: -35,
    right: 245,
    [theme.breakpoints.up('xl')]: {
      right: 355,
    },
  },
  scaleLine: {
    backgroundImage: `url(${scaleLine})`,
    backgroundRepeat: 'no-repeat',
    width: 90,
    height: 25,
    [theme.breakpoints.up('xl')]: {
      width: 95,
    },
  },
  scale: {
    backgroundImage: `url(${scale})`,
    backgroundColor: 'rgb(239, 141, 34)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    zIndex: 0,
    borderRadius: '65px 65px 0px 0px',
    left: 8,
    width: 71,
    height: '100%',
    position: 'absolute',
    [theme.breakpoints.up('xl')]: {
      left: -17,
      width: 130,
    },
  },
  scaleNumbers: {
    fontSize: 23,
    fontFamily: DASHBOARD_FONTS.primary,
    fontWeight: 'bold',
    color: 'rgba(65, 64, 66, 1)',
    lineHeight: 1.61,
    textAlign: 'center',
  },
  hiddenElement: {
    display: 'none',
  },
});

const Scale = ({ classes, goal, current }) => {
  const renderScaleLine = percent => (
    <Grid>
      <Grid style={{ position: 'absolute', top: `${90 - percent}%`, zIndex: 4 }}>
        <Typography className={current ? classes.scaleNumbers : classes.hiddenElement}>
          {(goal * percent / 100).toFixed(0)}
        </Typography>
        <Grid className={classes.scaleLine} />
      </Grid>
    </Grid>
  );

  const renderScale = percent => (
    <div className={current ? classes.scale : classes.hiddenElement} style={{ top: `${percent < 100 ? 100 - percent : 0}%` }} />
  );

  return (
    <Grid className={classes.root}>
      <Grid className={classes.numbersBlock}>
        {renderScaleLine(80)}
        {renderScaleLine(50)}
        {renderScaleLine(20)}
        {renderScale(current * 100 / goal)}
      </Grid>
    </Grid>
  );
};

Scale.propTypes = {
  classes: PropTypes.object.isRequired,
  current: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  goal: PropTypes.number,
};

Scale.defaultProps = {
  current: 0,
  goal: 0,
};

export default withStyles(styles)(Scale);
