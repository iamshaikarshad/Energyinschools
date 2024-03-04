import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = ({
  root: {
    height: '100%',
    background: 'rgb(242, 251, 252)',
  },
});

const Loader = ({ classes }) => (
  <Grid container direction="row" className={classes.root} wrap="nowrap" justify="center" alignItems="center">
    <CircularProgress />
  </Grid>
);

Loader.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Loader);
