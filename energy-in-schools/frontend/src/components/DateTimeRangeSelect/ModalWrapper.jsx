import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const styles = theme => ({
  rootPaper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: 16,
      marginRight: 16,
    },
  },
  titleRoot: {
    padding: 0,
  },
  dialogContent: {
    width: 600,
    padding: 12,
    [theme.breakpoints.down('sm')]: {
      width: 480,
    },
    [theme.breakpoints.down('xs')]: {
      width: 300,
      padding: '5px 10px',
    },
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '20px auto',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: 16,
      marginBottom: 16,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 12,
      marginBottom: 12,
    },
  },
});

const ModalWrapper = ({
  classes, isOpened, title, children, ...rest
}) => (
  <Dialog
    open={isOpened}
    aria-labelledby="date-time-select-modal"
    classes={{ paper: classes.rootPaper }}
    {...rest}
  >
    <DialogTitle id="date-time-select-modal" className={classes.titleRoot} disableTypography>
      <Typography variant="h6" className={classes.dialogTitle}>{ title }</Typography>
      <Divider />
    </DialogTitle>
    <DialogContent className={classes.dialogContent}>
      { children }
    </DialogContent>
  </Dialog>
);

ModalWrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  children: PropTypes.node,
  title: PropTypes.string,
};

ModalWrapper.defaultProps = {
  title: 'Custom Period',
  children: null,
};

export default compose(withStyles(styles))(ModalWrapper);
