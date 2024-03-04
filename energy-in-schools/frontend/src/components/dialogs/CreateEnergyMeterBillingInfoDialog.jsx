import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';

import { isFinite as isNumberFinite } from 'lodash';

import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import MenuItem from '@material-ui/core/MenuItem';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { withStyles } from '@material-ui/core/styles';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator';

import RootDialog from './RootDialog';
import { standardValidators, extraValidators } from '../../utils/extraFormValidators';
import PostcodeAutocomplete from '../SchoolRegistration/PostcodeAutocomplete';
import SelfOpenRequiredSelect from '../SchoolRegistration/SelfOpenRequiredSelect';
import InputMpanMprnManually from '../SchoolRegistration/InputMpanMprnManually';
import YesNoRadioGroup from './formControls/YesNoRadioGroup';

import { getMeterRateType } from '../../actions/MUGActions';

import {
  ENERGY_METER_INFO_KEY,
  ENERGY_METER_INFO_KEY_LABEL,
  METER_TYPE_LABEL,
  NOT_AVAILABLE_LABEL,
  FUEL_TYPE_LABEL,
  FUEL_TYPE_METER,
  MUG_METER_RATE_TYPE,
  MUG_METER_RATE_TYPE_LABEL,
  MUG_UNIT_RATE_PERIOD,
  EXCLUDED_ENERGY_METER_INFO_KEY_CREATION,
  CONSUMPTION_BY_UNIT_RATES,
  CONSUMPTION_BY_UNIT_RATES_LABELS,
} from '../SchoolRegistration/constants';

const styles = theme => ({
  fuelTypeBox: {
    display: 'flex',
    flexDirection: 'row',
  },
  consumptionBox: {
    padding: '0px 20px',
  },
  consumptionLabel: {
    marginTop: '20px',
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px',
    },
  },
  errorMessage: {
    fontSize: '12px',
    color: 'red',
  },
  xsFontSize: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px',
    },
  },
  customRootPaper: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  formControlGroup: {
    marginTop: '20px',
    border: '1px groove rgba(0, 0, 0, 0.1)',
    padding: '4px 10px 8px',
  },
  formControlLegend: {
    padding: '0px 2px',
    fontWeight: 600,
  },
  inlineInput: {
    width: '50%',
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
});


class CreateEnergyMeterBillingInfoDialog extends React.Component {
  static createUnitRatesList() {
    return Object.values(MUG_UNIT_RATE_PERIOD).map(ratePeriod => (
      {
        unit_rate_period: ratePeriod,
        unit_rate: '',
        consumption: '',
      }
    ));
  }

  static createNewMeter() {
    const meter = Object.create(null);
    Object.values(ENERGY_METER_INFO_KEY).forEach((key) => {
      if (Object.keys(EXCLUDED_ENERGY_METER_INFO_KEY_CREATION).indexOf(key) === -1) {
        if (key === ENERGY_METER_INFO_KEY.consumption_by_rates) {
          meter[key] = CreateEnergyMeterBillingInfoDialog.createUnitRatesList();
        } else {
          meter[key] = '';
        }
      }
    });
    return meter;
  }

  createEnergyBillingInfoForm = null;

  mugMeterIdsList = null;

  constructor(props) {
    super(props);
    this.state = {
      newMeter: CreateEnergyMeterBillingInfoDialog.createNewMeter(),
      schoolPostcode: '',
      getMetersInProcess: false,
      rateTypeResponseStatus: null,
      hasSolar: false,
      batteryPhysical: false,
      halfHourly: false,
      inputManually: '',
      availableMeters: {
        mpan: [],
        mprn: [],
      },
    };
  }

  componentDidMount() {
    ValidatorForm.addValidationRule(
      'positiveOrN/A',
      value => extraValidators.isEqualToCaseInsensitive(value, NOT_AVAILABLE_LABEL) || standardValidators.isPositive(value),
    );
  }

  componentDidUpdate(prevProps) {
    const { isOpened } = this.props;
    const prevIsOpened = prevProps.isOpened;
    if (prevIsOpened === true && isOpened === false) {
      this.setInitialState();
    }
  }

  onFormSubmit() {
    const { onSubmit } = this.props;
    const {
      newMeter, hasSolar, schoolAddress, batteryPhysical, halfHourly,
    } = this.state;

    const regData = Object.keys(newMeter).reduce((res, key) => {
      switch (key) {
        case ENERGY_METER_INFO_KEY.supplier_id:
        case ENERGY_METER_INFO_KEY.fuel_type:
        case ENERGY_METER_INFO_KEY.meter_type:
        case ENERGY_METER_INFO_KEY.contract_ends_on:
        case ENERGY_METER_INFO_KEY.contract_starts_on:
        case ENERGY_METER_INFO_KEY.meter_id:
        case ENERGY_METER_INFO_KEY.unit_rate_type:
        case ENERGY_METER_INFO_KEY.tpi_name:
        case ENERGY_METER_INFO_KEY.school_address:
          res[key] = newMeter[key];
          break;
        case ENERGY_METER_INFO_KEY.annual_consumption: {
          const valueToNumber = Number(newMeter[key]);
          res[key] = isNumberFinite(valueToNumber) ? valueToNumber * 1000 : null; // kWh to Wh
          break;
        }
        case ENERGY_METER_INFO_KEY.annual_money_spend:
        case ENERGY_METER_INFO_KEY.standing_charge:
        case ENERGY_METER_INFO_KEY.site_capacity:
        case ENERGY_METER_INFO_KEY.solar_capacity:
        case ENERGY_METER_INFO_KEY.capacity_charge:
        case ENERGY_METER_INFO_KEY.battery_capacity:
          res[key] = Number(newMeter[key]);
          break;
        case ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly:
        case ENERGY_METER_INFO_KEY.has_solar:
        case ENERGY_METER_INFO_KEY.is_battery_physical:
          res[key] = Boolean(newMeter[key]);
          break;
        case ENERGY_METER_INFO_KEY.consumption_by_rates: {
          const consumptionByRates = [];
          newMeter[key].forEach((unitRate) => {
            if (unitRate.consumption && unitRate.unit_rate) {
              consumptionByRates.push({
                ...unitRate,
                unit_rate: Number(unitRate.unit_rate),
                consumption: Number(unitRate.consumption),
              });
            }
          });
          res[key] = consumptionByRates;
          break;
        }
        default:
          break;
      }
      return res;
    }, {});

    regData[ENERGY_METER_INFO_KEY.school_address] = schoolAddress;
    regData[ENERGY_METER_INFO_KEY.has_solar] = hasSolar;
    regData[ENERGY_METER_INFO_KEY.is_battery_physical] = batteryPhysical;
    regData[ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly] = halfHourly;

    onSubmit(regData);
  }

  setInitialState = () => {
    this.setState({
      newMeter: CreateEnergyMeterBillingInfoDialog.createNewMeter(),
      schoolPostcode: '',
      getMetersInProcess: false,
      rateTypeResponseStatus: null,
      schoolAddress: '',
      searchByPostcodeFailed: false,
      availableMeters: {
        mpan: [],
        mprn: [],
      },
    });
  }

  setFieldValue = (value, fieldName) => {
    const { newMeter } = this.state;
    newMeter[fieldName] = value;
    this.setState({ newMeter });
  };

  setConsumptionByRatesValue = (value, fieldName, ratePeriodName) => {
    const { newMeter } = this.state;
    const ratePeriod = newMeter.consumption_by_rates.filter(unitRate => unitRate.unit_rate_period === ratePeriodName)[0];
    ratePeriod[fieldName] = value;
    this.setState({ newMeter });
  }

  toggleGetMetersInProcess = () => {
    const { getMetersInProcess } = this.state;
    this.setState({ getMetersInProcess: !getMetersInProcess });
  }

  setPostcode = (value) => {
    this.setState({ schoolPostcode: value });
  }

  setManuallyInputtedId = (e) => {
    const { availableMeters, newMeter } = this.state;
    const meterId = e.target.value;
    availableMeters[FUEL_TYPE_METER[newMeter.fuel_type]].push(meterId);

    this.setState({ availableMeters });
    this.setMeterId(e);
  }

  setMeterId = (e) => {
    const { actions } = this.props;
    const { newMeter } = this.state;
    this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.meter_id);
    if (e.target.value === 'Enter your MPAN/MPRN manually') {
      this.setState({ inputManually: true });
    } else {
      this.setState({ inputManually: false });
      actions.getMeterRateType(newMeter[ENERGY_METER_INFO_KEY.fuel_type], e.target.value)
        .then((response) => {
          newMeter[ENERGY_METER_INFO_KEY.unit_rate_type] = response.data.meter_rate_type;
          this.setState({
            newMeter,
            rateTypeResponseStatus: response.status,
          });
        })
        .catch((error) => {
          console.log(error); // eslint-disable-line no-console
        });
    }
  }

  noContentRateTypeError = () => {
    const { classes } = this.props;
    const { rateTypeResponseStatus } = this.state;

    return rateTypeResponseStatus === 204
      ? (
        <FormHelperText className={classes.errorMessage}>
          There is no rate type for this meter id
        </FormHelperText>
      ) : null;
  }

  updateAddressInfo = (value) => {
    const { newMeter } = this.state;
    const { fullAddress, mpan, mprn } = value;
    const nextState = {
      schoolAddress: fullAddress,
      availableMeters: {
        mpan,
        mprn,
      },
    };

    if (!fullAddress) {
      newMeter[ENERGY_METER_INFO_KEY.meter_id] = '';
      newMeter[ENERGY_METER_INFO_KEY.unit_rate_type] = '';
      nextState.newMeter = newMeter;
    }
    this.setState(nextState);
  }

  render() {
    const {
      classes, isOpened, onClose, title, suppliers,
    } = this.props;
    const {
      schoolPostcode,
      inputManually,
      newMeter,
      getMetersInProcess,
      schoolAddress,
      hasSolar,
      batteryPhysical,
      halfHourly,
      searchByPostcodeFailed,
      availableMeters,
    } = this.state;
    const meterRateType = newMeter[ENERGY_METER_INFO_KEY.unit_rate_type];

    return (
      <RootDialog
        fullWidth
        title={title}
        isOpened={isOpened}
        onClose={onClose}
        closeLabel="Close"
        onSubmit={() => { this.createEnergyBillingInfoForm.submit(); }}
        submitLabel="Create"
        submitButtonDisabled={!meterRateType}
        disableBackdropClick
        classes={{ rootPaper: classes.customRootPaper }}
      >
        <ValidatorForm
          ref={(el) => { this.createEnergyBillingInfoForm = el; }}
          onSubmit={() => { this.onFormSubmit(); }}
        >
          <FormControl fullWidth>
            <FormLabel className={classes.xsFontSize}>
              {ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.fuel_type]}
            </FormLabel>
            <RadioGroup
              className={classes.fuelTypeBox}
              aria-label="fuelType"
              name="fuelType"
              value={newMeter[ENERGY_METER_INFO_KEY.fuel_type]}
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.fuel_type); }}
            >
              {Object.keys(FUEL_TYPE_LABEL).map(item => (
                <FormControlLabel
                  key={item}
                  value={item}
                  control={<Radio color="primary" />}
                  label={item}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <PostcodeAutocomplete
            placeholder="Search Post code *"
            name="postcodeSearch"
            label="School Postal Code"
            value={schoolPostcode || ''}
            onChange={(value) => { this.setPostcode(value); }}
            updateInfo={this.updateAddressInfo}
            informOnResult={(success) => { this.setState({ searchByPostcodeFailed: !success }); }}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          {searchByPostcodeFailed && (
            <div className={classes.errorMessage}>
              We couldn&apos;t get needed address info.
            </div>
          )}
          <TextValidator
            disabled
            fullWidth
            type="text"
            margin="dense"
            name="schoolAddress"
            label={!schoolAddress ? 'School address' : ''}
            value={schoolAddress}
            FormHelperTextProps={{
              classes: {
                root: classes.formHelperTextRoot,
              },
            }}
            InputLabelProps={{
              classes: {
                root: classes.xsFontSize,
              },
            }}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          <SelfOpenRequiredSelect
            ref={(el) => { this.mugMeterIdsList = el; }}
            value={newMeter[ENERGY_METER_INFO_KEY.meter_id]}
            onChange={this.setMeterId}
            name="meter_id"
            label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.meter_id]}
            infoLoading={getMetersInProcess}
            selectItems={availableMeters[FUEL_TYPE_METER[newMeter.fuel_type]] || []}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          {inputManually && (
            <InputMpanMprnManually
              onChange={this.setManuallyInputtedId}
              fuelType={newMeter[ENERGY_METER_INFO_KEY.fuel_type]}
            />
          )}
          {this.noContentRateTypeError()}
          {meterRateType
          && (
          <Box>
            <FormControl fullWidth>
              <FormLabel className={classes.consumptionLabel}>
                {ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.consumption_by_rates]}
              </FormLabel>
              <Box className={classes.consumptionBox}>
                {MUG_METER_RATE_TYPE_LABEL[meterRateType].map((item) => {
                  const itemName = item.toLowerCase();
                  return (
                    <FormControl
                      fullWidth
                      component="fieldset"
                      className={classes.formControlGroup}
                      key={`${item}_rates`}
                    >
                      <FormLabel component="legend" className={classes.formControlLegend}>
                        {newMeter[ENERGY_METER_INFO_KEY.unit_rate_type] === MUG_METER_RATE_TYPE.SINGLE
                          ? 'Annual consumption' : item}
                      </FormLabel>
                      <FormGroup row key={`${itemName}_${CONSUMPTION_BY_UNIT_RATES_LABELS.unit_rate}`}>
                        <TextValidator
                          fullWidth
                          className={classes.inlineInput}
                          type="text"
                          margin="dense"
                          onChange={(e) => { this.setConsumptionByRatesValue(e.target.value, CONSUMPTION_BY_UNIT_RATES.unit_rate, item); }}
                          name={`${itemName}_rate`}
                          label={CONSUMPTION_BY_UNIT_RATES_LABELS.unit_rate}
                          value={newMeter[ENERGY_METER_INFO_KEY.consumption_by_rates].filter(rate => rate.unit_rate_period === item)[0].unit_rate}
                          InputLabelProps={{
                            classes: {
                              root: classes.xsFontSize,
                            },
                          }}
                          InputProps={{
                            endAdornment: (<InputAdornment position="end">p/kWh</InputAdornment>),
                          }}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                          validators={['required', 'isPositive', 'maxNumber:100']}
                          errorMessages={['This field is required', 'only positive numbers are allowed', 'This value should be less than 100']}
                        />
                        <TextValidator
                          fullWidth
                          className={classes.inlineInput}
                          type="text"
                          margin="dense"
                          onChange={(e) => { this.setConsumptionByRatesValue(e.target.value, CONSUMPTION_BY_UNIT_RATES.consumption, item); }}
                          name={`${itemName}_consumption`}
                          label={CONSUMPTION_BY_UNIT_RATES_LABELS.consumption}
                          value={newMeter[ENERGY_METER_INFO_KEY.consumption_by_rates].filter(rate => rate.unit_rate_period === item)[0].consumption}
                          InputLabelProps={{
                            classes: {
                              root: classes.xsFontSize,
                            },
                          }}
                          InputProps={{
                            endAdornment: (<InputAdornment position="end">kWh</InputAdornment>),
                          }}
                          FormHelperTextProps={{
                            classes: {
                              root: classes.formHelperTextRoot,
                            },
                          }}
                          validators={['required', 'isPositive']}
                          errorMessages={['This field is required', 'only positive numbers are allowed']}
                        />
                      </FormGroup>
                    </FormControl>
                  );
                })}
              </Box>
            </FormControl>
            <SelectValidator
              fullWidth
              margin="dense"
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.meter_type); }}
              name="meter_type"
              label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.meter_type]}
              value={newMeter[ENERGY_METER_INFO_KEY.meter_type]}
              FormHelperTextProps={{
                classes: {
                  root: classes.formHelperTextRoot,
                },
              }}
              InputLabelProps={{
                classes: {
                  root: classes.xsFontSize,
                },
              }}
              validators={['required']}
              errorMessages={['This field is required']}
            >
              {Object.keys(METER_TYPE_LABEL).map(item => (
                <MenuItem key={item} value={item}>{METER_TYPE_LABEL[item]}</MenuItem>
              ))}
            </SelectValidator>
            <YesNoRadioGroup
              fullWidth
              value={hasSolar}
              groupLabel={ENERGY_METER_INFO_KEY_LABEL.has_solar}
              name="hasSolar"
              onSubmit={value => this.setState({ hasSolar: value })}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            {hasSolar && (
              <TextValidator
                fullWidth
                type="number"
                margin="dense"
                onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.solar_capacity); }}
                name="solar_capacity"
                label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.solar_capacity]}
                value={newMeter[ENERGY_METER_INFO_KEY.solar_capacity]}
                FormHelperTextProps={{
                  classes: {
                    root: classes.formHelperTextRoot,
                  },
                }}
                InputLabelProps={{
                  classes: {
                    root: classes.xsFontSize,
                  },
                }}
                validators={['required', 'isPositive', 'minNumber:1', 'maxNumber:999999']}
                errorMessages={[
                  'This field is required',
                  'Only positive numbers are allowed',
                  'This value should be bigger than 1',
                  'This value should be less than 6 signs',
                ]}
              />
            )}
            <YesNoRadioGroup
              fullWidth
              value={batteryPhysical}
              groupLabel={ENERGY_METER_INFO_KEY_LABEL.is_battery_physical}
              name="isBatteryPhysical"
              onSubmit={value => this.setState({ batteryPhysical: value })}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            {batteryPhysical && (
              <TextValidator
                fullWidth
                type="number"
                margin="dense"
                onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.battery_capacity); }}
                name="battery_capacity"
                label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.battery_capacity]}
                value={newMeter[ENERGY_METER_INFO_KEY.battery_capacity]}
                FormHelperTextProps={{
                  classes: {
                    root: classes.formHelperTextRoot,
                  },
                }}
                InputLabelProps={{
                  classes: {
                    root: classes.xsFontSize,
                  },
                }}
                validators={['required', 'isPositive', 'minNumber:1', 'maxNumber:999999']}
                errorMessages={[
                  'This field is required',
                  'Only positive numbers are allowed',
                  'This value should be bigger than 1',
                  'This value should be less than 6 signs',
                ]}
              />
            )}
            {newMeter[ENERGY_METER_INFO_KEY.fuel_type] === 'ELECTRICITY' && (
              <div>
                <YesNoRadioGroup
                  fullWidth
                  value={halfHourly}
                  groupLabel={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly]}
                  name="meterType"
                  onSubmit={value => this.setState({ halfHourly: value })}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                {newMeter[ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly] && (
                  <div>
                    <TextValidator
                      fullWidth
                      type="number"
                      margin="dense"
                      onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.site_capacity); }}
                      name="site_capacity"
                      label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.site_capacity]}
                      value={newMeter[ENERGY_METER_INFO_KEY.site_capacity]}
                      FormHelperTextProps={{
                        classes: {
                          root: classes.formHelperTextRoot,
                        },
                      }}
                      InputLabelProps={{
                        classes: {
                          root: classes.xsFontSize,
                        },
                      }}
                      validators={['required', 'isPositive', 'minNumber:1', 'maxStringLength:6']}
                      errorMessages={[
                        'This field is required',
                        'Only positive numbers are allowed',
                        'This value should be bigger than 1',
                        'This value should be less than 6 signs',
                      ]}
                    />
                    <TextValidator
                      fullWidth
                      type="number"
                      margin="dense"
                      onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.capacity_charge); }}
                      name="capacity_charge"
                      label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.capacity_charge]}
                      value={newMeter[ENERGY_METER_INFO_KEY.capacity_charge]}
                      FormHelperTextProps={{
                        classes: {
                          root: classes.formHelperTextRoot,
                        },
                      }}
                      InputLabelProps={{
                        classes: {
                          root: classes.xsFontSize,
                        },
                      }}
                      validators={['required', 'isPositive', 'minStringLength:4', 'maxStringLength:8']}
                      errorMessages={[
                        'This field is required',
                        'Only positive numbers are allowed',
                        'This value should be at least 4 characters long',
                        'This value should be less than 8 characters long',
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
            <TextValidator
              fullWidth
              type="number"
              margin="dense"
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.standing_charge); }}
              name="standing_charge"
              label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.standing_charge]}
              value={newMeter[ENERGY_METER_INFO_KEY.standing_charge]}
              FormHelperTextProps={{
                classes: {
                  root: classes.formHelperTextRoot,
                },
              }}
              InputLabelProps={{
                classes: {
                  root: classes.xsFontSize,
                },
              }}
              validators={['required', 'isPositive', 'maxNumber:9999']}
              errorMessages={['This field is required', 'only positive numbers are allowed', 'this value should be smaller']}
            />
            <SelectValidator
              fullWidth
              classes={{ root: classes.select }}
              margin="dense"
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.supplier_id); }}
              name="supplier_id"
              label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.supplier_id]}
              value={newMeter[ENERGY_METER_INFO_KEY.supplier_id]}
              FormHelperTextProps={{
                classes: {
                  root: classes.formHelperTextRoot,
                },
              }}
              InputLabelProps={{
                classes: {
                  root: classes.xsFontSize,
                },
              }}
              validators={['required']}
              errorMessages={['This field is required']}
            >
              {suppliers.map(supplier => (
                <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
              ))}
            </SelectValidator>
            <TextValidator
              fullWidth
              type="text"
              margin="dense"
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.tpi_name); }}
              name="standing_charge"
              label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.tpi_name]}
              value={newMeter[ENERGY_METER_INFO_KEY.tpi_name]}
              FormHelperTextProps={{
                classes: {
                  root: classes.formHelperTextRoot,
                },
              }}
              InputLabelProps={{
                classes: {
                  root: classes.xsFontSize,
                },
              }}
              validators={['maxStringLength:50']}
              errorMessages={['this field should be shorter than 50 characters']}
            />
            <TextValidator
              fullWidth
              type="date"
              margin="dense"
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.contract_starts_on); }}
              name="contract_starts_on"
              label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.contract_starts_on]}
              value={newMeter[ENERGY_METER_INFO_KEY.contract_starts_on]}
              FormHelperTextProps={{
                classes: {
                  root: classes.formHelperTextRoot,
                },
              }}
              validators={['required']}
              errorMessages={['This field is required']}
              InputLabelProps={{
                shrink: true,
                classes: {
                  root: classes.xsFontSize,
                },
              }}
            />
            <TextValidator
              fullWidth
              type="date"
              margin="dense"
              onChange={(e) => { this.setFieldValue(e.target.value, ENERGY_METER_INFO_KEY.contract_ends_on); }}
              name="contract_ends_on"
              label={ENERGY_METER_INFO_KEY_LABEL[ENERGY_METER_INFO_KEY.contract_ends_on]}
              value={newMeter[ENERGY_METER_INFO_KEY.contract_ends_on]}
              FormHelperTextProps={{
                classes: {
                  root: classes.formHelperTextRoot,
                },
              }}
              validators={['required']}
              errorMessages={['This field is required']}
              InputLabelProps={{
                shrink: true,
                classes: {
                  root: classes.xsFontSize,
                },
              }}
            />
          </Box>
          )}
        </ValidatorForm>
      </RootDialog>
    );
  }
}

CreateEnergyMeterBillingInfoDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  suppliers: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getMeterRateType,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(CreateEnergyMeterBillingInfoDialog);
