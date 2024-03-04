import React from 'react';
import { isEqual, isEmpty } from 'lodash';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import MenuItem from '@material-ui/core/MenuItem';

import { withStyles } from '@material-ui/core/styles/index';

import MeterTypeButton from '../MeterTypeButton';
import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';

import { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '../../constants/config';

const styles = {
  dialogContent: {
    maxWidth: 500,
  },
};

class NewEditMeterDialog extends React.Component {
  state = {
    id: '',
    name: '',
    description: '',
    meterId: '',
    locationId: '',
    type: '',
    provider: '',
  };

  editMeterForm = null;

  componentWillReceiveProps(nextProps) {
    const { meter } = this.props;
    if (!isEqual(meter, nextProps.meter) && !isEmpty(nextProps.meter)) {
      this.setState({
        id: nextProps.meter.id,
        name: nextProps.meter.name,
        description: nextProps.meter.description,
        meterId: nextProps.meter.meter_id,
        locationId: nextProps.meter.sub_location,
        type: nextProps.meter.type,
        provider: nextProps.meter.provider_account,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit(this.state);
  };

  render() {
    const {
      classes, isOpened, onClose, locations, providers, title,
    } = this.props;
    const {
      name, description, meterId, locationId, type, provider,
    } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.editMeterForm.submit()}
        submitLabel="Save"
      >
        <ValidatorForm
          ref={(el) => { this.editMeterForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <SelectValidator
            fullWidth
            label="Energy provider"
            margin="dense"
            onChange={event => this.setState({ provider: event.target.value })}
            name="providerId"
            value={provider}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {providers.map(prov => (
              <MenuItem key={prov.id} value={prov.id}>{prov.name}</MenuItem>
            ))}
          </SelectValidator>
          <MeterTypeButton
            name="meterType"
            value={type}
            selectedType={type}
            onTypeChange={selectedType => this.setState({ type: selectedType })}
            validators={['required']}
            errorMessages={['Select please meter type']}
          />
          <TextValidator
            fullWidth
            label="Meter ID"
            margin="dense"
            onChange={event => this.setState({ meterId: event.target.value })}
            name="meterId"
            value={meterId}
            validators={['required']}
            errorMessages={['This field is required']}
          />
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

NewEditMeterDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  providers: PropTypes.array.isRequired,
  meter: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(NewEditMeterDialog);
