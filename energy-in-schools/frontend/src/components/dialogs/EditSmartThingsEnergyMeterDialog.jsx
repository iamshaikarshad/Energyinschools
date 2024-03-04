import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, SelectValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { isEqual, isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core/styles/index';

import MenuItem from '@material-ui/core/MenuItem';

import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';

import {
  SMART_THINGS_ENERGY_METER_TYPES, NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH,
} from '../../constants/config';

const styles = {
  dialogContent: {
    maxWidth: 500,
  },
};

class EditSmartThingsEnergyMeterDialog extends React.Component {
  state = {
    name: '',
    description: '',
    locationId: '',
    meterType: '',
  };

  editSmartThingsEnergyMeterForm = null;

  componentWillReceiveProps(nextProps) {
    const { meter } = this.props;
    if (!isEqual(meter, nextProps.meter) && !isEmpty(nextProps.meter)) {
      this.setState({
        name: nextProps.meter.name,
        description: nextProps.meter.description,
        locationId: nextProps.meter.sub_location_id,
        meterType: nextProps.meter.type,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit, meter } = this.props;
    const {
      name, description, locationId, meterType,
    } = this.state;
    onSubmit(meter.id, name, description, locationId, meterType);
  };

  render() {
    const {
      isOpened, onClose, classes, locations, title,
    } = this.props;
    const {
      name, description, locationId, meterType,
    } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.editSmartThingsEnergyMeterForm.submit()}
        submitLabel="Edit"
      >
        <ValidatorForm
          ref={(el) => { this.editSmartThingsEnergyMeterForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <SelectValidator
            fullWidth
            label="Meter type"
            margin="dense"
            onChange={event => this.setState({ meterType: event.target.value })}
            name="meterType"
            value={meterType}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {SMART_THINGS_ENERGY_METER_TYPES.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </SelectValidator>
          <LocationSelectControl
            isValidated
            locations={locations}
            fullWidth
            label="Location"
            margin="dense"
            onChange={event => this.setState({ locationId: event.target.value })}
            name="locationId"
            value={locationId}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          <TextValidator
            autoComplete="off"
            type="text"
            fullWidth
            label="Name"
            margin="dense"
            onChange={event => this.setState({ name: event.target.value })}
            name="name"
            value={name}
            validators={['required', 'matchRegexp:^[\\w()\\s&-]+$', 'trim', `maxStringLength:${NAME_MAX_LENGTH}`]}
            errorMessages={[
              'This field is required',
              'Only letters, numbers, \'-\', \'_\', \'&\' and parentheses are allowed',
              'No blank text',
              `No more than ${NAME_MAX_LENGTH} symbols`,
            ]}
          />
          <TextValidator
            multiline
            rows={3}
            rowsMax={5}
            fullWidth
            label="Details"
            margin="dense"
            onChange={event => this.setState({ description: event.target.value })}
            name="description"
            value={description}
            validators={[`maxStringLength:${DESCRIPTION_MAX_LENGTH}`]}
            errorMessages={[`No more than ${DESCRIPTION_MAX_LENGTH} symbols`]}
          />
        </ValidatorForm>
      </RootDialog>
    );
  }
}

EditSmartThingsEnergyMeterDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  meter: PropTypes.object.isRequired,
  title: PropTypes.string,
};

EditSmartThingsEnergyMeterDialog.defaultProps = {
  title: 'Edit',
};

export default compose(withStyles(styles))(EditSmartThingsEnergyMeterDialog);
