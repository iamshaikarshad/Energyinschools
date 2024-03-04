/* eslint-disable react/prop-types */
import { isEqual } from 'lodash';

import React from 'react';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // need it for IE fetch compatibility

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';

import { ValidatorComponent } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles';

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

class SelfOpenRequiredSelect extends ValidatorComponent {
  constructor(props) {
    super(props);

    this.state = {
      isValid: true,
      open: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectItems.length && !isEqual(this.props.selectItems, prevProps.selectItems)) {
      this.handleOpen();
    }
  }

  setOpen = (open) => {
    this.setState({ open });
  }

  handleClose = () => {
    this.setOpen(false);
  };

  handleOpen = () => {
    this.setOpen(true);
  };

  handleChange = (e) => {
    const { onChange } = this.props;
    const { value } = e.target;
    if (value) {
      onChange(e);
    }
  };

  errorText() {
    const { isValid } = this.state;
    const { classes } = this.props;

    if (isValid) {
      return null;
    }

    return (
      <FormHelperText className={classes.errorMessage}>
        {this.getErrorMessage()}
      </FormHelperText>
    );
  }

  render() {
    const { open, isValid } = this.state;
    const {
      classes, value, name, label, selectItems, infoLoading,
    } = this.props;

    return (
      <FormControl fullWidth>
        <InputLabel className={classes.xsFontSize}>{label}</InputLabel>
        <Select
          fullWidth
          open={open}
          onClose={this.handleClose}
          onOpen={this.handleOpen}
          value={value}
          onChange={this.handleChange}
          name={name}
          error={!isValid}
        >
          {(
            selectItems.length ? selectItems.map((itemId, index) => (
              <MenuItem
                classes={{ root: classes.menuItemRoot }}
                key={`${itemId}_${index}`} // eslint-disable-line react/no-array-index-key
                value={itemId}
                component="div"
              >
                {itemId}
              </MenuItem>
            )) : (
              <Typography className={classes.noItemsMessage}>
                {infoLoading ? 'Loading...' : 'No items available'}
              </Typography>
            )
          )}
          <MenuItem
            classes={{ root: classes.menuItemRoot }}
            value="Enter your MPAN/MPRN manually"
            component="div"
          >
            Cant not find my MPAN/MPRN
          </MenuItem>
        </Select>
        {this.errorText()}
      </FormControl>
    );
  }
}

SelfOpenRequiredSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  selectItems: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  infoLoading: PropTypes.bool.isRequired,
};

export default withStyles(styles)(SelfOpenRequiredSelect);
