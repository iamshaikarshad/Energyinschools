import React from 'react';
import PropTypes from 'prop-types';

import { Grid, withStyles } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { PAYMENT_TYPE, PAYMENT_TYPE_LABEL } from './constants';

const styles = {
  root: {
    padding: 0,
  },
  paymentTypeSelect: {
    minWidth: 150,
  },
  directDebitDetails: {
    marginTop: 10,
    paddingLeft: 5,
  },
  submitButton: {
    marginTop: 15,
  },
};

class PaymentInfoForm extends React.Component {
  state = {
    selectedPaymentType: '',
    bankName: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postcode: '',
    referenceNumber: '',
    accountHolderName: '',
    accountNumber: '',
    sortCode: '',
  };

  paymentInfoForm = null;

  render() {
    const { classes, selectedMeterId, onSubmit } = this.props;
    const {
      selectedPaymentType,
      bankName,
      city,
      addressLine1,
      addressLine2,
      postcode,
      referenceNumber,
      accountHolderName,
      accountNumber,
      sortCode,
    } = this.state;

    return (
      <Grid container direction="column" justify="center" className={classes.root}>
        <Grid item container>
          <ValidatorForm
            ref={(el) => { this.paymentInfoForm = el; }}
            onSubmit={() => onSubmit(selectedMeterId, this.state)}
            style={{ width: '100%' }}
          >
            <SelectValidator
              fullWidth
              className={classes.paymentTypeSelect}
              onChange={event => this.setState({ selectedPaymentType: event.target.value })}
              label="Payment type"
              margin="dense"
              name="paymentType"
              value={selectedPaymentType}
              validators={['required']}
              errorMessages={['This field is required']}
            >
              {Object.keys(PAYMENT_TYPE).map(paymentType => (
                <MenuItem key={paymentType} value={paymentType}>{PAYMENT_TYPE_LABEL[paymentType]}</MenuItem>
              ))}
            </SelectValidator>
            {selectedPaymentType === PAYMENT_TYPE.monthly_direct_debit && (
              <FormControl component="fieldset" fullWidth className={classes.directDebitDetails}>
                <FormLabel component="legend">Direct Debit details:</FormLabel>
                <TextValidator
                  type="text"
                  fullWidth
                  label="Bank name"
                  margin="dense"
                  name="bankName"
                  value={bankName}
                  onChange={event => this.setState({ bankName: event.target.value })}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="City *"
                  margin="dense"
                  name="city"
                  value={city}
                  onChange={event => this.setState({ city: event.target.value })}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Address line 1 *"
                  margin="dense"
                  name="addressLine1"
                  value={addressLine1}
                  onChange={event => this.setState({ addressLine1: event.target.value })}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Address line 2"
                  margin="dense"
                  name="addressLine2"
                  value={addressLine2}
                  onChange={event => this.setState({ addressLine2: event.target.value })}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Postcode *"
                  margin="dense"
                  name="postcode"
                  value={postcode}
                  onChange={event => this.setState({ postcode: event.target.value })}
                  validators={['required', 'minStringLength:6', 'maxStringLength:8']}
                  errorMessages={[
                    'This field is required',
                    'Postcode length should range from six to eight characters (including a space) long',
                    'Postcode length should range from six to eight characters (including a space) long',
                  ]}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Reference number"
                  margin="dense"
                  name="referenceNumber"
                  value={referenceNumber}
                  onChange={event => this.setState({ referenceNumber: event.target.value })}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Account Holder Name"
                  margin="dense"
                  name="accountHolderName"
                  value={accountHolderName}
                  onChange={event => this.setState({ accountHolderName: event.target.value })}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Account Number"
                  margin="dense"
                  name="accountNumber"
                  value={accountNumber}
                  onChange={event => this.setState({ accountNumber: event.target.value })}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                <TextValidator
                  type="text"
                  fullWidth
                  label="Sort Code"
                  margin="dense"
                  name="sortCode"
                  value={sortCode}
                  onChange={(event) => { this.setState({ sortCode: event.target.value }); }}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
              </FormControl>
            )}
          </ValidatorForm>
        </Grid>
        <Grid item container justify="flex-end">
          <Button
            className={classes.submitButton}
            onClick={() => { this.paymentInfoForm.submit(); }}
            variant="contained"
            color="primary"
            size="small"
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    );
  }
}

PaymentInfoForm.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedMeterId: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(PaymentInfoForm);
