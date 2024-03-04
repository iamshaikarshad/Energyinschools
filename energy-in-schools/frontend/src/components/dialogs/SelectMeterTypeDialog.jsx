import React from 'react';
import PropTypes from 'prop-types';
import { ValidatorForm, SelectValidator } from 'react-material-ui-form-validator';

import MenuItem from '@material-ui/core/MenuItem';

import { ELECTRICITY } from '../../constants/config';
import RootDialog from './RootDialog';

class SelectMeterTypeDialog extends React.Component {
  state = {
    type: ELECTRICITY,
  };

  selectMeterTypeForm = null;

  componentWillReceiveProps(nextProps) {
    const { selectedType } = this.props;
    if (selectedType !== nextProps.selectedType) {
      this.setState({
        type: nextProps.selectedType,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { type } = this.state;
    onSubmit(type);
  };

  render() {
    const {
      title, types, isOpened, onClose,
    } = this.props;
    const { type } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.selectMeterTypeForm.submit()}
        submitLabel="Next"
      >
        <ValidatorForm
          ref={(el) => { this.selectMeterTypeForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <SelectValidator
            fullWidth
            label="Meter Type"
            margin="dense"
            onChange={event => this.setState({ type: event.target.value })}
            name="meterType"
            value={type}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {types.map(meterType => (
              <MenuItem key={meterType} value={meterType}>{meterType}</MenuItem>
            ))}
          </SelectValidator>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

SelectMeterTypeDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  types: PropTypes.array.isRequired,
  selectedType: PropTypes.string,
};

SelectMeterTypeDialog.defaultProps = {
  selectedType: ELECTRICITY,
};

export default SelectMeterTypeDialog;
