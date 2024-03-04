import React from 'react';
import red from '@material-ui/core/colors/red';
import Checkbox from '@material-ui/core/Checkbox';
import { ValidatorComponent } from 'react-material-ui-form-validator';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

const red300 = red['500'];

const styles = {
  errorMessage: {
    right: 0,
    fontSize: '12px',
    color: red300,
    marginTop: -5,
    marginBottom: 10,
  },
  checkBoxLabel: {
    fontSize: 12,
    color: '#555555',
  },
};

class CheckBoxGroupValidator extends ValidatorComponent {
  render() {
    const {
      value, onChange, classes, formGroupStyle, controlLabelStyle,
    } = this.props;

    return (
      <div>
        <FormGroup row style={formGroupStyle}>
          {
            value.map(val => (
              <FormControlLabel
                classes={{ label: classes.checkBoxLabel }}
                style={controlLabelStyle}
                key={val.value}
                control={(
                  <Checkbox
                    color="primary"
                    checked={val.checked}
                    onChange={() => onChange(val)}
                    value={val.value}
                  />
                )}
                label={val.label}
              />
            ))
          }
        </FormGroup>
        {this.errorText()}
      </div>
    );
  }

  errorText() {
    const { isValid } = this.state;
    const { classes } = this.props;

    if (isValid) {
      return null;
    }

    return (
      <FormHelperText classes={{ root: classes.errorMessage }}>
        {this.getErrorMessage()}
      </FormHelperText>
    );
  }
}

CheckBoxGroupValidator.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  formGroupStyle: PropTypes.object,
  controlLabelStyle: PropTypes.object,
};

CheckBoxGroupValidator.defaultProps = {
  ...ValidatorComponent.defaultProps,
  formGroupStyle: { justifyContent: 'space-around' },
  controlLabelStyle: {},
};

export default withStyles(styles)(CheckBoxGroupValidator);
