import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import red from '@material-ui/core/colors/red';
import CityAutocomplete from '../CityAutocomplete';
import PostcodeAutocomplete from '../PostcodeAutocomplete';
import YesNoRadioGroup from '../../dialogs/formControls/YesNoRadioGroup';

import { SCHOOL_REGISTRATION_INFO_KEY, ADDRESS_FIELD } from '../constants';

const red500 = red['500'];

const styles = theme => ({
  formContainer: {
    padding: '0px 50px 25px',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: '15px',
      paddingRight: '15px',
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
  navigationContainer: {
    marginTop: theme.spacing(5),
    justifyContent: 'flex-end',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(3),
    },
  },
  inlineInput: {
    width: '50%',
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      paddingRight: 0,
    },
  },
  searchFailedInfo: {
    padding: theme.spacing(1),
    fontSize: 16,
    color: red500,
  },
  customHelperText: {
    fontSize: 12,
  },
});

const INITIAL_STATE = {
  searchByPostcode: true,
  searchByPostcodeFailed: false,
  email: '',
  schoolNickname: '',
  schoolName: '',
  schoolCity: '',
  schoolCitySearch: null,
  schoolAddressLine1: '',
  schoolAddressLine2: '',
  schoolDescription: '',
  schoolPostcode: '',
  schoolLatitude: null,
  schoolLongitude: null,
  schoolManagerFirstName: '',
  schoolManagerLastName: '',
  schoolManagerJobRole: '',
  schoolManagerEmail: '',
  schoolManagerPhoneNumber: '',
  isUtilitiesManager: true,
  utilitiesManagerAvailable: false,
  utilitiesManagerFirstName: '',
  utilitiesManagerLastName: '',
  utilitiesManagerJobRole: '',
  utilitiesManagerEmail: '',
  utilitiesManagerPhoneNumber: '',
  itManagerAvailable: false,
  itManagerFirstName: '',
  itManagerLastName: '',
  itManagerJobRole: '',
  itsManagerEmail: '',
  itManagerPhoneNumber: '',
  itManagerCompanyName: '',
};

class FirstStep extends React.Component {
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

  getUtilitiesManager = () => {
    const {
      isUtilitiesManager,
      utilitiesManagerAvailable,
      schoolManagerFirstName,
      schoolManagerLastName,
      schoolManagerJobRole,
      schoolManagerEmail,
      schoolManagerPhoneNumber,
      utilitiesManagerFirstName,
      utilitiesManagerLastName,
      utilitiesManagerJobRole,
      utilitiesManagerEmail,
      utilitiesManagerPhoneNumber,
    } = this.state;

    if (!isUtilitiesManager && !utilitiesManagerAvailable) return null;
    return isUtilitiesManager ? {
      first_name: schoolManagerFirstName,
      last_name: schoolManagerLastName,
      job_role: schoolManagerJobRole,
      email: schoolManagerEmail,
      phone_number: schoolManagerPhoneNumber,
    } : {
      first_name: utilitiesManagerFirstName,
      last_name: utilitiesManagerLastName,
      job_role: utilitiesManagerJobRole,
      email: utilitiesManagerEmail,
      phone_number: utilitiesManagerPhoneNumber,
    };
  };

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
    const { stepName, updateStoreData } = this.props;
    const {
      email,
      searchByPostcode,
      schoolNickname,
      schoolName,
      schoolCity,
      schoolCitySearch,
      schoolAddressLine1,
      schoolAddressLine2,
      schoolLatitude,
      schoolLongitude,
      schoolPostcode,
      schoolManagerFirstName,
      schoolManagerLastName,
      schoolManagerJobRole,
      schoolManagerEmail,
      schoolManagerPhoneNumber,
      itManagerAvailable,
      itManagerFirstName,
      itManagerLastName,
      itManagerJobRole,
      itManagerEmail,
      itManagerPhoneNumber,
      itManagerCompanyName,
    } = this.state;

    const schoolCityName = searchByPostcode ? schoolCity : schoolCitySearch.name;

    const schoolLat = searchByPostcode ? schoolLatitude : schoolCitySearch.location.latlon.latitude || 0;

    const schoolLong = searchByPostcode ? schoolLongitude : schoolCitySearch.location.latlon.longitude || 0;

    const regData = {
      [SCHOOL_REGISTRATION_INFO_KEY.email]: email,
      [SCHOOL_REGISTRATION_INFO_KEY.school_nickname]: schoolNickname,
      [SCHOOL_REGISTRATION_INFO_KEY.school_name]: schoolName,
      [SCHOOL_REGISTRATION_INFO_KEY.address]: {
        [ADDRESS_FIELD.line_1]: schoolAddressLine1,
        [ADDRESS_FIELD.line_2]: schoolAddressLine2,
        [ADDRESS_FIELD.city]: schoolCityName,
        [ADDRESS_FIELD.post_code]: schoolPostcode,
        [ADDRESS_FIELD.latitude]: schoolLat,
        [ADDRESS_FIELD.longitude]: schoolLong,
      },
      [SCHOOL_REGISTRATION_INFO_KEY.school_manager]: {
        first_name: schoolManagerFirstName,
        last_name: schoolManagerLastName,
        job_role: schoolManagerJobRole,
        email: schoolManagerEmail,
        phone_number: schoolManagerPhoneNumber,
      },
      [SCHOOL_REGISTRATION_INFO_KEY.utilities_manager]: this.getUtilitiesManager(),
      [SCHOOL_REGISTRATION_INFO_KEY.it_manager]: itManagerAvailable ? (
        {
          first_name: itManagerFirstName,
          last_name: itManagerLastName,
          job_role: itManagerJobRole,
          email: itManagerEmail,
          phone_number: itManagerPhoneNumber,
          company_name: itManagerCompanyName,
        })
        : null,
    };

    updateStoreData(stepName, this.state, regData);
  }

  updateAddressInfo = (value) => {
    const {
      postcode,
      latitude,
      longitude,
    } = value;
    this.setState({
      schoolAddressLine1: value.addressLine1,
      schoolAddressLine2: value.addressLine2,
      schoolCity: value.city,
      schoolPostcode: postcode,
      schoolLatitude: latitude,
      schoolLongitude: longitude,
    });
  }

  render() {
    const { classes } = this.props;
    const {
      searchByPostcode,
      searchByPostcodeFailed,
      email,
      schoolNickname,
      schoolName,
      schoolAddressLine1,
      schoolAddressLine2,
      schoolCity,
      schoolCitySearch,
      schoolPostcode,
      schoolManagerFirstName,
      schoolManagerLastName,
      schoolManagerJobRole,
      schoolManagerEmail,
      schoolManagerPhoneNumber,
      isUtilitiesManager,
      utilitiesManagerAvailable,
      utilitiesManagerFirstName,
      utilitiesManagerLastName,
      utilitiesManagerJobRole,
      utilitiesManagerEmail,
      utilitiesManagerPhoneNumber,
      itManagerAvailable,
      itManagerFirstName,
      itManagerLastName,
      itManagerJobRole,
      itManagerEmail,
      itManagerPhoneNumber,
      itManagerCompanyName,
    } = this.state;

    return (
      <div className={classes.formContainer}>
        <ValidatorForm
          ref={(el) => { this.registrationForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <YesNoRadioGroup
            value={searchByPostcode}
            groupLabel="Enter your School address *"
            name="searchByPostcode"
            customLabelMap={{ yes: 'by Post code', no: 'manually' }}
            onSubmit={value => this.setState({ searchByPostcode: value, searchByPostcodeFailed: false })}
          />
          {searchByPostcode && (
            <PostcodeAutocomplete
              placeholder="Search Post code *"
              name="postcodeSearch"
              value={schoolPostcode}
              onChange={(value) => { this.setState({ schoolPostcode: value }); }}
              updateInfo={this.updateAddressInfo}
              informOnResult={(success) => { this.setState({ searchByPostcodeFailed: !success }); }}
              validators={['required']}
              errorMessages={['This field is required']}
            />
          )}
          {searchByPostcodeFailed && (
            <div className={classes.searchFailedInfo}>
              We couldn&apos;t get needed address info. Please enter your School address details manually.
            </div>
          )}
          <FormControl component="fieldset" fullWidth className={classes.formControlGroup}>
            <FormLabel component="legend" className={classes.formControlLegend}>School address details:</FormLabel>
            <FormGroup row>
              <TextValidator
                className={classes.inlineInput}
                disabled={searchByPostcode}
                label="Address line 1 *"
                margin="dense"
                onChange={event => this.setState({ schoolAddressLine1: event.target.value })}
                name="schoolAddressLine1"
                value={schoolAddressLine1}
                helperText="e.g. 25 Bridges Place"
                validators={['required', 'trim']}
                errorMessages={['This field is required', 'No blank text']}
              />
              <TextValidator
                className={classes.inlineInput}
                disabled={searchByPostcode}
                label="Address line 2"
                margin="dense"
                onChange={event => this.setState({ schoolAddressLine2: event.target.value })}
                name="schoolAddressLine2"
                value={schoolAddressLine2}
              />
              {searchByPostcode ? (
                <TextValidator
                  className={classes.inlineInput}
                  disabled={searchByPostcode}
                  label="City *"
                  margin="dense"
                  onChange={event => this.setState({ schoolCity: event.target.value })}
                  name="schoolCity"
                  value={schoolCity}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
              ) : (
                <div className={classes.inlineInput} style={{ marginTop: 9 }}>
                  <CityAutocomplete
                    placeholder="Search city *"
                    name="schoolCitySearch"
                    value={schoolCitySearch}
                    validators={['required']}
                    onChange={(value) => { this.setState({ schoolCitySearch: value }); }}
                    errorMessages={['This field is required']}
                  />
                </div>
              )}
              <TextValidator
                className={classes.inlineInput}
                disabled={searchByPostcode}
                label="Postcode *"
                margin="dense"
                onChange={event => this.setState({ schoolPostcode: event.target.value })}
                name="postcodeValue"
                value={schoolPostcode}
                helperText="e.g. SW6 1AB"
                validators={['required', 'trim', 'matchRegexp:^[a-zA-z0-9\\s]+$', 'minStringLength:6', 'maxStringLength:8']}
                errorMessages={[
                  'This field is required',
                  'No blank text',
                  'Only letters and numbers and are allowed',
                  'Postcode length should range from six to eight characters (including a space) long',
                  'Postcode length should range from six to eight characters (including a space) long',
                ]}
              />
            </FormGroup>
          </FormControl>
          <TextValidator
            type="text"
            fullWidth
            label="School name *"
            margin="dense"
            onChange={event => this.setState({ schoolName: event.target.value })}
            name="schoolName"
            value={schoolName}
            validators={['required', 'trim', 'maxStringLength:50']}
            errorMessages={['This field is required', 'No blank text', 'No more than 50 symbols']}
          />
          <TextValidator
            type="text"
            fullWidth
            label="School nickname *"
            margin="dense"
            onChange={event => this.setState({ schoolNickname: event.target.value })}
            name="schoolNickname"
            value={schoolNickname}
            validators={['required', 'trim', 'matchRegexp:^[\\w\\s.@+-]+$', 'maxStringLength:50']}
            errorMessages={['This field is required', 'No blank text', 'Letters, digits and @/./+/-/_ only.', 'No more than 50 symbols']}
          />
          <TextValidator
            type="email"
            fullWidth
            label="Generic school contact email address *"
            margin="dense"
            onChange={event => this.setState({ email: event.target.value })}
            name="email"
            value={email}
            validators={['required', 'isEmail']}
            errorMessages={['This field is required', 'Email is not valid']}
          />
          <FormControl component="fieldset" fullWidth className={classes.formControlGroup}>
            <FormLabel component="legend" className={classes.formControlLegend}>Your details:</FormLabel>
            <FormGroup row>
              <TextValidator
                className={classes.inlineInput}
                type="text"
                label="First Name *"
                margin="dense"
                onChange={event => this.setState({ schoolManagerFirstName: event.target.value })}
                name="schoolManagerFirstName"
                value={schoolManagerFirstName}
                validators={['required', 'trim', 'maxStringLength:30']}
                errorMessages={['This field is required', 'No blank text', 'No more than 30 symbols']}
              />
              <TextValidator
                className={classes.inlineInput}
                type="text"
                label="Last Name *"
                margin="dense"
                onChange={event => this.setState({ schoolManagerLastName: event.target.value })}
                name="schoolManagerLastName"
                value={schoolManagerLastName}
                validators={['required', 'trim', 'maxStringLength:30']}
                errorMessages={['This field is required', 'No blank text', 'No more than 30 symbols']}
              />
              <TextValidator
                className={classes.inlineInput}
                type="text"
                label="Job Role *"
                margin="dense"
                onChange={event => this.setState({ schoolManagerJobRole: event.target.value })}
                name="schoolManagerJobRole"
                value={schoolManagerJobRole}
                validators={['required', 'trim', 'maxStringLength:50']}
                errorMessages={['This field is required', 'No blank text', 'No more than 50 symbols']}
              />
              <TextValidator
                className={classes.inlineInput}
                type="email"
                label="Email *"
                margin="dense"
                onChange={event => this.setState({ schoolManagerEmail: event.target.value })}
                name="schoolManagerEmail"
                value={schoolManagerEmail}
                validators={['required', 'isEmail']}
                errorMessages={['This field is required', 'Email is not valid']}
              />
              <TextValidator
                className={classes.inlineInput}
                type="text"
                label="Phone number"
                margin="dense"
                onChange={event => this.setState({ schoolManagerPhoneNumber: event.target.value })}
                name="schoolManagerPhoneNumber"
                value={schoolManagerPhoneNumber}
                validators={['maxStringLength:20']}
                errorMessages={['No more than 20 symbols']}
              />
            </FormGroup>
          </FormControl>
          <YesNoRadioGroup
            fullWidth
            value={isUtilitiesManager}
            groupLabel={(
              <span>
                Are you responsible for Utilities Management at your school?<br />
                <span className={classes.customHelperText}>
                  (Utilities Manager will be contacted for installing sensors and metering equipment)
                </span>
              </span>
            )}
            name="isUtilitiesManager"
            onSubmit={value => this.setState({ isUtilitiesManager: value })}
          />
          {!isUtilitiesManager && (
            <YesNoRadioGroup
              fullWidth
              value={utilitiesManagerAvailable}
              groupLabel="Do you know who is responsible for Utilities Management at your school?"
              name="utilitiesManagerAvailable"
              onSubmit={value => this.setState({ utilitiesManagerAvailable: value })}
            />
          )}
          {(utilitiesManagerAvailable && !isUtilitiesManager) && (
            <FormControl component="fieldset" fullWidth className={classes.formControlGroup}>
              <FormLabel component="legend" className={classes.formControlLegend}>Utilities manager contact details:</FormLabel>
              <FormGroup row>
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="First Name *"
                  margin="dense"
                  onChange={event => this.setState({ utilitiesManagerFirstName: event.target.value })}
                  name="utilitiesManagerFirstName"
                  value={utilitiesManagerFirstName}
                  validators={['required', 'trim', 'maxStringLength:30']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 30 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Last Name *"
                  margin="dense"
                  onChange={event => this.setState({ utilitiesManagerLastName: event.target.value })}
                  name="utilitiesManagerLastName"
                  value={utilitiesManagerLastName}
                  validators={['required', 'trim', 'maxStringLength:30']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 30 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Job Role *"
                  margin="dense"
                  onChange={event => this.setState({ utilitiesManagerJobRole: event.target.value })}
                  name="utilitiesManagerJobRole"
                  value={utilitiesManagerJobRole}
                  validators={['required', 'trim', 'maxStringLength:50']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 50 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="email"
                  label="Email *"
                  margin="dense"
                  onChange={event => this.setState({ utilitiesManagerEmail: event.target.value })}
                  name="utilitiesManagerEmail"
                  value={utilitiesManagerEmail}
                  validators={['required', 'isEmail']}
                  errorMessages={['This field is required', 'Email is not valid']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Phone number"
                  margin="dense"
                  onChange={event => this.setState({ utilitiesManagerPhoneNumber: event.target.value })}
                  name="utilitiesManagerPhoneNumber"
                  value={utilitiesManagerPhoneNumber}
                  validators={['maxStringLength:20']}
                  errorMessages={['No more than 20 symbols']}
                />
              </FormGroup>
            </FormControl>
          )}
          <YesNoRadioGroup
            fullWidth
            value={itManagerAvailable}
            groupLabel={(
              <span>
                Do you know who is responsible for IT management at your school? <br />
                <span className={classes.customHelperText}>
                  (IT service company or manager will be contacted to get information needed for the installation)
                </span>
              </span>
            )}
            name="itManagerAvailable"
            onSubmit={value => this.setState({ itManagerAvailable: value })}
          />
          {itManagerAvailable && (
            <FormControl component="fieldset" fullWidth className={classes.formControlGroup}>
              <FormLabel component="legend" className={classes.formControlLegend}>IT manager contact details:</FormLabel>
              <FormGroup row>
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="First Name *"
                  margin="dense"
                  onChange={event => this.setState({ itManagerFirstName: event.target.value })}
                  name="itManagerFirstName"
                  value={itManagerFirstName}
                  validators={['required', 'trim', 'maxStringLength:30']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 30 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Last Name *"
                  margin="dense"
                  onChange={event => this.setState({ itManagerLastName: event.target.value })}
                  name="itManagerLastName"
                  value={itManagerLastName}
                  validators={['required', 'trim', 'maxStringLength:30']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 30 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Job Role *"
                  margin="dense"
                  onChange={event => this.setState({ itManagerJobRole: event.target.value })}
                  name="itManagerJobRole"
                  value={itManagerJobRole}
                  validators={['required', 'trim', 'maxStringLength:50']}
                  errorMessages={['This field is required', 'No blank text', 'No more than 50 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="email"
                  label="Company email"
                  margin="dense"
                  onChange={event => this.setState({ itManagerEmail: event.target.value })}
                  name="itManagerEmail"
                  value={itManagerEmail}
                  validators={['required', 'isEmail']}
                  errorMessages={['This field is required', 'Email is not valid']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Company phone number"
                  margin="dense"
                  onChange={event => this.setState({ itManagerPhoneNumber: event.target.value })}
                  name="itManagerPhoneNumber"
                  value={itManagerPhoneNumber}
                  validators={['maxStringLength:20']}
                  errorMessages={['No more than 20 symbols']}
                />
                <TextValidator
                  className={classes.inlineInput}
                  type="text"
                  label="Company name"
                  margin="dense"
                  onChange={event => this.setState({ itManagerCompanyName: event.target.value })}
                  name="itManagerCompanyName"
                  value={itManagerCompanyName}
                  validators={['maxStringLength:100']}
                  errorMessages={['No more than 100 symbols']}
                />
              </FormGroup>
            </FormControl>
          )}
        </ValidatorForm>
        <Grid container className={classes.navigationContainer}>
          <Button onClick={this.onSubmitClick} color="primary">
            Next
          </Button>
        </Grid>
      </div>
    );
  }
}

FirstStep.propTypes = {
  classes: PropTypes.object.isRequired,
  stepName: PropTypes.string.isRequired,
  getStoreData: PropTypes.func.isRequired,
  updateStoreData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(FirstStep);
