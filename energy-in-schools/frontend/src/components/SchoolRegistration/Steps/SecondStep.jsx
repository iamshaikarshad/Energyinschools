import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { TextValidator, SelectValidator, ValidatorForm } from 'react-material-ui-form-validator';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import MenuItem from '@material-ui/core/MenuItem';

import {
  SCHOOL_GOVERNANCE_TYPE,
  SCHOOL_TYPE,
  SCHOOL_MANAGEMENT_TYPE,
  SCHOOL_PUPILS_SIZE,
  SCHOOL_CONSTRUCTION_YEAR,
  COMPANY_NUMBER_LABEL,
  SCHOOL_REGISTRATION_INFO_KEY,
  NEGATIVE_ANSWER,
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
  selectFormInput: {
    [theme.breakpoints.down('xs')]: {
      // TODO need to be improved
      marginTop: '30px !important',
    },
  },
});

const INITIAL_STATE = {
  governanceType: '',
  schoolType: '',
  schoolPupilsSize: '',
  constructionYearAvailable: false,
  constructionYear: '',
  schoolManagementAvailable: false,
  schoolManagementType: '',
  companyNumber: '',
};

class SecondStep extends React.Component {
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
      governanceType,
      schoolType,
      schoolPupilsSize,
      constructionYear,
      schoolManagementType,
      companyNumber,
    } = this.state;

    const constructionYearAvailable = constructionYear !== NEGATIVE_ANSWER;
    const schoolManagementAvailable = schoolManagementType !== NEGATIVE_ANSWER;
    const regData = {
      [SCHOOL_REGISTRATION_INFO_KEY.governance_type]: governanceType,
      [SCHOOL_REGISTRATION_INFO_KEY.school_type]: schoolType,
      [SCHOOL_REGISTRATION_INFO_KEY.pupils_count_category]: schoolPupilsSize,
      [SCHOOL_REGISTRATION_INFO_KEY.campus_buildings_construction_decade]: constructionYearAvailable ? constructionYear : null,
      [SCHOOL_REGISTRATION_INFO_KEY.legal_status]: schoolManagementAvailable ? schoolManagementType : null,
      [SCHOOL_REGISTRATION_INFO_KEY.registration_number]: schoolManagementAvailable && schoolManagementType && companyNumber ? companyNumber : null,
    };
    updateStoreData(stepName, this.state, regData);
  }

  render() {
    const { classes, onPrev } = this.props;
    const {
      governanceType,
      schoolType,
      schoolPupilsSize,
      constructionYear,
      schoolManagementType,
      companyNumber,
    } = this.state;

    return (
      <div className={classes.formContainer}>
        <ValidatorForm
          ref={(el) => { this.registrationForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <SelectValidator
            fullWidth
            label="Governance type *"
            margin="dense"
            onChange={event => this.setState({ governanceType: event.target.value })}
            name="governanceType"
            value={governanceType}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {Object.keys(SCHOOL_GOVERNANCE_TYPE).map(type => (
              <MenuItem key={type} value={type}>{SCHOOL_GOVERNANCE_TYPE[type]}</MenuItem>
            ))}
          </SelectValidator>
          <SelectValidator
            fullWidth
            label="School type *"
            margin="dense"
            onChange={event => this.setState({ schoolType: event.target.value })}
            name="schoolType"
            value={schoolType}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {Object.keys(SCHOOL_TYPE).map(type => (
              <MenuItem key={type} value={type}>{SCHOOL_TYPE[type]}</MenuItem>
            ))}
          </SelectValidator>
          <SelectValidator
            fullWidth
            label="Size in pupils *"
            margin="dense"
            onChange={event => this.setState({ schoolPupilsSize: event.target.value })}
            name="schoolPupilsSize"
            value={schoolPupilsSize}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {Object.keys(SCHOOL_PUPILS_SIZE).map(item => (
              <MenuItem key={item} value={item}>{SCHOOL_PUPILS_SIZE[item]}</MenuItem>
            ))}
          </SelectValidator>
          <SelectValidator
            fullWidth
            InputProps={{ classes: { root: classes.selectFormInput } }}
            label="Do you know the approximate year of construction of the main school building? *"
            margin="dense"
            onChange={event => this.setState({ constructionYear: event.target.value })}
            name="constructionYear"
            value={constructionYear}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {Object.keys(SCHOOL_CONSTRUCTION_YEAR).map(item => (
              <MenuItem key={item} value={item}>{SCHOOL_CONSTRUCTION_YEAR[item]}</MenuItem>
            ))}
          </SelectValidator>
          <React.Fragment>
            <SelectValidator
              fullWidth
              InputProps={{ classes: { root: classes.selectFormInput } }}
              label="Which of the following is the legal status of your school? *"
              margin="dense"
              onChange={event => this.setState({ schoolManagementType: event.target.value })}
              name="schoolManagementType"
              value={schoolManagementType}
              validators={['required']}
              errorMessages={['This field is required']}
            >
              {Object.keys(SCHOOL_MANAGEMENT_TYPE).map(item => (
                <MenuItem key={item} value={item}>{SCHOOL_MANAGEMENT_TYPE[item]}</MenuItem>
              ))}
            </SelectValidator>
            {schoolManagementType && schoolManagementType !== NEGATIVE_ANSWER && (
              <FormControl component="fieldset" className={classes.formControl} fullWidth>
                <FormLabel component="legend" classes={{ root: classes.formLabelRoot }}>Company/Charity number</FormLabel>
                <TextValidator
                  fullWidth
                  InputProps={{ classes: { root: classes.selectFormInput } }}
                  label={COMPANY_NUMBER_LABEL[schoolManagementType]}
                  margin="dense"
                  onChange={event => this.setState({ companyNumber: event.target.value })}
                  name="companyNumber"
                  value={companyNumber}
                  validators={['maxStringLength:20']}
                  errorMessages={['No more than 20 symbols']}
                />
              </FormControl>
            )}
          </React.Fragment>
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

SecondStep.propTypes = {
  classes: PropTypes.object.isRequired,
  stepName: PropTypes.string.isRequired,
  getStoreData: PropTypes.func.isRequired,
  updateStoreData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(SecondStep);
