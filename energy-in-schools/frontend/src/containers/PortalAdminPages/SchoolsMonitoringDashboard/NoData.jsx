import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
    height: 250,
  },
  text: {
    color: 'rgb(238, 129, 118)',
    letterSpacing: 2,
    fontSize: 32,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
    },
  },
});

const NoData = (props) => {
  const {
    classes, text,
  } = props;
  return (
    <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
      <Typography className={classes.text}>
        {text}
      </Typography>
    </Grid>
  );
};

NoData.propTypes = {
  classes: PropTypes.object.isRequired,
  text: PropTypes.node,
};

NoData.defaultProps = {
  text: 'No data!',
};

export default compose(withStyles(styles))(NoData);
