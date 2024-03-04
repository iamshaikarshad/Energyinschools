import React from 'react';
import PropTypes from 'prop-types';
import { isEqual, isEmpty } from 'lodash';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { withStyles } from '@material-ui/core/styles/index';
import { compose } from 'redux';
import RootDialog from './RootDialog';

import { NAME_MAX_LENGTH } from '../../constants/config';

const styles = theme => ({
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
});

class EditDeviceDialog extends React.Component {
  state = {
    id: '',
    label: '',
  };

  editDeviceForm = null;

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props, nextProps) && !isEmpty(nextProps.device)) {
      this.setState({
        id: nextProps.device.id,
        label: nextProps.device.label,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const {
      id, label,
    } = this.state;
    onSubmit(id, label);
  };

  render() {
    const {
      isOpened, onClose,
    } = this.props;
    const {
      label,
    } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title="Edit device label"
        onSubmit={() => this.editDeviceForm.submit()}
        submitLabel="Edit"
      >
        <ValidatorForm
          ref={(el) => { this.editDeviceForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            type="text"
            fullWidth
            label="Device label"
            margin="dense"
            onChange={event => this.setState({ label: event.target.value })}
            name="Label"
            value={label}
            validators={['required', 'matchRegexp:^[a-z0-9-]+$', `maxStringLength:${NAME_MAX_LENGTH}`]}
            errorMessages={['This field is required', 'Only lowercase letters, numbers and \'-\' are allowed', `No more than ${NAME_MAX_LENGTH} symbols`]}
          />
        </ValidatorForm>
      </RootDialog>
    );
  }
}

EditDeviceDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  device: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(EditDeviceDialog);
