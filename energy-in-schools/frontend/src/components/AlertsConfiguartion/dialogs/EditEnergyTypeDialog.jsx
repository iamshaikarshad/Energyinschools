import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { ValidatorForm, SelectValidator } from 'react-material-ui-form-validator';

import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles/index';
import { ENERGY_ALERTS_TYPE } from '../constants';
import RootDialog from '../../dialogs/RootDialog';


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

class EditEnergyTypeDialog extends React.Component {
  state = {
    alertType: '',
  };

  editEnergyTypeDialog = null;

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        alertType: nextProps.alertType,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const {
      alertType,
    } = this.state;

    onSubmit(alertType);
  };

  getEnergyTypeListItems = () => {
    const { alertType } = this.state;
    if (alertType.includes('level')) {
      return [
        <MenuItem key={ENERGY_ALERTS_TYPE.electricity_level} value={ENERGY_ALERTS_TYPE.electricity_level}>Electricity</MenuItem>,
        <MenuItem key={ENERGY_ALERTS_TYPE.gas_level} value={ENERGY_ALERTS_TYPE.gas_level}>Gas</MenuItem>,
        <MenuItem key={ENERGY_ALERTS_TYPE.temperature_level} value={ENERGY_ALERTS_TYPE.temperature_level}>Temperature</MenuItem>,
      ];
    }

    return [
      <MenuItem key={ENERGY_ALERTS_TYPE.electricity_daily} value={ENERGY_ALERTS_TYPE.electricity_daily}>Electricity</MenuItem>,
      <MenuItem key={ENERGY_ALERTS_TYPE.gas_daily} value={ENERGY_ALERTS_TYPE.gas_daily}>Gas</MenuItem>,
    ];
  };

  render() {
    const { classes, isOpened, onClose } = this.props;
    const { alertType } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title="Set new energy type"
        onSubmit={() => this.editEnergyTypeDialog.submit()}
        submitLabel="OK"
        classes={{ dialogContent: classes.dialogContent }}
      >
        <ValidatorForm
          ref={(el) => { this.editEnergyTypeDialog = el; }}
          onSubmit={this.onFormSubmit}
        >
          <SelectValidator
            style={{ marginBottom: 20 }}
            fullWidth
            label="Energy type"
            margin="dense"
            onChange={event => this.setState({ alertType: event.target.value })}
            name="alertType"
            value={alertType}
            validators={['required']}
            errorMessages={['This field is required']}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          >
            {this.getEnergyTypeListItems()}
          </SelectValidator>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

EditEnergyTypeDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  alertType: PropTypes.string.isRequired,
};

export default compose(withStyles(styles))(EditEnergyTypeDialog);
