import React from 'react';
import PropTypes from 'prop-types';
import { ValidatorForm } from 'react-material-ui-form-validator';

import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';

class EditDatasetLocationDialog extends React.Component {
  state = {
    datasetId: '',
    locationId: '',
  };

  editLocationForm = null;

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        datasetId: nextProps.dataset.id || '',
        locationId: nextProps.dataset.sub_location_id || '',
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const {
      datasetId, locationId,
    } = this.state;
    onSubmit(datasetId, locationId);
  };

  render() {
    const {
      isOpened, onClose, locations,
    } = this.props;
    const {
      locationId,
    } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title="Edit dataset location"
        onSubmit={() => this.editLocationForm.submit()}
        submitLabel="Edit"
      >
        <ValidatorForm
          ref={(el) => { this.editLocationForm = el; }}
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
        </ValidatorForm>
      </RootDialog>
    );
  }
}

EditDatasetLocationDialog.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  dataset: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

EditDatasetLocationDialog.defaultProps = {
  dataset: {},
};

export default EditDatasetLocationDialog;
