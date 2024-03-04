import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextValidator, SelectValidator, ValidatorForm } from 'react-material-ui-form-validator';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';

import YesNoRadioGroup from '../../dialogs/formControls/YesNoRadioGroup';
import ButtonsSelect from '../../dialogs/formControls/ButtonsSelect';

import {
  GAS_SUPPLIER,
  ELECTRICITY_SUPPLIER,
  RENEWABLE_ENERGY,
  SCHOOL_REGISTRATION_INFO_KEY,
} from '../constants';

const styles = theme => ({
  formContainer: {
    padding: '0px 50px 25px',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: '15px',
      paddingRight: '15px',
    },
  },
  radioInputLabelRoot: {
    fontSize: 12,
    color: '#555555',
  },
  navigationContainer: {
    marginTop: theme.spacing(5),
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(3),
    },
  },
  formControl: {
    marginTop: 15,
  },
  formLabelRoot: {
    marginBottom: theme.spacing(1),
  },
});

const INITIAL_STATE = {
  providersAvailable: true,
  useGas: true,
  gasProvider: '',
  electricityProvider: '',
  useRenewableEnergies: false,
  usedRenewableEnergies: [],
  customGasProvider: '',
  customElectricityProvider: '',
};

class ThirdStep extends React.Component {
  state = this.getInitialState();

  registrationForm = null;

  getInitialState() {
    const { getStoreData, stepName } = this.props;
    const storeData = getStoreData(stepName);
    return storeData ? { ...storeData } : INITIAL_STATE;
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  getGasProviderValue = () => {
    const {
      useGas, gasProvider, customGasProvider, providersAvailable,
    } = this.state;
    if (!useGas || !providersAvailable) return null;
    return gasProvider !== GAS_SUPPLIER.other.value ? gasProvider : customGasProvider;
  }

  getElectricityProviderValue = () => {
    const {
      providersAvailable, electricityProvider, customElectricityProvider,
    } = this.state;
    if (!providersAvailable) return null;
    return electricityProvider !== ELECTRICITY_SUPPLIER.other.value ? electricityProvider : customElectricityProvider;
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    this.saveData();
    onSubmit();
  };

  onSubmitClick = () => {
    this.registrationForm.submit();
  };

  isValid = () => this.registrationForm.isFormValid();

  saveData = () => {
    const { updateStoreData, stepName } = this.props;
    const {
      useRenewableEnergies,
      usedRenewableEnergies,
    } = this.state;
    const regData = {
      [SCHOOL_REGISTRATION_INFO_KEY.gas_provider]: this.getGasProviderValue(),
      [SCHOOL_REGISTRATION_INFO_KEY.electricity_provider]: this.getElectricityProviderValue(),
      [SCHOOL_REGISTRATION_INFO_KEY.used_renewable_energies]: useRenewableEnergies ? usedRenewableEnergies.map(energyType => ({
        renewable_energy_type: energyType,
      })) : [],
    };
    updateStoreData(stepName, this.state, regData);
  }

  render() {
    const { classes, onPrev } = this.props;
    const {
      providersAvailable,
      useGas,
      gasProvider,
      electricityProvider,
      useRenewableEnergies,
      usedRenewableEnergies,
      customGasProvider,
      customElectricityProvider,
    } = this.state;

    return (
      <div className={classes.formContainer}>
        <ValidatorForm
          ref={(el) => { this.registrationForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <YesNoRadioGroup
            fullWidth
            value={providersAvailable}
            groupLabel="Do you know which companies supply your energy needs?"
            name="providersAvailable"
            onSubmit={value => this.setState({ providersAvailable: value })}
          />
          {providersAvailable && (
            <YesNoRadioGroup
              fullWidth
              value={useGas}
              groupLabel="Does your school use Natural gas?"
              name="useGas"
              onSubmit={value => this.setState({ useGas: value })}
            />
          )}
          {(useGas && providersAvailable) && (
            <React.Fragment>
              <SelectValidator
                fullWidth
                label="Select your gas supplier *"
                margin="dense"
                onChange={event => this.setState({ gasProvider: event.target.value })}
                name="gasProvider"
                value={gasProvider}
                validators={['required']}
                errorMessages={['This field is required']}
              >
                {Object.values(GAS_SUPPLIER).map(item => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </SelectValidator>
              {gasProvider === GAS_SUPPLIER.other.value && (
                <TextValidator
                  fullWidth
                  label="Gas supplier name"
                  margin="dense"
                  onChange={event => this.setState({ customGasProvider: event.target.value })}
                  name="customGasProvider"
                  value={customGasProvider}
                  validators={['required', 'trim', 'maxStringLength:50']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 50 symbols']}
                />
              )}
            </React.Fragment>
          )}
          {providersAvailable && (
            <React.Fragment>
              <SelectValidator
                fullWidth
                label="Select your electricity supplier *"
                margin="dense"
                onChange={event => this.setState({ electricityProvider: event.target.value })}
                name="electricityProvider"
                value={electricityProvider}
                validators={['required']}
                errorMessages={['This field is required']}
              >
                {Object.values(ELECTRICITY_SUPPLIER).map(item => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </SelectValidator>
              {electricityProvider === ELECTRICITY_SUPPLIER.other.value && (
                <TextValidator
                  fullWidth
                  label="Electricity supplier name"
                  margin="dense"
                  onChange={event => this.setState({ customElectricityProvider: event.target.value })}
                  name="customElectricityProvider"
                  value={customElectricityProvider}
                  validators={['required', 'trim', 'maxStringLength:50']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 50 symbols']}
                />
              )}
            </React.Fragment>
          )}
          <YesNoRadioGroup
            fullWidth
            value={useRenewableEnergies}
            groupLabel="Does your school have any Renewable Energy Systems on Site?"
            name="useRenewableEnergies"
            onSubmit={value => this.setState({ useRenewableEnergies: value })}
          />
          {useRenewableEnergies && (
            <FormControl component="fieldset" className={classes.formControl} fullWidth>
              <FormLabel component="legend" classes={{ root: classes.formLabelRoot }}>Select renewable energy types from below: </FormLabel>
              <ButtonsSelect
                mode="plural"
                buttons={Object.values(RENEWABLE_ENERGY)}
                name="usedRenewableEnergies"
                value={usedRenewableEnergies}
                onSubmit={value => this.setState({ usedRenewableEnergies: value })}
                gridSize={{ xs: 4 }}
                useLabels
              />
            </FormControl>
          )}
        </ValidatorForm>
        <Grid container className={classes.navigationContainer}>
          <Button onClick={onPrev} color="primary">
            Previous
          </Button>
          <Button onClick={this.onSubmitClick} color="primary">
            Next
          </Button>
        </Grid>
      </div>
    );
  }
}

ThirdStep.propTypes = {
  classes: PropTypes.object.isRequired,
  stepName: PropTypes.string.isRequired,
  getStoreData: PropTypes.func.isRequired,
  updateStoreData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(ThirdStep);
