import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core/styles/index';

import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';

import { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '../../constants/config';

const styles = {
  dialogContent: {
    maxWidth: 500,
  },
};

class EditSmartThingsSensorDialog extends React.Component {
  state = {
    name: '',
    description: '',
    locationId: '',
  };

  editSensorForm = null;

  componentWillReceiveProps(nextProps) {
    const { sensor } = this.props;
    if (sensor !== nextProps.sensor && !isEmpty(nextProps.sensor)) {
      this.setState({
        name: nextProps.sensor.name,
        description: nextProps.sensor.description,
        locationId: nextProps.sensor.sub_location_id,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit, sensor } = this.props;
    const { name, description, locationId } = this.state;
    onSubmit(sensor.id, name, description, locationId);
  };

  render() {
    const {
      isOpened, onClose, classes, locations,
    } = this.props;
    const { name, description, locationId } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title="Edit sensor"
        onSubmit={() => this.editSensorForm.submit()}
        submitLabel="Edit"
      >
        <ValidatorForm
          ref={(el) => { this.editSensorForm = el; }}
          onSubmit={this.onFormSubmit}
        >
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

EditSmartThingsSensorDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  sensor: PropTypes.object.isRequired,
};

export default compose(withStyles(styles))(EditSmartThingsSensorDialog);
