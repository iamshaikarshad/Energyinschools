/* eslint-disable react/prop-types */
import React from 'react';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import red from '@material-ui/core/colors/red';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';


function NoOptionsMessage({ selectProps, innerProps, children }) {
  return (
    <Typography
      color="textSecondary"
      className={selectProps.classes.noOptionsMessage}
      {...innerProps}
    >
      {children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control({
  selectProps, innerProps, children, innerRef,
}) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: selectProps.classes.input,
          inputRef: innerRef,
          children,
          ...innerProps,
        },
      }}
      {...selectProps.textFieldProps}
    />
  );
}

function Option({
  isFocused, isSelected, innerProps, children, innerRef,
}) {
  return (
    <MenuItem
      buttonRef={innerRef}
      selected={isFocused}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
      {...innerProps}
    >
      {children}
    </MenuItem>
  );
}

function Placeholder({ selectProps, innerProps, children }) {
  return (
    <Typography
      color="textSecondary"
      className={selectProps.classes.placeholder}
      {...innerProps}
    >
      {children}
    </Typography>
  );
}

function SingleValue({ selectProps, innerProps, children }) {
  return (
    <Typography className={selectProps.classes.singleValue} {...innerProps}>
      {children}
    </Typography>
  );
}

function ValueContainer({ selectProps, innerProps, children }) {
  return (
    <div className={selectProps.classes.valueContainer} {...innerProps}>
      {children}
    </div>
  );
}

function Menu({ selectProps, innerProps, children }) {
  return (
    <Paper square className={selectProps.classes.paper} {...innerProps}>
      {children}
    </Paper>
  );
}

function DropdownIndicator({ selectProps, innerProps }) {
  return (
    <ArrowDropDownIcon
      className={selectProps.classes.dropdownIndicator}
      {...innerProps}
    />
  );
}

export const AutocompleteComponents = {
  Control,
  Menu,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
  DropdownIndicator,
};

export const AutocompleteComponentsStyles = theme => ({
  root: {
    flexGrow: 1,
    height: 250,
  },
  input: {
    display: 'flex',
    padding: '6px 0px 11px',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2),
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    bottom: 3,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  errorMessage: {
    fontSize: '12px',
    color: red['500'],
  },
  dropdownIndicator: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
});
