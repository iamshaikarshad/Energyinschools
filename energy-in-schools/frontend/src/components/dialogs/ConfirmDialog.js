/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography/Typography';
import Divider from '@material-ui/core/Divider/Divider';

const styles = {
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '28px auto',
    textAlign: 'center',
  },
};

const ConfirmDialog = ({
  classes, isOpened, onClose, title, onSubmit, children, onExited, rootDialogProps,
}) => (
  <div>
    <Dialog
      open={isOpened}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      TransitionProps={{ onExited }}
      {...rootDialogProps}
    >
      <DialogTitle id="confirm-dialog-title" style={{ padding: '0px 15px' }} disableTypography>
        <Typography variant="h6" className={classes.dialogTitle}>
          { title }
        </Typography>
        <Divider />
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit} color="primary">
          Yes
        </Button>
        <Button onClick={onClose}>
          No
        </Button>
      </DialogActions>
    </Dialog>
  </div>
);

ConfirmDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  rootDialogProps: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  onExited: PropTypes.func,
};

ConfirmDialog.defaultProps = {
  children: null,
  rootDialogProps: {},
  onExited: () => {},
};

export default withStyles(styles)(ConfirmDialog);
