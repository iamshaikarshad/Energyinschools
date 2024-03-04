import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import red from '@material-ui/core/colors/red';

import { ValidatorComponent } from 'react-form-validator-core';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: '24px 0px 0px',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
    },
  },
  group: {
    margin: theme.spacing(1, 0),
  },
});

const YES_NO_VALUE_LABEL_MAP = Object.freeze({
  yes: {
    value: true,
    label: 'Yes',
  },
  no: {
    value: false,
    label: 'No',
  },
});

const red500 = red['500'];

const ERROR_STYLE = {
  fontSize: '14px',
  color: red500,
};

class YesNoRadioGroup extends ValidatorComponent {
  onChange = (e) => {
    const { onSubmit } = this.props;
    const currentValue = e.target.value;
    onSubmit(YES_NO_VALUE_LABEL_MAP[currentValue].value);
  };

  getRadioGroupValue = (value) => {
    const valueData = Object.keys(YES_NO_VALUE_LABEL_MAP).find(key => YES_NO_VALUE_LABEL_MAP[key].value === value);
    return valueData;
  };

  errorText() {
    const { isValid } = this.state;
    if (isValid) {
      return null;
    }
    return (
      <div style={ERROR_STYLE}>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    const {
      classes,
      groupLabel,
      name,
      reverse,
      row,
      fullWidth,
      customLabelMap,
      labelStyle,
    } = this.props;
    const {
      value,
    } = this.state;

    const values = !reverse ? Object.keys(YES_NO_VALUE_LABEL_MAP) : Object.keys(YES_NO_VALUE_LABEL_MAP).reverse();

    const radioGroupValue = this.getRadioGroupValue(value);

    return (
      <div className={classes.root}>
        <FormControl component="fieldset" className={classes.formControl} fullWidth={fullWidth}>
          <FormLabel component="legend" style={labelStyle}>{groupLabel}</FormLabel>
          <RadioGroup
            row={row}
            aria-label={name}
            name={name}
            value={radioGroupValue}
            onChange={e => this.onChange(e)}
            style={{ justifyContent: 'space-around' }}
          >
            {
              values.map(valueItem => (
                <FormControlLabel
                  key={valueItem}
                  value={valueItem}
                  control={<Radio color="primary" />}
                  label={customLabelMap ? customLabelMap[valueItem] : YES_NO_VALUE_LABEL_MAP[valueItem].label}
                  classes={{ label: classes.radioInputLabelRoot }}
                />
              ))
            }
          </RadioGroup>
          {this.errorText()}
        </FormControl>
      </div>
    );
  }
}

YesNoRadioGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  row: PropTypes.bool,
  name: PropTypes.string.isRequired,
  groupLabel: PropTypes.node,
  onSubmit: PropTypes.func.isRequired,
  reverse: PropTypes.bool,
  fullWidth: PropTypes.bool,
  customLabelMap: PropTypes.object,
  labelStyle: PropTypes.object,
};

YesNoRadioGroup.defaultProps = {
  ...ValidatorComponent.defaultProps,
  row: true,
  groupLabel: '',
  reverse: false,
  fullWidth: false,
  customLabelMap: null,
  labelStyle: {},
};

export default withStyles(styles)(YesNoRadioGroup);
