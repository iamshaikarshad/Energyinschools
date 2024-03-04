import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm, SelectValidator } from 'react-material-ui-form-validator';

import { isEmpty } from 'lodash';

import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles/index';

import {
  ELECTRICITY, HUMAN_READABLE_METER_TYPES, NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH,
} from '../../constants/config';
import MeterTypeButton from '../MeterTypeButton';
import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';

const DEFAULT_LOCATION_ID_STATE = '';

const styles = theme => ({
  dialogContent: {
    maxWidth: 500,
    paddingTop: 20,
    [theme.breakpoints.down('xs')]: {
      padding: 10,
    },
  },
});

class NewMeterDialog extends React.Component {
  state = {
    name: '',
    description: '',
    meterId: '',
    locationId: DEFAULT_LOCATION_ID_STATE,
    type: ELECTRICITY,
    provider: '',
  };

  createMeterForm = null;

  componentWillReceiveProps(nextProps) {
    const { locationId } = this.state;
    const { selectedProvider, selectedType } = this.props;
    if (selectedProvider !== nextProps.selectedProvider && !isEmpty(nextProps.selectedProvider)) {
      this.setState({
        provider: nextProps.selectedProvider.id,
      });
    }
    if (selectedType !== nextProps.selectedType) {
      this.setState({
        type: nextProps.selectedType,
      });
    }

    if (locationId !== nextProps.selectedLocationId && nextProps.selectedLocationId !== DEFAULT_LOCATION_ID_STATE) {
      this.setState({
        locationId: nextProps.selectedLocationId,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const {
      name, description, meterId, locationId, type, provider,
    } = this.state;
    onSubmit(name, description, meterId, locationId, type, provider);
  };

  render() {
    const {
      classes,
      isOpened,
      onClose,
      locations,
      providers,
      disableProviderSelect,
      title,
      meterTypes,
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
        onSubmit={() => this.createMeterForm.submit()}
        submitLabel="Create"
      >
        <ValidatorForm
          ref={(el) => { this.createMeterForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <SelectValidator
            fullWidth
            label="Energy provider"
            margin="dense"
            onChange={event => this.setState({ provider: event.target.value })}
            name="providerId"
            value={provider}
            disabled={disableProviderSelect}
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
            meterTypes={meterTypes}
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

NewMeterDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  providers: PropTypes.array.isRequired,
  selectedProvider: PropTypes.object,
  disableProviderSelect: PropTypes.bool,
  title: PropTypes.string,
  selectedType: PropTypes.string,
  selectedLocationId: PropTypes.any,
  meterTypes: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
};

NewMeterDialog.defaultProps = {
  selectedProvider: {},
  disableProviderSelect: false,
  title: 'Add new meter',
  selectedType: '',
  selectedLocationId: '',
  meterTypes: HUMAN_READABLE_METER_TYPES,
};

export default compose(withStyles(styles))(NewMeterDialog);
