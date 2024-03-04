/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // need it for IE fetch compatibility
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { Async } from 'react-select';
import { ValidatorComponent } from 'react-material-ui-form-validator';
import { debounce } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';

import * as schoolsActions from '../../actions/schoolsActions';

import { AutocompleteComponents, AutocompleteComponentsStyles } from '../dialogs/formControls/AutocompleteComponents';

import { POSTCODES_SEARCH_BASE_URL } from './constants';

const styles = theme => ({
  ...AutocompleteComponentsStyles(theme),
  addressMenu: {
    maxHeight: '300px',
    overflow: 'auto',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  noAddressMessage: {
    padding: theme.spacing(1, 2),
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: '0.875rem',
    lineHeight: '1.5em',
  },
  menuItemRoot: {
    overflow: 'visible',
    [theme.breakpoints.down('xs')]: {
      fontSize: '12px',
    },
  },
});

class PostcodeAutocomplete extends ValidatorComponent {
  addressList = [];

  latitude = null;

  longitude = null;

  getParsedAddressInfo = (address) => {
    const addressLine1 = address.address_line_1 || '';
    const addressLine2 = address.address_line_2 || '';
    const city = address.town || '';
    const postcode = address.postcode || '';
    const fullAddress = address.full_address || '';
    const mpan = address.mpan || [];
    const mprn = address.mprn || [];

    return {
      addressLine1,
      addressLine2,
      city,
      postcode,
      fullAddress,
      mpan,
      mprn,
    };
  }

  handleChange = (chosenValue) => {
    const { onChange, updateInfo, hideAddressList } = this.props;
    if (chosenValue) {
      const value = chosenValue.value;
      updateInfo({
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        fullAddress: '',
        mpan: [],
        mprn: [],
      });
      onChange(value);
      if (!hideAddressList) {
        this.fetchAddressListByPostcode(value);
      }
    }
  }

  handleInputChange = (value) => {
    this.setState({ inputValue: value });
    return value;
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

  fetchCoordsByPostcode = postcode => window.fetch(`${POSTCODES_SEARCH_BASE_URL}/${postcode}/`);

  fetchPostcodes = (input, callback) => {
    window.fetch(`${POSTCODES_SEARCH_BASE_URL}/${input}/autocomplete/`)
      .then(response => response.json())
      .then((json) => {
        if (json.result) {
          return callback(json.result.map(code => ({ value: code, label: code })));
        }
        return callback([]);
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
        return callback([]);
      });
  };

  fetchAddressListByPostcode = (postcode) => {
    if (!postcode) return;
    const { informOnResult, actions, hideAddressList } = this.props;
    this.fetchCoordsByPostcode(postcode)
      .then(response => response.json())
      .then((json) => {
        const result = json.result;
        if (result) {
          this.latitude = result.latitude;
          this.longitude = result.longitude;
        }
        return actions.getAddressesWithMetersByPostCode(postcode);
      })
      .then((response) => {
        this.addressList = response.data;
        this.setState({ addressMenuIsOpen: !hideAddressList });
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
        informOnResult(false);
      });
  }

  debouncedFetchPostcodes = debounce(this.fetchPostcodes, 250);

  getCodes = (input, callback) => {
    if (!input) {
      return callback([]);
    }
    /* eslint-disable-next-line react/no-this-in-sfc */
    this.debouncedFetchPostcodes(input, callback);
    return null;
  };

  handleAddressSelect = address => () => {
    const { updateInfo, informOnResult } = this.props;
    const {
      addressLine1, addressLine2, city, postcode, fullAddress, mpan, mprn,
    } = this.getParsedAddressInfo(address);
    this.setState({ addressMenuIsOpen: false }, () => {
      updateInfo({
        addressLine1,
        addressLine2,
        city,
        postcode,
        fullAddress,
        mpan,
        mprn,
        latitude: this.latitude,
        longitude: this.longitude,
      });
      informOnResult(true);
    });
  }

  handleClickAway = () => {
    this.setState({ addressMenuIsOpen: false });
  };

  render() {
    const {
      classes, theme, placeholder,
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

    const { addressMenuIsOpen } = this.state;

    return (
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <Async
          cacheOptions
          defaultOptions
          isClearable
          classes={classes}
          styles={selectStyles}
          loadOptions={this.getCodes}
          components={AutocompleteComponents}
          onChange={value => this.handleChange(value)}
          onInputChange={this.handleInputChange}
          getOptionLabel={option => option.label}
          placeholder={placeholder}
          noOptionsMessage={() => 'No results found'}
        />
        {addressMenuIsOpen && (
          <ClickAwayListener onClickAway={this.handleClickAway}>
            <Paper className={classes.addressMenu} square elevation={2}>
              {this.addressList.length ? this.addressList.map((address, index) => (
                <MenuItem
                  key={`${address.address_line_1}_${index}`} // eslint-disable-line react/no-array-index-key
                  component="div"
                  classes={{ root: classes.menuItemRoot }}
                  onClick={this.handleAddressSelect(address)}
                >
                  {address.full_address}
                </MenuItem>
              )) : (
                <Typography className={classes.noAddressMessage}>No address found</Typography>)}
            </Paper>
          </ClickAwayListener>
        )}
        {this.errorText()}
      </div>
    );
  }
}

PostcodeAutocomplete.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired,
  updateInfo: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  informOnResult: PropTypes.func,
  callErrorMessage: PropTypes.func,
  hideAddressList: PropTypes.bool,

  placeholder: PropTypes.string,
};

PostcodeAutocomplete.defaultProps = {
  ...ValidatorComponent.defaultProps,
  informOnResult: () => {},
  callErrorMessage: () => {},
  hideAddressList: false,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...schoolsActions,
    }, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles, { withTheme: true }),
)(PostcodeAutocomplete);
