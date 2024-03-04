import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';

import RootDialog from './RootDialog';

import emailIcon from '../../images/email.svg';

const styles = theme => ({
  dialogContent: {
    maxWidth: 420,
  },
  infoBlockRoot: {
    padding: 24,
    borderRadius: 6,
    marginTop: 20,
    backgroundColor: 'rgba(0,188,212, 0.15)',
  },
  infoBlockAvatar: {
    borderRadius: 0,
    width: 52,
    height: 38,
  },
  infoBlockTitle: {
    fontSize: 16,
    lineHeight: 1.25,
    color: theme.palette.primary.main,
  },
});

class ForgetPasswordDialog extends React.Component {
  state = {
    email: '',
  };

  forgetPasswordForm = null;

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { email } = this.state;
    onSubmit(email);
  };

  onSubmitClick = () => {
    this.forgetPasswordForm.submit();
  };

  render() {
    const { classes, isOpened, onClose } = this.props;
    const { email } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title="Reset password"
        onSubmit={this.onSubmitClick}
        submitLabel="Confirm"
      >
        <ValidatorForm
          ref={(el) => { this.forgetPasswordForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            type="email"
            fullWidth
            label="Your email"
            margin="dense"
            onChange={event => this.setState({ email: event.target.value })}
            name="email"
            value={email}
            validators={['required', 'isEmail']}
            errorMessages={['This field is required', 'Email is not valid']}
          />
        </ValidatorForm>
        <Grid container>
          <CardHeader
            avatar={
              <Avatar alt="Email" src={emailIcon} className={classes.infoBlockAvatar} />
              }
            title="Please check mailbox! We will send you mail with instructions"
            classes={{ root: classes.infoBlockRoot, title: classes.infoBlockTitle }}
          />
        </Grid>
      </RootDialog>
    );
  }
}

ForgetPasswordDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(ForgetPasswordDialog);
