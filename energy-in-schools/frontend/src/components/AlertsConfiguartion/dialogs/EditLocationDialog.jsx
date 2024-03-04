import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { ValidatorForm, SelectValidator } from 'react-material-ui-form-validator';

import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles/index';
import { ALERT_TYPE_TO_METER_LABEL, ENERGY_ALERTS_TYPE } from '../constants';
import RootDialog from '../../dialogs/RootDialog';
import LocationSelectControl from '../../LocationSelectControl';

const styles = theme => ({
  dialogContent: {
    width: 500,
    paddingTop: 20,
    [theme.breakpoints.down('xs')]: {
      maxWidth: 300,
      padding: 10,
    },
  },
  textInputLabelRoot: {
    fontSize: 16,
    color: '#b5b5b5',
  },
  textInputHelperRoot: {
    fontSize: 12,
    color: '#b5b5b5',
    marginBottom: 10,
  },
});

class EditLocationDialog extends React.Component {
  state = {
    meter: {},
    location: {},
  };

  editLocationDialog = null;

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        meter: nextProps.meter,
        location: nextProps.location,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const {
      location, meter,
    } = this.state;

    onSubmit(location, meter);
  };

  getMeters = () => {
    const { allMeters, alertType } = this.props;
    const { location } = this.state;
    const metersByLocation = alertType === ENERGY_ALERTS_TYPE.temperature_level
      ? allMeters.temperature.filter(meter => meter.sub_location_id === location.id)
      : allMeters.energy.filter(meter => meter.type.toLowerCase() === ALERT_TYPE_TO_METER_LABEL[alertType].toLowerCase()
        && meter.sub_location === location.id);
    return metersByLocation;
  };

  render() {
    const {
      classes, isOpened, onClose, locations,
    } = this.props;
    const {
      location, meter,
    } = this.state;

    const meters = this.getMeters();

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title="Set new location or meter"
        onSubmit={() => this.editLocationDialog.submit()}
        submitLabel="OK"
        classes={{ dialogContent: classes.dialogContent }}
      >
        <ValidatorForm
          ref={(el) => { this.editLocationDialog = el; }}
          onSubmit={this.onFormSubmit}
        >
          <LocationSelectControl
            isValidated
            locations={locations}
            fullWidth
            label="Location"
            margin="dense"
            onChange={event => this.setState({ location: locations.find(loc => loc.id === event.target.value), meter: {} })}
            name="location"
            value={location.id}
            validators={['required']}
            errorMessages={['This field is required']}
            style={{ marginBottom: 20 }}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          />
          <SelectValidator
            style={{ marginBottom: 20 }}
            fullWidth
            label="Select meter (optional)"
            margin="dense"
            onChange={event => this.setState({ meter: meters.find(mtr => mtr.id === event.target.value) || {} })}
            name="meterId"
            value={meter.id || 'all'}
            validators={['required']}
            errorMessages={['This field is required']}
            SelectProps={{ displayEmpty: true }}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          >
            <MenuItem value="all">All meters in location</MenuItem>
            {meters.map(mtr => (
              <MenuItem key={mtr.id} value={mtr.id}>{mtr.name}</MenuItem>
            ))}
          </SelectValidator>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

EditLocationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  alertType: PropTypes.string.isRequired,
  meter: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  locations: PropTypes.array.isRequired,
  allMeters: PropTypes.shape({
    temperature: PropTypes.array.isRequired,
    energy: PropTypes.array.isRequired,
  }).isRequired,
};

export default compose(withStyles(styles))(EditLocationDialog);
