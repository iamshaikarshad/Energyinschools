import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const ConfirmationCheckbox = ({
  checked, onChange, label, value, color,
}) => (
  <FormControlLabel
    control={(
      <Checkbox
        checked={checked}
        onChange={onChange}
        value={value}
        color={color}
      />
    )}
    label={label}
  />
);

ConfirmationCheckbox.propTypes = {
  checked: PropTypes.bool,
  value: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  color: PropTypes.string,
};

ConfirmationCheckbox.defaultProps = {
  checked: false,
  value: '',
  label: '',
  color: 'default',
  onChange: () => {},
};

export default ConfirmationCheckbox;
