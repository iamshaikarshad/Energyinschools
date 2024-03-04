import moment, { Moment } from 'moment';
import React from 'react';
import PropTypes from 'prop-types';

import { isNil } from 'lodash';

import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  refreshButton: {
    padding: '0px 16px',
    border: 0,
    fontSize: 14,
    textTransform: 'none',
    [theme.breakpoints.down('xs')]: {
      padding: '16px',
      paddingBottom: 0,
    },
  },
  mainLabel: {
    padding: '5px 0px',
  },
  helperLabels: {
    color: theme.palette.text.secondary,
    fontSize: 12,
  },
});

const DevicesRefreshButton = ({ classes, lastUpdated, onClick }) => (
  <Button
    component="div"
    color="primary"
    className={classes.refreshButton}
    onClick={onClick}
  >
    <RefreshIcon style={{ marginRight: 16, width: 16 }} />
    <Grid container direction="column">
      <Grid item className={classes.helperLabels}>
        Device data may not be up-to-date
      </Grid>
      <Grid item className={classes.mainLabel}>
        Refresh devices info
      </Grid>
      <Grid item className={classes.helperLabels}>
        Last updated: {!isNil(lastUpdated) ? moment(lastUpdated).format('D MMM, h:mm a') : 'N/A'}
      </Grid>
    </Grid>
  </Button>
);

DevicesRefreshButton.propTypes = {
  classes: PropTypes.object.isRequired,
  lastUpdated: PropTypes.instanceOf(Moment),
  onClick: PropTypes.func.isRequired,
};

DevicesRefreshButton.defaultProps = {
  lastUpdated: null,
};

export default withStyles(styles)(DevicesRefreshButton);
