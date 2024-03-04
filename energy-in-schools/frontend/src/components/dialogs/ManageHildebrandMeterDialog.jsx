import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';

import RootDialog from './RootDialog';
import YesNoRadioGroup from './formControls/YesNoRadioGroup';

const styles = theme => ({
  rootPaper: {},
  titleRoot: {
    padding: 0,
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  dialogTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'normal',
    margin: '28px auto',
    textAlign: 'center',
  },
  dialogContent: {
    padding: 0,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 15,
  },
  titleIcon: {
    width: 30,
    height: 35,
  },
  warningMessage: {
    fontSize: '12px',
    color: '#ffbf00',
    marginBottom: 10,
  },
});

const INITIAL_STATE = {
  meterId: '',
  liveMeterId: '',
  tariffId: '',
  meterName: '',
  login: '',
  password: '',
  isHalfHourMeter: true,
  isPasswordHidden: true,
};

class ManageHildebrandMeterDialog extends React.Component {
  state = { ...INITIAL_STATE };

  newHildebrandMeterForm = null;

  componentDidMount() {
    const { meter } = this.props;

    if (meter) {
      const {
        meterId, name, isHalfHourMeter, liveMeterId,
      } = meter;

      this.setState({
        ...INITIAL_STATE, isHalfHourMeter, meterId, liveMeterId: liveMeterId || '', meterName: name,
      });
    } else {
      this.setState({ ...INITIAL_STATE });
    }
  }

  onFormSubmit = () => {
    const { onSubmit } = this.props;
    const {
      meterId, liveMeterId, tariffId, meterName, login, password, isHalfHourMeter,
    } = this.state;
    onSubmit({
      id: meterId,
      tariffId,
      name: meterName,
      credentials: { login, password },
      isHalfHourMeter,
      liveMeterId: isHalfHourMeter ? liveMeterId : '',
    });
  };

  getNewMeterDelay = event => Math.max(Math.min(parseInt(event.target.value, 10), 1440), 0);

  render() {
    const {
      classes, isOpened, onClose, providerExists, title, submitLabel, meter,
    } = this.props;
    const {
      meterId, liveMeterId, tariffId, meterName, login, password, isHalfHourMeter, isPasswordHidden,
    } = this.state;
    const { isHalfHourMeter: wasHalfHourMeter, meterId: oldMeterId } = meter || { isHalfHourMeter };

    return (
      <RootDialog
        classes={{ dialogContent: classes.dialogContent }}
        isOpened={isOpened}
        onClose={onClose}
        title={title}
        onSubmit={() => this.newHildebrandMeterForm.submit()}
        submitLabel={submitLabel}
      >
        <ValidatorForm
          ref={(el) => { this.newHildebrandMeterForm = el; }}
          onSubmit={this.onFormSubmit}
        >
          <Grid container direction="column" style={{ padding: '0 20px' }}>
            <YesNoRadioGroup
              row
              name="isHalfHourMeter"
              groupLabel="Type *"
              value={isHalfHourMeter}
              customLabelMap={{ yes: '30 minutes readings', no: '1 minute readings' }}
              onSubmit={(value) => { this.setState({ isHalfHourMeter: value }); }}
            />
            {(!meter || meterId !== oldMeterId || isHalfHourMeter !== wasHalfHourMeter) && (
              <FormHelperText className={classes.warningMessage}>
                It may take some time to retrieve historical data for the meter
              </FormHelperText>
            )}
            <TextValidator
              type="text"
              label="Meter name *"
              name="meterName"
              value={meterName}
              onChange={(event) => { this.setState({ meterName: event.target.value }); }}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            <TextValidator
              type="text"
              label="Meter id *"
              name="meterId"
              value={meterId}
              onChange={(event) => { this.setState({ meterId: event.target.value }); }}
              validators={['required']}
              errorMessages={['This field is required']}
            />
            {isHalfHourMeter && (
              <TextValidator
                type="text"
                label="Live Meter id"
                name="liveMeterId"
                value={liveMeterId}
                onChange={(event) => { this.setState({ liveMeterId: event.target.value }); }}
              />
            )}
            <TextValidator
              type="text"
              label="Tariff id"
              name="tariffId"
              value={tariffId}
              onChange={(event) => { this.setState({ tariffId: event.target.value }); }}
            />
            {!providerExists && (
              <React.Fragment>
                <TextValidator
                  type="text"
                  label="Login *"
                  name="login_field"
                  value={login}
                  onChange={(event) => { this.setState({ login: event.target.value }); }}
                  validators={['required']}
                  errorMessages={['This field is required']}
                />
                <div style={{ position: 'relative' }}>
                  <TextValidator
                    type={isPasswordHidden ? 'password' : 'text'}
                    label="Password *"
                    name="password_field"
                    value={password}
                    onChange={(event) => { this.setState({ password: event.target.value }); }}
                    validators={['required']}
                    errorMessages={['This field is required']}
                    style={{ width: '100%' }}
                  />
                  <IconButton
                    style={{
                      position: 'absolute', top: 15, right: 5, padding: 5,
                    }}
                    onClick={() => { this.setState({ isPasswordHidden: !isPasswordHidden }); }}
                  >
                    {isPasswordHidden ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </div>
              </React.Fragment>
            )}
          </Grid>
        </ValidatorForm>
      </RootDialog>
    );
  }
}

ManageHildebrandMeterDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  isOpened: PropTypes.bool.isRequired,
  providerExists: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  meter: PropTypes.object,
};

ManageHildebrandMeterDialog.defaultProps = {
  meter: null,
};

export default withStyles(styles)(ManageHildebrandMeterDialog);
