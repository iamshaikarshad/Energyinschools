import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import { isEqual, isEmpty } from 'lodash';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import RootDialog from './RootDialog';

const styles = ({
  formControl: {
    width: '100%',
  },
  inputLabel: {},
  inputLabelFocused: {},
  select: {},
  selectRoot: {},
  selectIcon: {},
});

class SelectTimeResolutionDialog extends React.Component {
  state = {
    selectedOptionIndex: null,
  };

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    if (!isEqual(prevProps.options, options) && !isEmpty(options)) {
      this.setInitialOptionIndex(0);
    }
  }

  onChange = (event) => {
    this.setState({ selectedOptionIndex: event.target.value });
  }

  onSubmit = () => {
    const { options, onSubmit } = this.props;
    const { selectedOptionIndex } = this.state;
    const currentOption = options[selectedOptionIndex];
    const { value } = currentOption || { value: null };
    onSubmit(value);
  }

  setInitialOptionIndex = (index) => {
    this.setState({ selectedOptionIndex: index });
  }

  render() {
    const {
      classes, title, isOpened, onClose, options, submitLabel, selectLabel,
    } = this.props;

    const { selectedOptionIndex } = this.state;

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={this.onSubmit}
        submitLabel={submitLabel}
      >
        <FormControl className={classes.formControl}>
          <InputLabel classes={{ root: classes.inputLabel, focused: classes.inputLabelFocused }}>{selectLabel}</InputLabel>
          <Select
            className={classes.select}
            value={selectedOptionIndex || 0}
            onChange={this.onChange}
            classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
          >
            {options.map((option, index) => {
              const { value, label } = option;
              return (
                <MenuItem key={value} value={index}>
                  {label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </RootDialog>
    );
  }
}

SelectTimeResolutionDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  title: PropTypes.string,
  options: PropTypes.array.isRequired,
  submitLabel: PropTypes.string,
  selectLabel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

SelectTimeResolutionDialog.defaultProps = {
  title: 'Historical data time resolution',
  submitLabel: 'Continue',
  selectLabel: 'Select time resolution',
};

export default withStyles(styles)(SelectTimeResolutionDialog);
