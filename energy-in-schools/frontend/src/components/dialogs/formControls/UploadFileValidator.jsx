import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import red from '@material-ui/core/colors/red';

import TextField from '@material-ui/core/TextField';
import { ValidatorComponent } from 'react-form-validator-core';

const red500 = red['500'];

const styles = theme => ({
  errorTextBlock: {
    fontSize: 14,
    color: red500,
    padding: theme.spacing(0.25, 0),
  },
});

class UploadFileValidator extends ValidatorComponent {
  handleUploadFileChange = (e) => {
    const { onSubmit } = this.props;
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      onSubmit(file);
    }
  };

  errorText() {
    const { classes } = this.props;
    const { isValid } = this.state;
    if (isValid) {
      return null;
    }
    return (
      <div className={classes.errorTextBlock}>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    const {
      classes,
      name,
      fullWidth,
      label,
      accept,
      hidden,
    } = this.props;
    const {
      value,
    } = this.state;

    return (
      <div className={classes.root}>
        <TextField
          type="file"
          margin="dense"
          onChange={this.handleUploadFileChange}
          name={`fileInput${name}`}
          accept={accept}
          style={{ display: 'none' }}
        />
        <TextField
          disabled
          fullWidth={fullWidth}
          label={label}
          margin="dense"
          value={value && value.name ? value.name : ''}
          name={name}
          style={{ display: hidden ? 'none' : 'inline-flex' }}
        />
        {this.errorText()}
      </div>
    );
  }
}

UploadFileValidator.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool,
  label: PropTypes.string,
  accept: PropTypes.string,
  hidden: PropTypes.bool,
};

UploadFileValidator.defaultProps = {
  ...ValidatorComponent.defaultProps,
  fullWidth: false,
  label: '',
  accept: '*',
  hidden: false,
};

export default withStyles(styles)(UploadFileValidator);
