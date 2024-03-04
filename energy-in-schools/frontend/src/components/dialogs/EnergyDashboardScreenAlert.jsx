import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withStyles } from '@material-ui/core/styles/index';

const styles = theme => ({
  screenAlertMessageContainer: {
    [theme.breakpoints.down('md')]: {
      width: '60%',
      maxWidth: '80%',
    },
  },
});

function EnergyDashboardScreenAlert(props) {
  const {
    classes, isOpened, onProceed, onBack,
  } = props;

  return (

    <div>
      <Dialog
        open={isOpened}
        onClose={onProceed}
        aria-labelledby="screen-alert-dialog-title"
        aria-describedby="screen-alert-dialog-description"
        classes={{ paper: classes.screenAlertMessageContainer }}
      >
        <DialogTitle id="screen-alert-dialog-title" align="center">Screen units discrepancy warning!</DialogTitle>
        <DialogContent>
          <DialogContentText id="screen-alert-dialog-description">
            Energy Dashboard page is designed only for devices with 1920X1080 screen resolution! <br /> Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onBack} color="primary">
            Cancel
          </Button>
          <Button onClick={onProceed} color="primary" autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

EnergyDashboardScreenAlert.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onProceed: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(EnergyDashboardScreenAlert);
