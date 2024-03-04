import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  rootPaper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: 24,
      marginRight: 24,
    },
  },
  titleRoot: {
    padding: 0,
  },
  dialogContent: {
    minWidth: 400,
    padding: 24,
    [theme.breakpoints.down('xs')]: {
      maxWidth: '100%',
      minWidth: 280,
      padding: '5px 10px',
    },
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '20px auto',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: 20,
      marginBottom: 20,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 16,
      marginBottom: 16,
    },
  },
});

const RootDialog = ({
  classes, isOpened, title, children, onClose, onSubmit, submitLabel, closeLabel, submitButtonDisabled, ...rest
}) => (
  <Dialog
    open={isOpened}
    onClose={onClose}
    aria-labelledby="form-dialog-title"
    classes={{ paper: classes.rootPaper }}
    {...rest}
  >
    <DialogTitle id="form-dialog-title" className={classes.titleRoot} disableTypography>
      <Typography variant="h6" className={classes.dialogTitle}>{ title }</Typography>
      <Divider />
    </DialogTitle>
    <DialogContent className={classes.dialogContent}>
      { children }
    </DialogContent>
    <DialogActions>
      { onSubmit && (
        <Button onClick={onSubmit} color="primary" disabled={submitButtonDisabled}>
          { submitLabel }
        </Button>
      )}
      <Button onClick={onClose}>
        { closeLabel }
      </Button>
    </DialogActions>
  </Dialog>
);

RootDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitLabel: PropTypes.string,
  closeLabel: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.node,
  submitButtonDisabled: PropTypes.bool,
};

RootDialog.defaultProps = {
  title: '',
  submitLabel: '',
  closeLabel: 'Cancel',
  onSubmit: null,
  children: null,
  submitButtonDisabled: false,
};

export default compose(withStyles(styles))(RootDialog);
