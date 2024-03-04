import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';

import DialogContentText from '@material-ui/core/DialogContentText';
import RootDialog from './RootDialog';

const styles = {
  dialogContentText: {},
};

const AlertDialog = ({
  classes, isOpened, onClose, title, content, onSubmit, submitLabel, rootDialogProps,
}) => (
  <RootDialog
    isOpened={isOpened}
    onClose={onClose}
    title={title}
    closeLabel="Close"
    onSubmit={onSubmit}
    submitLabel={submitLabel}
    {...rootDialogProps}
  >
    <DialogContentText component="div" className={classes.dialogContentText}>
      {content}
    </DialogContentText>
  </RootDialog>
);

AlertDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  content: PropTypes.node,
  onSubmit: PropTypes.func,
  submitLabel: PropTypes.string,
  rootDialogProps: PropTypes.object,
};

AlertDialog.defaultProps = {
  content: null,
  onSubmit: null,
  submitLabel: '',
  rootDialogProps: {},
};

export default withStyles(styles)(AlertDialog);
