import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = {
  selectContainer: {
    margin: '8px 0px',
    paddingRight: 8,
    justifyContent: 'flex-end',
  },
  inputLabel: {
    color: 'rgba(100, 255, 255, 0.7)',
  },
  inputLabelFocused: {
    color: 'rgba(100, 255, 255, 0.7) !important',
  },
  select: {
    '&::before': {
      borderBottom: '1px solid rgba(100, 255, 255, 0.7) !important',
    },
    '&:hover::before': {
      borderBottom: '1px solid rgba(100, 255, 255, 0.7) !important',
    },
    '&::after': {
      borderBottom: '1px solid rgba(100, 255, 255, 0.7) !important',
    },
  },
  selectRoot: {
    color: 'rgb(150, 255, 255)',
    width: 150,
  },
  selectIcon: {
    color: 'rgb(150, 255, 255)',
  },
};

const TypeSelect = (props) => {
  const {
    classes, currentValue, onChangePeriodType, options, selectLabel,
  } = props;
  return (
    <Grid container className={classes.selectContainer}>
      <FormControl className={classes.formControl}>
        <InputLabel classes={{ root: classes.inputLabel, focused: classes.inputLabelFocused }}>{selectLabel}</InputLabel>
        <Select
          className={classes.select}
          value={currentValue}
          onChange={onChangePeriodType}
          classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
        >
          {options.map((option) => {
            const { value, label } = option;
            return (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Grid>
  );
};

TypeSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  selectLabel: PropTypes.string,
  currentValue: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  onChangePeriodType: PropTypes.func.isRequired,
};

TypeSelect.defaultProps = {
  selectLabel: 'Period',
  currentValue: '',
};

export default compose(withStyles(styles))(TypeSelect);
