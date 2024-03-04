import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {},
  itemBlock: {
    padding: 50,
  },
  titleText: {
    color: 'rgba(255, 50, 50, 0.87)',
    fontSize: 42,
    textShadow: '2px 2px 2px #71b7e6',
    [theme.breakpoints.down('xs')]: {
      fontSize: 32,
    },
  },
  button: {
    backgroundColor: 'rgba(0, 188, 212, 0.9)',
    padding: 12,
    color: 'rgb(255, 255, 255)',
    '&:hover': {
      backgroundColor: 'rgba(0, 188, 212, 1)',
    },
  },
});

const NoMetersBillingInfo = ({ classes, showLinkToFillEnergyMetersBillingInfo }) => (
  <Grid container justify="center" alignItems="center" direction="column" className={classes.root}>
    <Grid item className={classes.itemBlock}>
      <Typography align="center" className={classes.titleText}>
        There is no energy meters billing info!
      </Typography>
    </Grid>
    {showLinkToFillEnergyMetersBillingInfo && (
      <Grid item className={classes.itemBlock}>
        <Typography align="center" className={classes.buttonWrapper}>
          <Button
            className={classes.button}
            component={Link}
            to={{
              pathname: '/sem-admin/energy-meters-billing-info',
            }}
          >
            Fill Energy Meters Billing Info
          </Button>
        </Typography>
      </Grid>
    )}
  </Grid>
);

NoMetersBillingInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  showLinkToFillEnergyMetersBillingInfo: PropTypes.bool,
};

NoMetersBillingInfo.defaultProps = {
  showLinkToFillEnergyMetersBillingInfo: true,
};

export default withStyles(styles)(NoMetersBillingInfo);
