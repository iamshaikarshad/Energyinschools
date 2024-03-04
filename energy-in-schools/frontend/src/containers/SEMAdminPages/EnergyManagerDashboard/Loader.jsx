import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 300,
    zIndex: 10000,
    overflow: 'auto',
  },
  indicatorContainer: {},
  circularRoot: {},
};

const Loader = ({
  classes, circularProgressProps,
}) => (
  <Grid container justify="center" alignItems="center" className={classes.root}>
    <Grid style={styles.indicatorContainer}>
      <CircularProgress color="secondary" thickness={4} classes={{ root: classes.circularRoot }} {...circularProgressProps} />
    </Grid>
  </Grid>
);

Loader.propTypes = {
  classes: PropTypes.object.isRequired,
  circularProgressProps: PropTypes.object,
};

Loader.defaultProps = {
  circularProgressProps: {
    size: 40,
  },
};

export default compose(withStyles(styles))(Loader);
