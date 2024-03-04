import React from 'react';
import PropTypes from 'prop-types';

import { compose } from 'redux';

import { withStyles } from '@material-ui/core/styles/index';
import Typography from '@material-ui/core/Typography';

import RootDialog from './RootDialog';

const styles = theme => ({
  dialogTitle: {
    fontSize: 21,
    fontWeight: 500,
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  greetingText: {
    fontSize: 18,
    color: 'rgb(0, 188, 212)',
    textAlign: 'center',
    marginBottom: 15,
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },
  messageText: {
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5,
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },
});

const TrialExpiryAlert = (props) => {
  const {
    title, isOpened, showGreetingText, expiryDate, classes, onClose, onSubmit,
  } = props;

  return (
    <RootDialog
      isOpened={isOpened}
      onClose={() => {
        onClose();
      }}
      title={title}
      onSubmit={() => {
        onSubmit();
      }}
      closeLabel="Skip"
      submitLabel="Activate"
      disableBackdropClick
      classes={{
        dialogTitle: classes.dialogTitle,
      }}
    >
      {showGreetingText && (
        <Typography className={classes.greetingText}>
          Welcome to Energy in Schools Portal!
        </Typography>
      )}
      {expiryDate && (
        <div>
          <Typography className={classes.messageText}>
            Trial period expires on {expiryDate}.
          </Typography>
          <Typography className={classes.messageText}>
            Press ACTIVATE button in order to start School account activation
          </Typography>
        </div>
      )}
    </RootDialog>
  );
};

TrialExpiryAlert.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  expiryDate: PropTypes.string,
  showGreetingText: PropTypes.bool,
};

TrialExpiryAlert.defaultProps = {
  showGreetingText: false,
  expiryDate: '',
};

export default compose(withStyles(styles))(TrialExpiryAlert);
