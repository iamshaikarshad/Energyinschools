import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm, SelectValidator } from 'react-material-ui-form-validator';

import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles/index';
import { MICROBIT_UNIT } from '../../constants/config';

import TextInputSuggest from './formControls/TextInputSuggest';
import RootDialog from './RootDialog';

export const VARIABLE_DIALOG_TYPES = Object.freeze({
  newDataset: 'NEW_DATASET',
  newVariable: 'NEW_VARIABLE',
  newDatasetVariable: 'NEW_DATASET_VARIABLE',
  editVariable: 'EDIT_VARIABLE',
});

const styles = theme => ({
  dialogContent: {
    maxWidth: 500,
    paddingTop: 20,
    [theme.breakpoints.down('xs')]: {
      padding: 10,
    },
  },
});

const unitLabelSuggestions = Object.values(MICROBIT_UNIT).map(unit => (
  {
    value: unit,
    label: unit,
  }
));

class NewEditVariableDialog extends React.Component {
  state = {
    key: '',
    value: '',
    hubUid: '',
    namespace: '',
    name: '',
    datasetType: '',
    unitLabel: '',
    sharedWith: 'SCHOOL',
  };

  createVariableForm = null;

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        key: nextProps.variable.key || '',
        value: nextProps.variable.value || '',
        hubUid: nextProps.variable.hub_uid || '',
        sharedWith: nextProps.variable.shared_with || 'SCHOOL',
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit(this.state);
  };

  getDialogTitle() {
    const { type } = this.props;
    switch (type) {
      case VARIABLE_DIALOG_TYPES.newDataset:
        return 'Add new dataset';
      case VARIABLE_DIALOG_TYPES.editVariable:
        return 'Edit variable';
      case VARIABLE_DIALOG_TYPES.newDatasetVariable:
        return 'Add new value to dataset';
      default:
        return 'Add new variable';
    }
  }

  render() {
    const {
      classes, isOpened, onClose, hubs, type,
    } = this.props;
    const {
      key, value, hubUid, sharedWith, namespace, name, datasetType,
    } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={this.getDialogTitle()}
        onSubmit={() => this.createVariableForm.submit()}
        submitLabel={type === VARIABLE_DIALOG_TYPES.editVariable ? 'Edit' : 'Create'}
      >
        <ValidatorForm
          ref={(el) => {
            this.createVariableForm = el;
          }}
          onSubmit={this.onFormSubmit}
        >
          {type === VARIABLE_DIALOG_TYPES.newDataset && (
          <React.Fragment>
            <TextValidator
              fullWidth
              label="Namespace"
              margin="dense"
              onChange={event => this.setState({ namespace: event.target.value })}
              name="namespace"
              value={namespace}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            <TextValidator
              fullWidth
              label="Name"
              margin="dense"
              onChange={event => this.setState({ name: event.target.value })}
              name="name"
              value={name}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            <TextValidator
              type="number"
              fullWidth
              label="Type"
              margin="dense"
              onChange={event => this.setState({ datasetType: event.target.value })}
              name="type"
              value={datasetType}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            <TextInputSuggest
              suggestions={unitLabelSuggestions}
              onChange={val => this.setState({ unitLabel: val })}
              textInputProps={
                    {
                      label: 'Unit label',
                      margin: 'dense',
                      name: 'UnitLabel',
                      validators: ['required'],
                      errorMessages: ['This field is required'],
                      fullWidth: true,
                    }
                  }
              showHint
              hintText="Select from standard units dropdown or input your own"
              hintStyle={{
                color: '#008ba3',
                fontSize: 12,
              }}
            />
          </React.Fragment>
          )}
          {![VARIABLE_DIALOG_TYPES.newDataset, VARIABLE_DIALOG_TYPES.newDatasetVariable].includes(type) && (
          <TextValidator
            fullWidth
            label="Key"
            margin="dense"
            onChange={event => this.setState({ key: event.target.value })}
            name="key"
            value={key}
            validators={['required']}
            errorMessages={['This field is required']}
            InputProps={{
              readOnly: [VARIABLE_DIALOG_TYPES.editVariable].includes(type),
            }}
          />
          )}
          { type !== VARIABLE_DIALOG_TYPES.newDataset && (
          <TextValidator
            fullWidth
            label="Value"
            margin="dense"
            onChange={event => this.setState({ value: event.target.value })}
            name="value"
            value={value}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          )}
          { type !== VARIABLE_DIALOG_TYPES.newDatasetVariable && (
          <SelectValidator
            fullWidth
            label="Hub"
            margin="dense"
            onChange={event => this.setState({ hubUid: event.target.value })}
            name="hubUid"
            value={hubUid}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {hubs.map(hub => (
              <MenuItem key={hub.uid} value={hub.uid}>{hub.uid}</MenuItem>
            ))}
          </SelectValidator>
          )}
          { [VARIABLE_DIALOG_TYPES.editVariable, VARIABLE_DIALOG_TYPES.newVariable].includes(type) && (
          <SelectValidator
            fullWidth
            label="Shared with"
            margin="dense"
            onChange={event => this.setState({ sharedWith: event.target.value })}
            name="sharedWith"
            value={sharedWith}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {['SCHOOL', 'ALL'].map(shareType => (
              <MenuItem key={shareType} value={shareType}>{shareType}</MenuItem>
            ))}
          </SelectValidator>
          )}
        </ValidatorForm>
      </RootDialog>
    );
  }
}

NewEditVariableDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  hubs: PropTypes.array.isRequired,
  type: PropTypes.oneOf(Object.values(VARIABLE_DIALOG_TYPES)).isRequired,
  variable: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

NewEditVariableDialog.defaultProps = {
  variable: {},
};

export default compose(withStyles(styles))(NewEditVariableDialog);
