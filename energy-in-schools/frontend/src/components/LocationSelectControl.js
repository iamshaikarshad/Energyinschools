import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { SelectValidator } from 'react-material-ui-form-validator';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Select from '@material-ui/core/Select';

const styles = {
  choiceContainer: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  choiceAvatar: {
    height: 32,
    width: 32,
    marginRight: 8,
  },
  choiceText: {
    display: 'inline-block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const LocationSelectControl = ({
  classes, isValidated, locations, mainLocationColor, subLocationColor, innerComponentClasses, ...rest
}) => {
  const Component = isValidated ? SelectValidator : Select;
  const locationsCopy = cloneDeep(locations);

  const getLocationChoices = () => (
    locationsCopy.sort((x, y) => x.is_sub_location - y.is_sub_location).map(location => (
      <MenuItem
        key={location.id}
        value={location.id}
      >
        <span className={classes.choiceContainer}>
          <Avatar
            className={classes.choiceAvatar}
            style={{
              backgroundColor: location.is_sub_location ? subLocationColor : mainLocationColor,
            }}
          >{location.name.charAt(0).toUpperCase()}
          </Avatar>
          <span className={classes.choiceText}>
            {location.name}
          </span>
        </span>
      </MenuItem>
    ))
  );

  return (
    <Component
      classes={innerComponentClasses}
      {...rest}
    >
      {getLocationChoices()}
    </Component>
  );
};


LocationSelectControl.propTypes = {
  classes: PropTypes.object.isRequired,
  locations: PropTypes.array.isRequired,
  innerComponentClasses: PropTypes.object,
  mainLocationColor: PropTypes.string,
  subLocationColor: PropTypes.string,
  isValidated: PropTypes.bool,
};

LocationSelectControl.defaultProps = {
  isValidated: false,
  subLocationColor: '#bdbdbd',
  mainLocationColor: '#00bcd4',
  innerComponentClasses: {},
};

export default withStyles(styles)(LocationSelectControl);
