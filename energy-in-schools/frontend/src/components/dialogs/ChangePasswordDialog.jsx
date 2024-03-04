import React from 'react';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import RootDialog from './RootDialog';

export default class ChangePasswordDialog extends React.Component {
  state = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  changePasswordDialog = null;

  componentDidMount() {
    ValidatorForm.addValidationRule('isPasswordMatch', value => value === this.state.newPassword); // eslint-disable-line react/destructuring-assignment
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { oldPassword, newPassword } = this.state;
    onSubmit(newPassword, oldPassword);
  };

  onSubmitClick = () => {
    this.changePasswordDialog.submit();
  };

  render() {
    const { isOpened, onClose } = this.props;
    const { oldPassword, newPassword, confirmPassword } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title="Change password"
        onSubmit={this.onSubmitClick}
        submitLabel="Change"
      >
        <ValidatorForm
          ref={(el) => { this.changePasswordDialog = el; }}
          onSubmit={this.onFormSubmit}
          style={{ minWidth: 400 }}
        >
          <TextValidator
            type="password"
            fullWidth
            label="Old password"
            margin="dense"
            onChange={event => this.setState({ oldPassword: event.target.value })}
            name="oldPassword"
            value={oldPassword}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          <TextValidator
            type="password"
            fullWidth
            label="New password"
            margin="dense"
            onChange={event => this.setState({ newPassword: event.target.value })}
            name="newPassword"
            value={newPassword}
            validators={['required', 'minStringLength:8', 'maxStringLength:128']}
            errorMessages={['This field is required', 'Password must be at least 8 characters long', 'Password can not exceed 128 characters']}
          />
          <TextValidator
            type="password"
            fullWidth
            label="Confirm password"
            margin="dense"
            onChange={event => this.setState({ confirmPassword: event.target.value })}
            name="confirmPassword"
            value={confirmPassword}
            validators={['isPasswordMatch', 'required']}
            errorMessages={['Password mismatch']}
          />
        </ValidatorForm>
      </RootDialog>
    );
  }
}

ChangePasswordDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
