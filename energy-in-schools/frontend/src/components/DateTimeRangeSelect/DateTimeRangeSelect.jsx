import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import MomentUtils from '@date-io/moment';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  KeyboardTimePicker,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';

import ModalWrapper from './ModalWrapper';

import {
  DATE_RANGE_PICKER_VARIANT, DISPLAY_VARIANT, LIMITS_DISPLAY_MODE, RANGE_LIMIT, RANGE_LIMIT_LABEL,
} from './constants';

const styles = theme => ({
  root: {},
  pickerContainer: {},
  pickerWrapper: {
    justifyContent: 'center',
    padding: '12px 8px',
  },
  actionContainer: {
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  submitButton: {},
  cancelButton: {
    marginLeft: 16,
  },
  inputlabelRoot: {},
  inputLabelFocused: {},
  inputRoot: {},
  inputIcon: {},
  errorMessageContainer: {
    marginTop: 12,
  },
  errorMessage: {
    width: '100%',
    textAlign: 'center',
    color: 'rgb(255, 0, 0)',
    fontSize: 14,
    padding: '0px 8px',
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
});

const DATE_RANGE_PICKER_VARIANT_COMPONENT_MAP = Object.freeze({ // components details: https://material-ui-pickers.dev/getting-started/installation
  [DATE_RANGE_PICKER_VARIANT.date]: KeyboardDatePicker,
  [DATE_RANGE_PICKER_VARIANT.time]: KeyboardTimePicker,
  [DATE_RANGE_PICKER_VARIANT.dateTime]: KeyboardDateTimePicker,
});

class DateTimeRangeSelect extends React.PureComponent {
  state = this.getInitialState();

  inputFormIsValid = true;

  getInitialState() {
    const { initialFrom, initialTo } = this.props;
    return {
      [RANGE_LIMIT.from]: initialFrom,
      [RANGE_LIMIT.to]: initialTo,
      isValid: true,
      errorMessage: '',
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  handleDateTimeChange = rangeLimit => (date) => {
    this.inputFormIsValid = true;
    this.updateState({ [rangeLimit]: date })
      .then(() => {
        const { isValid } = this.state;
        if (!isValid) { // live validation after getting error with custom validators
          const { valid, message } = this.validate();
          this.setState({ isValid: valid, errorMessage: message });
        }
      });
  };

  onClickSubmit = () => {
    const { onSubmit } = this.props;
    const { valid, message } = this.validate();
    if (valid) {
      onSubmit(this.state[RANGE_LIMIT.from], this.state[RANGE_LIMIT.to]); // eslint-disable-line react/destructuring-assignment
    } else if (this.inputFormIsValid) {
      this.setState({ isValid: valid, errorMessage: message });
    }
  }

  onClickCancel = () => {
    const { onCancel } = this.props;
    const { valid } = this.validate();
    const beforeCancelAction = valid
      ? Promise.resolve(null)
      : this.updateState(
        this.getInitialState(),
      );
    beforeCancelAction
      .then(() => {
        this.inputFormIsValid = true;
        onCancel();
      });
  }

  onError = () => {
    this.inputFormIsValid = false;
  }

  validate = () => {
    let valid = this.inputFormIsValid;
    let message = '';
    const { validators } = this.props;
    for (let index = 0; index < validators.length; index += 1) {
      const { rule, errorMessage } = validators[index];
      if (!rule(this.state[RANGE_LIMIT.from], this.state[RANGE_LIMIT.to])) { // eslint-disable-line react/destructuring-assignment
        valid = false;
        message = errorMessage;
        break;
      }
    }
    return { valid, message };
  }

  updateState = newState => new Promise((resolve) => {
    this.setState(
      newState,
      () => { resolve(); },
    );
  });

  renderRoot = () => {
    const {
      classes, pickerComponentVariant, pickerProps, limitsDisplayMode, onSubmit, onCancel, submitLabel, cancelLabel,
    } = this.props;

    const { isValid, errorMessage } = this.state;

    const PickerComponent = DATE_RANGE_PICKER_VARIANT_COMPONENT_MAP[pickerComponentVariant] || KeyboardDateTimePicker;

    return (
      <Grid container className={classes.root} justify="space-around">
        <Grid container className={classes.pickerContainer}>
          { Object.values(RANGE_LIMIT).map((limit, index) => {
            const currentPickerProps = pickerProps[limit];
            const pickerIsHidden = limitsDisplayMode === LIMITS_DISPLAY_MODE.single && index > 0;
            return !pickerIsHidden ? (
              <Grid key={limit} item container xs={12} sm={limitsDisplayMode === LIMITS_DISPLAY_MODE.single ? 12 : 6} className={classes.pickerWrapper}>
                <PickerComponent
                  value={this.state[limit]} // eslint-disable-line react/destructuring-assignment
                  onChange={this.handleDateTimeChange(limit)}
                  onError={this.onError}
                  label={RANGE_LIMIT_LABEL[limit]}
                  {...currentPickerProps}
                />
              </Grid>
            )
              : null;
          })}
        </Grid>
        { !isValid && (
          <Grid container className={classes.errorMessageContainer}>
            <Typography className={classes.errorMessage}>
              {errorMessage}
            </Typography>
          </Grid>
        )}
        <Grid container className={classes.actionContainer}>
          { onSubmit && (
            <Button onClick={this.onClickSubmit} className={classes.submitButton}>
              { submitLabel }
            </Button>
          )}
          { onCancel && (
            <Button onClick={this.onClickCancel} className={classes.cancelButton}>
              { cancelLabel }
            </Button>
          )}
        </Grid>
      </Grid>
    );
  }

  render() {
    const { isOpened } = this.props;
    if (!isOpened) return null;
    const {
      theme, displayVariant, dialogProps,
    } = this.props;

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <ThemeProvider theme={createMuiTheme(theme)}> {/* The only way to override existing picker components(KeyboardDateTimePicker, ...) stylesheets are with the use of global material-ui theme overrides. */}
          { displayVariant === DISPLAY_VARIANT.modal ? (
            <ModalWrapper
              isOpened
              {...dialogProps}
            >
              {this.renderRoot()}
            </ModalWrapper>
          ) : (
            this.renderRoot()
          )}
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    );
  }
}

DateTimeRangeSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object,
  pickerComponentVariant: PropTypes.string,
  limitsDisplayMode: PropTypes.oneOf(Object.values(LIMITS_DISPLAY_MODE)),
  isOpened: PropTypes.bool,
  initialFrom: PropTypes.instanceOf(moment),
  initialTo: PropTypes.instanceOf(moment),
  pickerProps: PropTypes.shape({
    from: PropTypes.object,
    to: PropTypes.object,
  }),
  displayVariant: PropTypes.oneOf(Object.values(DISPLAY_VARIANT)),
  dialogProps: PropTypes.object,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  validators: PropTypes.arrayOf(PropTypes.shape({
    rule: PropTypes.func.isRequired,
    errorMessage: PropTypes.string.isRequired,
  })),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onRef: PropTypes.func,
};

DateTimeRangeSelect.defaultProps = {
  theme: {},
  pickerComponentVariant: DATE_RANGE_PICKER_VARIANT.dateTime,
  limitsDisplayMode: LIMITS_DISPLAY_MODE.dual,
  isOpened: false,
  initialFrom: moment().startOf('day'),
  initialTo: moment().startOf('hour'),
  pickerProps: {},
  displayVariant: DISPLAY_VARIANT.inline,
  dialogProps: null,
  submitLabel: 'Continue',
  cancelLabel: 'Cancel',
  validators: [],
  onSubmit: null,
  onCancel: null,
  onRef: () => {},
};

export default withStyles(styles)(DateTimeRangeSelect);
