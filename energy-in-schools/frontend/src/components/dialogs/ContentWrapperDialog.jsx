import React from 'react';
import PropTypes from 'prop-types';

import { withStyles, useTheme } from '@material-ui/core/styles';

import { isNil } from 'lodash';

import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  rootPaper: {},
  titleRoot: {
    padding: 0,
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
    margin: '28px auto',
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 15,
  },
  titleIcon: {
    width: 30,
    height: 35,
  },
});

const DEFAULT_DIALOG_TIMEOUT = 500;

const DEFAULT_TRANSITION_DIRECTION = 'up';

const ContentWrapperDialog = ({
  classes,
  isOpened,
  title,
  titleIcon,
  children,
  onClose,
  fullScreen,
  breakpointDownUseFullScreen,
  rootDialogProps,
  transitionProps,
}) => {
  const theme = useTheme();
  const { keys } = theme.breakpoints || [];
  const useFullScreen = !isNil(breakpointDownUseFullScreen) && keys.includes(breakpointDownUseFullScreen)
    ? useMediaQuery(theme.breakpoints.down(breakpointDownUseFullScreen))
    : fullScreen;

  return (
    <Dialog
      fullScreen={useFullScreen}
      fullWidth
      maxWidth="md"
      open={isOpened}
      onClose={onClose}
      aria-labelledby="content-wrapper-dialog-title"
      classes={{ paper: classes.rootPaper }}
      TransitionComponent={Slide}
      TransitionProps={{
        direction: DEFAULT_TRANSITION_DIRECTION,
        mountOnEnter: true,
        unmountOnExit: true,
        timeout: DEFAULT_DIALOG_TIMEOUT,
        ...transitionProps,
      }}
      {...rootDialogProps}
    >
      <DialogTitle
        id="content-wrapper-dialog-title"
        className={classes.titleRoot}
        disableTypography
      >
        <div className={classes.titleBlock}>
          {titleIcon && (
            <img src={titleIcon} alt="resource" className={classes.titleIcon} />
          )}
          <Typography variant="h6" className={classes.dialogTitle}>
            {title}
          </Typography>
          <IconButton color="inherit" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

ContentWrapperDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  title: PropTypes.node,
  titleIcon: PropTypes.string,
  rootDialogProps: PropTypes.object,
  transitionProps: PropTypes.object,
  fullScreen: PropTypes.bool,
  breakpointDownUseFullScreen: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  onClose: PropTypes.func.isRequired,
};

ContentWrapperDialog.defaultProps = {
  title: '',
  titleIcon: '',
  rootDialogProps: {},
  transitionProps: {},
  fullScreen: false,
  breakpointDownUseFullScreen: null,
  children: null,
};

export default withStyles(styles)(ContentWrapperDialog);
