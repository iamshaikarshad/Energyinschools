import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';

const styles = {
  root: {
    borderRadius: 6,
    backgroundColor: 'rgba(61, 61, 61, 0.9)',
  },
};

class MessageSnackbar extends React.Component {
  handleClose = (event, reason) => {
    const { onClose } = this.props;
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  render() {
    const { classes, open, message } = this.props;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
          classes: { root: classes.root },
        }}
        message={<span id="message-id">{message}</span>}
      />
    );
  }
}

MessageSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withStyles(styles)(MessageSnackbar);
