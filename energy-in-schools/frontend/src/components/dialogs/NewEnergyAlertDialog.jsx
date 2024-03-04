import React from 'react';
import moment from 'moment';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles/index';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

import {
  ACTIVE_DAYS,
  ALERT_FREQUENCIES,
  AVAILABLE_LIMIT_PERIODS,
  ENERGY_ALERTS_TYPE,
  NOTIFICATION_TYPES,
  ALERT_TYPE_TO_METER_LABEL,
  TYPE_ENERGY_TO_ALERT_TYPE,
  ALERT_ACTIVE_DAYS_TYPE_TO_LABEL,
  ALERT_FREQUENCY_TYPE_TO_LABEL,
  ALERT_TYPE_TO_LABEL, LIMIT_ALERT_CONDITION_TYPES,
  LIMIT_ALERT_CONDITION_TYPE_TO_LABEL,
  ENERGY_ALERTS_TYPE_TO_UNIT,
} from '../AlertsConfiguartion/constants';

import CheckBoxGroupValidator from './formControls/CheckBoxGroupValidator';
import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';
import { UNIT_TO_LABEL_MAP } from '../../constants/config';

const styles = theme => ({
  rootPaper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: 24,
      marginRight: 24,
    },
  },
  dialogContent: {
    paddingTop: 10,
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
    [theme.breakpoints.down('xs')]: {
      padding: '10px 10px 15px',
    },
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '28px auto',
    textAlign: 'center',
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
  radioInputLabelRoot: {
    fontSize: 12,
    color: '#555555',
  },
  conditionSelect: {
    width: '100%',
  },
});

const ENERGY_ALERTS_TYPE_TO_DIMENSION_LABEL = {
  [ENERGY_ALERTS_TYPE.temperature_level]: 'Temperature',
  [ENERGY_ALERTS_TYPE.electricity_daily]: 'Energy',
  [ENERGY_ALERTS_TYPE.electricity_level]: 'Energy',
  [ENERGY_ALERTS_TYPE.gas_daily]: 'Energy',
  [ENERGY_ALERTS_TYPE.gas_level]: 'Energy',
};

class NewEnergyAlertDialog extends React.Component {
  state = {
    type: 'limit',
    name: '',
    email: '',
    additionalEmail: '',
    phoneNumber: '',
    limitCondition: LIMIT_ALERT_CONDITION_TYPES.greater,
    alertType: ENERGY_ALERTS_TYPE.electricity_level,
    alertFrequency: ALERT_FREQUENCIES.onceHour,
    activeDays: ACTIVE_DAYS.allDays,
    meterId: '',
    locationId: '',
    energyLimit: '',
    limitDuration: '',
    limitPeriodStart: '',
    limitPeriodEnd: '',
    differencePercentage: '',
    notificationTypes: [
      {
        label: 'Email',
        value: NOTIFICATION_TYPES.email,
        checked: false,
      },
      {
        label: 'SMS',
        value: NOTIFICATION_TYPES.sms,
        checked: false,
      },
    ],
  };

  createAlertForm = null;

  componentDidMount() {
    ValidatorForm.addValidationRule('atLeastOneChecked', values => values.some(value => value.checked));
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const { notificationTypes, meterId } = this.state;

    const notifyVia = notificationTypes.filter(type => type.checked).map(type => type.value);
    onSubmit(notifyVia, { ...this.state, meterId: ['', 'all'].includes(meterId) ? null : meterId });
  };

  onNotificationTypeChange = (changedType) => {
    const { notificationTypes } = this.state;
    const copy = JSON.parse(JSON.stringify(notificationTypes));
    const newValue = copy.map((type) => {
      if (type.value === changedType.value) {
        // eslint-disable-next-line no-param-reassign
        type.checked = !type.checked;
      }
      return type;
    });
    this.setState({
      notificationTypes: newValue,
    });
  };

  onMeterTypeChange = (event) => {
    const newAlertType = event.target.value;
    if (newAlertType === ENERGY_ALERTS_TYPE.temperature_level) {
      this.setState({ type: 'limit', alertType: newAlertType });
    }
    this.setState({ alertType: newAlertType });
  };

  onAlertTypeChange = (event) => {
    const { alertType, alertFrequency } = this.state;
    const newType = event.target.value;
    const energyType = ALERT_TYPE_TO_METER_LABEL[alertType];
    this.setState({
      type: newType,
      meterId: '',
      alertType: TYPE_ENERGY_TO_ALERT_TYPE[newType][energyType],
      alertFrequency: newType === 'usage' ? ALERT_FREQUENCIES.onceDay : alertFrequency,
    });
  };

  getDifferenceAlertTypeFields = () => {
    const { classes } = this.props;
    const { differencePercentage } = this.state;
    return (
      <React.Fragment>
        <TextValidator
          style={{ marginBottom: 20 }}
          fullWidth
          label="XX% higher usage"
          margin="dense"
          onChange={event => this.setState({ differencePercentage: event.target.value })}
          name="energyLimit"
          value={differencePercentage}
          validators={['required', 'isNumber', 'minNumber:0']}
          errorMessages={['This field is required', 'Value should be valid number', 'Minimum value is 0']}
          InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
        />
      </React.Fragment>
    );
  };

  getMeterTypes = () => {
    const { alertType } = this.state;
    const { classes } = this.props;
    let alertTypes = [ENERGY_ALERTS_TYPE.electricity_daily, ENERGY_ALERTS_TYPE.gas_daily, ENERGY_ALERTS_TYPE.temperature_level];
    if (alertType.includes('level')) {
      alertTypes = [ENERGY_ALERTS_TYPE.electricity_level, ENERGY_ALERTS_TYPE.gas_level, ENERGY_ALERTS_TYPE.temperature_level];
    }

    return alertTypes.map(type => (
      <FormControlLabel
        key={type}
        value={type}
        control={<Radio color="primary" />}
        label={ALERT_TYPE_TO_METER_LABEL[type]}
        classes={{ label: classes.radioInputLabelRoot }}
      />
    ));
  };

  getLimitAlertTypeFields = () => {
    const { classes } = this.props;
    const {
      alertType, energyLimit, limitDuration, limitCondition,
    } = this.state;

    const unitLabel = UNIT_TO_LABEL_MAP[ENERGY_ALERTS_TYPE_TO_UNIT[alertType]];
    const dimensionLabel = ENERGY_ALERTS_TYPE_TO_DIMENSION_LABEL[alertType];
    return (
      <React.Fragment>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} style={{ marginTop: 5 }}>
            <FormControl className={classes.conditionSelect}>
              <InputLabel shrink htmlFor="age-label-placeholder">
                Limit condition
              </InputLabel>
              <Select
                value={limitCondition}
                onChange={event => this.setState({ limitCondition: event.target.value })}
                input={<Input name="limitCondition" />}
                displayEmpty
                name="limitCondition"
              >
                {LIMIT_ALERT_CONDITION_TYPE_TO_LABEL.map(condition => (
                  <MenuItem key={condition.type} value={condition.type}>{condition.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={8}>
            <TextValidator
              fullWidth
              label={`${dimensionLabel} limit (${unitLabel})`}
              margin="dense"
              onChange={event => this.setState({ energyLimit: event.target.value })}
              name="energyLimit"
              value={energyLimit}
              validators={['required', 'isFloat', 'minNumber:0']}
              errorMessages={['This field is required', 'Value should be valid number', 'Minimum value is 0']}
              InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            />
          </Grid>
        </Grid>
        <TextValidator
          fullWidth
          label={`${dimensionLabel} limit duration (minutes)`}
          margin="dense"
          onChange={event => this.setState({ limitDuration: event.target.value })}
          name="limitDuration"
          value={limitDuration}
          validators={['required', 'isNumber', 'minNumber:0']}
          errorMessages={['This field is required', 'Value should be valid number', 'Minimum value is 0']}
          InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
        />
      </React.Fragment>
    );
  };

  getMeterChoices = () => {
    const { allMeters } = this.props;
    const { alertType, locationId } = this.state;
    const metersByLocation = alertType === ENERGY_ALERTS_TYPE.temperature_level
      ? allMeters.temperature.filter(meter => meter.sub_location_id === locationId)
      : allMeters.energy.filter(meter => meter.type.toLowerCase() === ALERT_TYPE_TO_METER_LABEL[alertType].toLowerCase()
        && meter.sub_location === locationId);
    return metersByLocation.map(meter => (
      <MenuItem key={meter.id} value={meter.id}>{meter.name}</MenuItem>
    ));
  };

  notificationSelected = (typeValue) => {
    const { notificationTypes } = this.state;
    const notification = notificationTypes.filter(type => type.value === typeValue)[0];
    return notification.checked;
  };

  render() {
    const {
      classes, isOpened, onClose, locations, width,
    } = this.props;
    const {
      type,
      name,
      email,
      additionalEmail,
      meterId,
      locationId,
      notificationTypes,
      phoneNumber,
      alertFrequency,
      alertType,
      activeDays,
      limitPeriodStart,
      limitPeriodEnd,
    } = this.state;

    const meterChoices = this.getMeterChoices();

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title="Set new alert applet"
        onSubmit={() => this.createAlertForm.submit()}
        submitLabel="Create"
      >
        <ValidatorForm
          ref={(el) => {
            this.createAlertForm = el;
          }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            fullWidth
            label="Alert applet name"
            margin="dense"
            onChange={event => this.setState({ name: event.target.value })}
            name="name"
            value={name}
            validators={['required']}
            helperText="Create easy name"
            errorMessages={['This field is required']}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          />
          <LocationSelectControl
            isValidated
            locations={locations}
            style={{ marginBottom: 20 }}
            fullWidth
            label="Select location"
            margin="dense"
            onChange={event => this.setState({ locationId: event.target.value, meterId: '' })}
            name="locationId"
            value={locationId}
            validators={['required']}
            errorMessages={['This field is required']}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          />
          <SelectValidator
            disabled={locationId === ''}
            style={{ marginBottom: 20 }}
            fullWidth
            label="Select meter (optional)"
            margin="dense"
            onChange={event => this.setState({ meterId: event.target.value })}
            name="meterId"
            value={meterId}
            validators={[]}
            errorMessages={[]}
            SelectProps={{ displayEmpty: true }}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          >
            <MenuItem value="all">All meters in location</MenuItem>
            {meterChoices}
          </SelectValidator>
          <FormLabel classes={{ root: classes.radioInputLabelRoot }}>
            Select alert type
          </FormLabel>
          <RadioGroup
            row
            aria-label="alertType"
            name="alertType"
            value={type}
            onChange={this.onAlertTypeChange}
            style={{ justifyContent: 'space-around' }}
          >
            {
              ALERT_TYPE_TO_LABEL.map(alert => (
                <FormControlLabel
                  disabled={alertType === ENERGY_ALERTS_TYPE.temperature_level && alert.type === 'usage'}
                  key={alert.type}
                  value={alert.type}
                  control={<Radio color="primary" />}
                  label={alert.label}
                  classes={{ label: classes.radioInputLabelRoot }}
                />
              ))
            }
          </RadioGroup>
          {alertType.includes('level') ? this.getLimitAlertTypeFields() : this.getDifferenceAlertTypeFields()}
          <SelectValidator
            style={{ marginBottom: 20 }}
            fullWidth
            label="Select period"
            margin="dense"
            onChange={(event) => {
              const selectedPeriod = AVAILABLE_LIMIT_PERIODS.find(period => event.target.value === period.from + period.to);
              this.setState({ limitPeriodStart: selectedPeriod.from, limitPeriodEnd: selectedPeriod.to });
            }}
            name="locationId"
            value={limitPeriodStart + limitPeriodEnd}
            validators={['required']}
            errorMessages={['This field is required']}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          >
            {
              AVAILABLE_LIMIT_PERIODS.map((period) => {
                const periodStr = `${moment(period.from, 'HH:mm:ss').format('h:mm A')} to ${moment(period.to, 'HH:mm:ss').format('h:mm A')}`;
                return (
                  <MenuItem key={periodStr} value={period.from + period.to}>
                    {periodStr}
                  </MenuItem>
                );
              })
            }
          </SelectValidator>
          <FormLabel component="legend" classes={{ root: classes.radioInputLabelRoot }}>Notificate via</FormLabel>
          <CheckBoxGroupValidator
            validators={['atLeastOneChecked']}
            errorMessages={['At least one notification type should be checked']}
            name="notifications"
            value={notificationTypes}
            onChange={notification => this.onNotificationTypeChange(notification)}
          />
          {this.notificationSelected(NOTIFICATION_TYPES.email) && (
          <React.Fragment>
            <TextValidator
              fullWidth
              label="Email address"
              margin="dense"
              onChange={event => this.setState({ email: event.target.value })}
              name="email"
              value={email}
              validators={['required', 'isEmail']}
              errorMessages={['This field is required', 'Invalid email address']}
              InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
              FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
            />
            <TextValidator
              fullWidth
              label="Additional email address"
              margin="dense"
              onChange={event => this.setState({ additionalEmail: event.target.value })}
              name="additionalEmail"
              value={additionalEmail}
              validators={['isEmail']}
              errorMessages={['Invalid email address']}
              InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
              FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
            />
          </React.Fragment>
          )}
          {this.notificationSelected(NOTIFICATION_TYPES.sms) && (
          <TextValidator
            fullWidth
            label="Phone number"
            margin="dense"
            onChange={event => this.setState({ phoneNumber: event.target.value })}
            name="phoneNumber"
            value={phoneNumber}
            validators={['required']}
            errorMessages={['This field is required']}
            InputLabelProps={{ classes: { root: classes.textInputLabelRoot } }}
            FormHelperTextProps={{ classes: { root: classes.textInputHelperRoot } }}
          />
          )}
          <FormLabel component="p" classes={{ root: classes.radioInputLabelRoot }} style={{ margin: '10px 0px 0px' }}>
            Alerts frequency
          </FormLabel>
          <RadioGroup
            row
            aria-label="alertFrequency"
            name="alertFrequency"
            value={alertFrequency}
            onChange={event => this.setState({ alertFrequency: event.target.value })}
            style={{ justifyContent: 'space-around' }}
          >
            {
              ALERT_FREQUENCY_TYPE_TO_LABEL.map(frequency => (
                <FormControlLabel
                  disabled={alertType.includes('usage') && frequency.type === ALERT_FREQUENCIES.onceHour}
                  key={frequency.type}
                  value={frequency.type}
                  control={<Radio color="primary" />}
                  label={frequency.label}
                  classes={{ label: classes.radioInputLabelRoot }}
                />
              ))
            }
          </RadioGroup>
          <FormLabel component="p" classes={{ root: classes.radioInputLabelRoot }} style={{ margin: '10px 0px 0px' }}>
            Alerts days
          </FormLabel>
          <RadioGroup
            row={isWidthUp('md', width)}
            aria-label="alertDays"
            name="alertDays"
            value={activeDays}
            onChange={event => this.setState({ activeDays: event.target.value })}
            style={{ justifyContent: 'space-around' }}
          >
            {
              ALERT_ACTIVE_DAYS_TYPE_TO_LABEL.map(activeDay => (
                <FormControlLabel
                  key={activeDay.type}
                  value={activeDay.type}
                  control={<Radio color="primary" />}
                  label={activeDay.label}
                  classes={{ label: classes.radioInputLabelRoot }}
                />
              ))
            }
          </RadioGroup>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

NewEnergyAlertDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  allMeters: PropTypes.shape({
    temperature: PropTypes.array.isRequired,
    energy: PropTypes.array.isRequired,
  }).isRequired,
};

export default compose(
  withStyles(styles),
  withWidth(),
)(NewEnergyAlertDialog);
