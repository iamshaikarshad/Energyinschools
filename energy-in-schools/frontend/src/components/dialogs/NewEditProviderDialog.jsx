import React from 'react';
import { isEqual, isEmpty } from 'lodash';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import MenuItem from '@material-ui/core/MenuItem';

import { withStyles } from '@material-ui/core/styles/index';
import {
  CHAMELEON,
  DUMMY,
  ENERGY_ASSETS,
  GEO,
  N3RGY,
  OVO,
  PROVIDER_TYPE_LABELS,
  SUPPORTED_PROVIDERS,
  NAME_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  HILDEBRAND,
} from '../../constants/config';
import RootDialog from './RootDialog';

const styles = {
  dialogContent: {
    maxWidth: 500,
  },
};

class NewEditProviderDialog extends React.Component {
  state = {
    id: '',
    name: '',
    description: '',
    locationId: '',
    providerType: '',
    credentials: {},
  };

  editProviderForm = null;

  componentWillReceiveProps(nextProps) {
    const { provider } = this.props;
    if (!isEqual(provider, nextProps.provider) && !isEmpty(nextProps.provider)) {
      this.setState({
        id: nextProps.provider.id,
        name: nextProps.provider.name,
        description: nextProps.provider.description,
        locationId: nextProps.provider.location_id,
        providerType: nextProps.provider.provider,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit(this.state);
  };

  getProviderCredentialsFields = (providerType) => {
    switch (providerType) {
      case OVO:
      case GEO:
      case N3RGY:
      case CHAMELEON:
      case HILDEBRAND:
      case ENERGY_ASSETS:
      case DUMMY: {
        const { credentials } = this.state;
        const { login, password } = credentials;
        return (
          <React.Fragment>
            <TextValidator
              autoComplete="off"
              fullWidth
              label="Login"
              margin="dense"
              onChange={event => this.setState({
                credentials: {
                  ...credentials,
                  login: event.target.value,
                },
              })}
              name="login"
              value={login}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            <TextValidator
              autoComplete="new-password"
              type="password"
              fullWidth
              label="Password"
              margin="dense"
              onChange={event => this.setState({
                credentials: {
                  ...credentials,
                  password: event.target.value,
                },
              })}
              name="password"
              value={password}
              validators={['required']}
              errorMessages={['This field is required']}
            />
          </React.Fragment>
        );
      }
      default:
        return null;
    }
  };

  render() {
    const {
      classes, isOpened, onClose, title, provider,
    } = this.props;
    const {
      name, description, providerType,
    } = this.state;

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.editProviderForm.submit()}
        submitLabel="Save"
      >
        <ValidatorForm
          // eslint-disable-next-line no-return-assign
          ref={el => this.editProviderForm = el}
          onSubmit={this.onFormSubmit}
          autoComplete="off"
        >
          <TextValidator
            autoComplete="off"
            type="text"
            fullWidth
            label="Provider name"
            margin="dense"
            onChange={event => this.setState({ name: event.target.value })}
            name="name"
            value={name}
            validators={['required', 'matchRegexp:^[\\w()\\s&-]+$', 'trim', `maxStringLength:${NAME_MAX_LENGTH}`]}
            errorMessages={[
              'This field is required',
              'Only letters, numbers, \'-\', \'_\', \'&\' and parentheses are allowed',
              'No blank text',
              `No more than ${NAME_MAX_LENGTH} symbols`,
            ]}
          />
          <SelectValidator
            fullWidth
            label="Provider type"
            margin="dense"
            onChange={event => this.setState({ providerType: event.target.value })}
            name="providerId"
            value={providerType}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {SUPPORTED_PROVIDERS.map(prov => (
              <MenuItem key={prov} value={prov}>{PROVIDER_TYPE_LABELS[prov]}</MenuItem>
            ))}
            {/* TODO: this should be removed after all dummy providers are deleted */}
            {(provider && provider.provider === DUMMY)
              && <MenuItem value={DUMMY}>{PROVIDER_TYPE_LABELS[DUMMY]}</MenuItem>
            }
          </SelectValidator>
          {this.getProviderCredentialsFields(providerType)}
          <TextValidator
            multiline
            rows={3}
            rowsMax={5}
            fullWidth
            label="Provider description"
            margin="dense"
            onChange={event => this.setState({ description: event.target.value })}
            name="description"
            value={description}
            validators={['required', `maxStringLength:${DESCRIPTION_MAX_LENGTH}`]}
            errorMessages={['This field is required', `No more than ${DESCRIPTION_MAX_LENGTH} symbols`]}
          />
        </ValidatorForm>
      </RootDialog>
    );
  }
}

NewEditProviderDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  provider: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

NewEditProviderDialog.defaultProps = {
  title: 'Create provider',
};

export default compose(withStyles(styles))(NewEditProviderDialog);
