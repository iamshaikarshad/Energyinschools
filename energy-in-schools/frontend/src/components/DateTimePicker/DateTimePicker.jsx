import React from 'react';

import PropTypes from 'prop-types';
import MomentUtils from '@date-io/moment';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import moment from 'moment';

const styles = () => ({
  root: {},
  pickerContainer: {
    marginBottom: '25px',
  },
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
});

const defaultMaterialTheme = createMuiTheme({
  overrides: {
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: 'rgba(47, 104, 160, 1)',
      },
    },
    MuiPickerDTTabs: {
      tabs: {
        backgroundColor: 'rgba(55, 111, 157, 1)',
      },
    },
    MuiPickersDay: {
      day: {
        color: 'rgba(0, 0, 0, 0.87)',
      },
      daySelected: {
        backgroundColor: 'rgb(37, 173, 223)',
        '&:hover': {
          backgroundColor: 'rgb(37, 173, 223)',
        },
      },
      current: {
        color: 'rgba(0, 120, 255, 1)',
      },
    },
    MuiPickersYear: {
      yearSelected: {
        color: 'rgb(37, 173, 223)',
      },
    },
    MuiPickersClock: {
      pin: {
        backgroundColor: 'rgb(37, 173, 223)',
      },
    },
    MuiPickersClockPointer: {
      pointer: {
        backgroundColor: 'rgb(37, 173, 223)',
      },
      thumb: {
        borderColor: 'rgb(37, 173, 223)',
      },
      noPoint: {
        backgroundColor: 'rgb(37, 173, 223)',
      },
    },
    MuiFormLabel: {
      root: {
        color: 'rgba(0, 0, 0, 0.54)',
        '&$focused': {
          color: '#008ba3',
        },
      },
    },
    MuiInput: {
      underline: {
        '&:after': {
          borderBottom: '2px solid rgb(0,139,163)',
        },
      },
    },
  },
});
class DateTimePicker extends React.PureComponent {
  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  renderRoot = () => {
    const { classes } = this.props;
    const {
      value,
      onChange,
      error,
      helperText,
      disableFuture,
      label,
    } = this.props;

    return (
      <Grid container className={classes.root} justify="space-around">
        <Grid container className={classes.pickerContainer}>
          <Grid>
            <KeyboardDateTimePicker
              value={value}
              onChange={onChange}
              disableFuture={disableFuture}
              error={error}
              helperText={helperText}
              label={label}
              InputProps={{
                className: classes.inputLabelFocused,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  };

  render() {
    const { isOpened } = this.props;
    if (!isOpened) return null;

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <ThemeProvider theme={defaultMaterialTheme}>
          {this.renderRoot()}
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    );
  }
}
DateTimePicker.defaultProps = {
  isOpened: true,
  onRef: () => {},
  onChange: null,
  value: moment().startOf('seconds'),
  error: false,
  helperText: '',
  disableFuture: false,
  label: '',

};

DateTimePicker.propTypes = {
  onRef: PropTypes.func,
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  isOpened: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(moment)]),
  disableFuture: PropTypes.bool,
  label: PropTypes.string,
};
export default withStyles(styles)(DateTimePicker);
