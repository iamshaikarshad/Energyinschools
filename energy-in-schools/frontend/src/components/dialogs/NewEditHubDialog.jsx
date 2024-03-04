import React from 'react';
import { isEqual, isEmpty } from 'lodash';

import PropTypes from 'prop-types';
import shortid from 'shortid';

import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Refresh from '@material-ui/icons/Refresh';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { SelectValidator, TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles/index';
import { compose } from 'redux';
import LocationSelectControl from '../LocationSelectControl';
import RootDialog from './RootDialog';
import { HUB_TYPE_DETAILS } from '../../constants/hubConstants';

import { NAME_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '../../constants/config';

const styles = theme => ({
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
    padding: 0,
  },
  hubTypeHintContainer: {
    display: 'inline-block',
    width: '100%',
    fontFamily: 'Roboto',
    color: '#00424a',
    border: '1px solid #00bcd4',
    padding: theme.spacing(1),
    margin: theme.spacing(1, 0),
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
});


class NewEditHubDialog extends React.Component {
  state = {
    id: '',
    name: '',
    description: '',
    uid: shortid.generate().substring(0, 5),
    locationId: '',
    type: '',
  };

  editHubForm = null;

  componentWillReceiveProps(nextProps) {
    const { hub } = this.props;
    if (!isEqual(hub, nextProps.hub) && !isEmpty(nextProps.hub)) {
      this.setState({
        id: nextProps.hub.id,
        name: nextProps.hub.name,
        description: nextProps.hub.description,
        uid: nextProps.hub.uid,
        type: nextProps.hub.type,
        locationId: nextProps.hub.sub_location_id,
      });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit(this.state);
  };

  render() {
    const {
      isOpened, onClose, classes, locations, title,
    } = this.props;
    const {
      name, description, uid, locationId, type,
    } = this.state;

    const hubDetails = HUB_TYPE_DETAILS[type];

    return (
      <RootDialog
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.editHubForm.submit()}
        submitLabel="Save"
      >
        <ValidatorForm
          ref={(el) => { this.editHubForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <TextValidator
            autoComplete="off"
            type="text"
            fullWidth
            label="Hub name"
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
            label="Hub type"
            margin="dense"
            onChange={event => this.setState({ type: event.target.value })}
            name="hubType"
            value={type}
            validators={['required']}
            errorMessages={['This field is required']}
          >
            {Object.keys(HUB_TYPE_DETAILS).map(hubType => (
              <MenuItem key={hubType} value={hubType}>{HUB_TYPE_DETAILS[hubType].label}</MenuItem>
            ))}
          </SelectValidator>
          {hubDetails && (
            <Paper className={classes.hubTypeHintContainer}>
              Follow this <a target="_blank" rel="noopener noreferrer" href={hubDetails.manualLink}>link</a> for setup manual
            </Paper>
          )}
          <TextValidator
            fullWidth
            label="Hub UID"
            margin="dense"
            onChange={event => this.setState({ uid: event.target.value })}
            name="uid"
            value={uid}
            validators={['required', 'maxStringLength:5']}
            errorMessages={['This field is required', 'No more than 5 symbols']}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    className={classes.iconButton}
                    onClick={() => { this.setState({ uid: shortid.generate().substring(0, 5) }); }}
                  >
                    <Refresh />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <LocationSelectControl
            isValidated
            locations={locations}
            fullWidth
            label="Hub location"
            margin="dense"
            onChange={event => this.setState({ locationId: event.target.value })}
            name="locationId"
            value={locationId}
            validators={['required']}
            errorMessages={['This field is required']}
          />
          <TextValidator
            multiline
            rows={3}
            rowsMax={5}
            fullWidth
            label="Hub description"
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

NewEditHubDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  hub: PropTypes.object.isRequired,
  title: PropTypes.string,
};

NewEditHubDialog.defaultProps = {
  title: 'Create hub',
};

export default compose(withStyles(styles))(NewEditHubDialog);
