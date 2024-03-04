import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import ConfirmationCheckbox from '../../dialogs/formControls/ConfirmationCheckbox';
import SchoolExpectationsAndBenefits from '../SchoolExpectationsAndBenefits';

import { SCHOOL_REGISTRATION_INFO_KEY } from '../constants';

import emailIcon from '../../../images/email.svg';

const styles = theme => ({
  root: {
    width: '100%',
    padding: '0px 50px 25px',
    [theme.breakpoints.down('xs')]: {
      paddingLeft: '15px',
      paddingRight: '15px',
    },
  },
  formContainer: {
    width: '100%',
    marginBottom: '25px',
  },
  formRoot: {
    width: '100%',
  },
  navigationContainer: {
    marginTop: theme.spacing(5),
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(3),
    },
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  infoBlockRoot: {
    padding: 25,
    borderRadius: 6,
    marginTop: 20,
    backgroundColor: 'rgba(0,188,212, 0.15)',
  },
  infoBlockAvatar: {
    borderRadius: 0,
    width: 52,
    height: 38,
  },
  infoBlockTitle: {
    color: theme.palette.primary.main,
  },
  agreementTextContainer: {
    height: 450,
    overflow: 'auto',
    padding: 5,
    border: '1px solid rgba(0, 0, 0, 0.47)',
  },
  confirmContainer: {
    marginTop: 25,
    marginBottom: 15,
    textAlign: 'center',
  },
});

const INITIAL_STATE = {
  comment: '',
  acceptedAgreement: false,
};

class FourthStep extends React.Component {
  state = this.getInitialState();

  registrationForm = null;

  getInitialState() {
    const { getStoreData, stepName } = this.props;
    const storeData = getStoreData(stepName);
    return storeData ? { ...storeData } : INITIAL_STATE;
  }

  onFormSubmit = () => {
    const { onSubmit, updateStoreData, stepName } = this.props;
    const { comment, acceptedAgreement } = this.state;
    const regData = {
      [SCHOOL_REGISTRATION_INFO_KEY.comment]: comment,
      [SCHOOL_REGISTRATION_INFO_KEY.is_school_agreement_accepted]: acceptedAgreement,
    };
    updateStoreData(stepName, this.state, regData);
    onSubmit();
  };

  onSubmitClick = () => {
    this.registrationForm.submit();
  };

  render() {
    const {
      classes, onPrev,
    } = this.props;
    const { comment, acceptedAgreement } = this.state;
    return (
      <div className={classes.root}>
        <Grid container className={classes.formContainer} justify="center">
          <Grid item xs={12}>
            <div className={classes.agreementTextContainer}>
              <SchoolExpectationsAndBenefits />
            </div>
            <div className={classes.confirmContainer}>
              <ConfirmationCheckbox
                checked={acceptedAgreement}
                onChange={e => this.setState({ acceptedAgreement: e.target.checked })}
                label="agree"
                color="primary"
              />
            </div>
          </Grid>
          <Grid item xs={12} md={9}>
            <ValidatorForm
              ref={(el) => { this.registrationForm = el; }}
              onSubmit={this.onFormSubmit}
              className={classes.formRoot}
            >
              <TextValidator
                multiline
                rows={4}
                rowsMax={6}
                fullWidth
                label="Comment"
                margin="dense"
                onChange={event => this.setState({ comment: event.target.value })}
                name="comment"
                value={comment}
                validators={['maxStringLength:150']}
                errorMessages={['No more than 150 symbols']}
              />
            </ValidatorForm>
          </Grid>
        </Grid>
        <Grid container justify="center">
          <CardHeader
            avatar={
              <Avatar alt="Email" src={emailIcon} className={classes.infoBlockAvatar} />
            }
            title="We will send you confirmation mail and account details"
            classes={{ root: classes.infoBlockRoot, title: classes.infoBlockTitle }}
          />
        </Grid>
        <Grid container className={classes.navigationContainer}>
          <Button onClick={onPrev} color="primary">
            Previous
          </Button>
          <Button onClick={this.onSubmitClick} color="primary" disabled={!acceptedAgreement}>
            Create
          </Button>
        </Grid>
      </div>
    );
  }
}

FourthStep.propTypes = {
  classes: PropTypes.object.isRequired,
  stepName: PropTypes.string.isRequired,
  getStoreData: PropTypes.func.isRequired,
  updateStoreData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
};

export default withStyles(styles)(FourthStep);
