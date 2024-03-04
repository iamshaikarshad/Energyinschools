import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import DialogTitle from '@material-ui/core/DialogTitle';
import PaymentInfoForm from '../TariffComparison/PaymentInfoForm';

const styles = {
  root: {
    padding: 15,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 15,
  },
  dialogTitle: {
    padding: 0,
  },
  dialogTitleText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '20px auto',
    textAlign: 'center',
  },
};

const SwitchTariffDialog = ({
  isOpened,
  onClose,
  classes,
  title,
  selectedMeterId,
  onSubmitSwitch,
}) => (
  <Dialog
    fullWidth
    maxWidth="xs"
    open={isOpened}
    onClose={onClose}
    keepMounted // important if need to preserve dialog's children state
  >
    <DialogTitle className={classes.dialogTitle} disableTypography>
      <div className={classes.titleBlock}>
        <Typography variant="h6" className={classes.dialogTitleText}>{title}</Typography>
        <IconButton color="inherit" onClick={onClose} aria-label="Close" className={classes.closeIcon}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
    </DialogTitle>
    <PaymentInfoForm
      classes={{ root: classes.root }}
      selectedMeterId={selectedMeterId}
      onSubmit={onSubmitSwitch}
    />
  </Dialog>
);

SwitchTariffDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedMeterId: PropTypes.number.isRequired,
  onSubmitSwitch: PropTypes.func.isRequired,
  title: PropTypes.string,
};

SwitchTariffDialog.defaultProps = {
  title: 'Fill payment details',
};

export default withStyles(styles)(SwitchTariffDialog);
