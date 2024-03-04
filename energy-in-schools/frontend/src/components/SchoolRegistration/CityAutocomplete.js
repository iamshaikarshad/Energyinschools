/* eslint-disable react/prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // need it for IE fetch compatibility
import { Async } from 'react-select';
import { ValidatorComponent } from 'react-material-ui-form-validator';
import { debounce, isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';

import { AutocompleteComponents, AutocompleteComponentsStyles } from '../dialogs/formControls/AutocompleteComponents';

import { TELEPORT_CITY_SEARCH_API_URL } from '../../constants/config';

const styles = theme => ({
  ...AutocompleteComponentsStyles(theme),
});

class CityAutocomplete extends ValidatorComponent {
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

  fetchCities = (input, callback) => {
    window.fetch(`${TELEPORT_CITY_SEARCH_API_URL}?search=${input}&embed=city:search-results/city:item`)
      .then(response => response.json())
      .then((json) => {
        // eslint-disable-next-line no-underscore-dangle
        callback(json._embedded['city:search-results'].map(city => city._embedded['city:item']));
      });
  };

  debouncedFetchCities = debounce(this.fetchCities, 250);

  getUsers = (input, callback) => {
    if (isEmpty(input)) {
      return callback([]);
    }
    /* eslint-disable-next-line react/no-this-in-sfc */
    this.debouncedFetchCities(input, callback);
    return null;
  };

  render() {
    const {
      classes, theme, value, onChange, placeholder,
    } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <Async
          cacheOptions
          isClearable
          classes={classes}
          styles={selectStyles}
          loadOptions={this.getUsers}
          components={AutocompleteComponents}
          value={value}
          onChange={onChange}
          getOptionLabel={option => option.name}
          placeholder={placeholder}
          noOptionsMessage={() => 'No results found'}
        />
        {this.errorText()}
      </div>
    );
  }
}

CityAutocomplete.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,

  placeholder: PropTypes.string,
};

CityAutocomplete.defaultProps = {
  ...ValidatorComponent.defaultProps,
  value: null,
};

export default withStyles(styles, { withTheme: true })(CityAutocomplete);
