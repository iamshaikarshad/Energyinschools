import React from 'react';
import PropTypes from 'prop-types';

import { TextValidator, ValidatorComponent, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button/';
import FormControl from '@material-ui/core/FormControl';

import { FUEL_TYPE } from './constants';

const styles = theme => ({
  noItemsMessage: {
    padding: theme.spacing(1, 2),
    color: 'rgba(0, 0, 0, 0.54)',
    lineHeight: '1.5em',
    fontSize: '16px',
  },
  selectEmpty: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  errorMessage: {
    fontSize: '12px',
    color: 'red',
  },
  menuItemRoot: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px',
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: '30px',
    },
  },
  xsFontSize: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px',
    },
  },
});

class InputMpanMprnManually extends ValidatorComponent {
  constructor(props) {
    super(props);

    this.state = {
      isValid: true,
      inputValue: '',
    };
    this.manualInputForm = null;
  }

  onSubmitClick = () => {
    this.manualInputForm.submit();
  };

  onFormSubmit = () => {
    const { onChange } = this.props;
    const { inputValue } = this.state;
    if (inputValue) {
      onChange({ target: { value: inputValue } });
    }
  };

  render() {
    const { inputValue } = this.state;
    const { fuelType } = this.props;
    let validators;
    let errorMessages;

    if (fuelType === FUEL_TYPE.electricity) {
      validators = ['required', 'minStringLength:21', 'maxStringLength:21', 'matchRegexp:^\\d{5}[a-zA-Z0-9]{3}\\d{13}$'];
      errorMessages = ['this field is required', 'MPAN must be 21 characters long', 'MPAN must be 21 characters long', '6 - 8th symbols should be alphanumeric, all other symbols should be numeric'];
    } else {
      validators = ['required', 'minStringLength:6', 'maxStringLength:11', 'matchRegexp:\\d{6, 11}'];
      errorMessages = ['this field is required', 'MPRN must be at least 6 characters long', 'MPRN can\'t be longer than 11 characters', 'MPRN must contain only digits'];
    }

    return (
      <FormControl fullWidth>
        <ValidatorForm
          ref={(el) => { this.manualInputForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            fullWidth
            label="Enter here your MPAN/MPRN"
            margin="dense"
            onChange={event => this.setState({ inputValue: event.target.value })}
            name="comment"
            value={inputValue}
            validators={validators} // eslint-disable-line no-useless-escape
            errorMessages={errorMessages}
          />
          <Button onClick={this.onSubmitClick} variant="contained" color="primary">Submit</Button>
        </ValidatorForm>
      </FormControl>
    );
  }
}

InputMpanMprnManually.PropTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default withStyles(styles)(InputMpanMprnManually);
