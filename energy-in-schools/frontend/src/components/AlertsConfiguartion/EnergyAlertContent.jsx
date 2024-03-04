import React from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import EnergyTypeWidget from './widgets/EnergyTypeWidget';
import LocationWidget from './widgets/LocationWidget';
import LimitWidget from './widgets/LimitWidget';
import DurationWidget from './widgets/DurationWidget';
import LimitPeriodWidget from './widgets/LimitPeriodWidget';
import * as editActions from '../../actions/energyAlertEditActions';
import {
  ALERT_FREQUENCIES,
  ENERGY_ALERTS_TYPE,
  NOTIFICATION_TYPES,
  ENERGY_ALERTS_TYPE_TO_UNIT,
} from './constants';
import EditEnergyTypeDialog from './dialogs/EditEnergyTypeDialog';
import EditLocationDialog from './dialogs/EditLocationDialog';
import DifferencePercentageWidget from './widgets/DifferencePercentageWidget';
import UsageLevelWidget from './widgets/UsageLevelWidget';
import EnergyMeterWidget from './widgets/EnergyMeterWidget';
import LimitConditionWidget from './widgets/LimitConditionWidget';
import { UNIT_TO_LABEL_MAP } from '../../constants/config';

const styles = theme => ({
  cardRoot: {
    width: 650,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
  },
  cardHeaderRoot: {
    padding: theme.spacing(1, 3),
    height: 70,
  },
  cardHeaderFont: {
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.27,
    color: '#fff',
  },
  cardHeaderAction: {
    alignSelf: 'center',
  },
  avatar: {
    borderRadius: 0,
    height: 30,
    width: 30,
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(0.5),
    color: '#fff',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  button: {
    margin: theme.spacing(1),
  },
  meterValueContainer: {
    display: 'flex',
    backgroundColor: 'rgba(181, 181, 181, 0.25)',
    height: 70,
    width: '100%',
    borderRadius: '15px',
    flexDirection: 'column',
    alignItems: 'center',
  },
  meterValueLabel: {
    fontSize: '9px',
    padding: 4,
    color: '#b5b5b5',
  },
  meterValue: {
    display: 'flex',
    fontSize: '35px',
  },
  meterValueUnit: {
    position: 'relative',
    top: '4px',
    fontSize: '14px',
  },
  alertContentText: {
    margin: '0px 13px 10px 0px',
    fontSize: 28,
    lineHeight: 1,
    color: '#b5b5b5',
    fontFamily: 'Roboto',
  },
  contentBlock: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
    },
  },
});

class EnergyAlertContent extends React.Component {
  state = {
    energyTypeEditDialogOpened: false,
    locationEditDialogOpened: false,
    name: '',
    email: '',
    additionalEmail: '',
    phoneNumber: '',
    alertFrequency: ALERT_FREQUENCIES.onceHour,
    locationId: '',
    notificationTypes: [
      {
        label: 'Email',
        value: NOTIFICATION_TYPES.email,
        checked: false,
      },
      {
        label: 'SMS',
        value: NOTIFICATION_TYPES.sms,
        checked: false,
      },
    ],
  };

  onEnergyTypeEditSubmit = (newEnergyType) => {
    const { actions, id } = this.props;
    actions.editEnergyType(id, newEnergyType);
    this.toggleDialog('energyTypeEditDialogOpened');
  };

  onLocationEditSubmit = (newLocation, newMeter) => {
    const { actions, id } = this.props;
    actions.editLocationMeter(id, newLocation, newMeter);
    this.toggleDialog('locationEditDialogOpened');
  };

  onEnergyLimitConditionChange = (newValue) => {
    const { actions, id } = this.props;
    actions.editEnergyLimitCondition(id, newValue);
  };

  onEnergyLimitChange = (newValue) => {
    const { actions, id } = this.props;
    actions.editEnergyLimit(id, newValue);
  };

  onDurationChange = (newValue) => {
    const { actions, id } = this.props;
    actions.editDuration(id, newValue);
  };

  onPeriodChange = (from, to) => {
    const { actions, id } = this.props;
    actions.editPeriod(id, from, to);
  };

  onPercentageChange = (percentage) => {
    const { actions, id } = this.props;
    actions.editPercentage(id, percentage);
  };

  toggleDialog = (dialogFlag) => {
    this.setState(prevState => ({ [dialogFlag]: !prevState[dialogFlag] }));
  };

  render() {
    const { energyTypeEditDialogOpened, locationEditDialogOpened } = this.state;
    const {
      alert, classes, widgetsColour, readOnly, allLocations, meters, temperatureMeters,
    } = this.props;
    let {
      alertType, meter, location, limitCondition, energyLimit, limitDuration, limitPeriodStart, limitPeriodEnd, percentageLimit,
    } = this.props;
    if (!readOnly) {
      ({
        alertType,
        meter,
        location,
        limitCondition,
        energyLimit,
        limitDuration,
        limitPeriodStart,
        limitPeriodEnd,
        percentageLimit,
      } = alert);
    }

    const unitLabel = UNIT_TO_LABEL_MAP[ENERGY_ALERTS_TYPE_TO_UNIT[alertType]];

    return (
      <Grid container direction="column">
        <Grid item container alignItems="center" className={classes.contentBlock}>
          <span className={classes.alertContentText}>If</span>
          <EnergyTypeWidget
            colour={widgetsColour}
            alertType={alertType}
            readOnly={readOnly}
            onEditClick={() => this.toggleDialog('energyTypeEditDialogOpened')}
          />
          {isEmpty(meter) ? (
            <React.Fragment>
              <span className={classes.alertContentText}>in</span>
              <LocationWidget
                colour={widgetsColour}
                name={location.name}
                readOnly={readOnly}
                onEditClick={() => this.toggleDialog('locationEditDialogOpened')}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span className={classes.alertContentText}>for</span>
              <EnergyMeterWidget
                colour={widgetsColour}
                name={meter.name}
                readOnly={readOnly}
                onEditClick={() => this.toggleDialog('locationEditDialogOpened')}
              />
            </React.Fragment>
          )}
        </Grid>
        {alertType.includes('level') && (
          <React.Fragment>
            <Grid item container alignItems="center" className={classes.contentBlock}>
              <span className={classes.alertContentText}>rises</span>
              <LimitConditionWidget
                limitCondition={limitCondition}
                colour={widgetsColour}
                readOnly={readOnly}
                onConditionChange={this.onEnergyLimitConditionChange}
              />
              <LimitWidget
                limit={energyLimit}
                unitLabel={unitLabel}
                colour={widgetsColour}
                readOnly={readOnly}
                onLimitChange={this.onEnergyLimitChange}
              />
              <span className={classes.alertContentText} style={{ marginRight: 0 }}>for more than</span>
            </Grid>
            <Grid item container alignItems="center" className={classes.contentBlock}>
              <DurationWidget
                duration={limitDuration}
                colour={widgetsColour}
                readOnly={readOnly}
                onDurationChange={this.onDurationChange}
              />
              <span className={classes.alertContentText}>during</span>
              <LimitPeriodWidget
                periodStart={limitPeriodStart}
                periodEnd={limitPeriodEnd}
                colour={widgetsColour}
                readOnly={readOnly}
                onPeriodChange={this.onPeriodChange}
              />
            </Grid>
          </React.Fragment>
        )}
        {alertType.includes('usage') && (
          <React.Fragment>
            <Grid item container alignItems="center" className={classes.contentBlock}>
              <span className={classes.alertContentText}>more than</span>
              <DifferencePercentageWidget
                percentage={percentageLimit}
                colour={widgetsColour}
                readOnly={readOnly}
                onPercentageChange={this.onPercentageChange}
              />
              <span className={classes.alertContentText}>higher than</span>
            </Grid>
            <Grid item container alignItems="center" className={classes.contentBlock}>
              <UsageLevelWidget colour={widgetsColour} />
              <span className={classes.alertContentText}>for the previous 5 school days</span>
            </Grid>
          </React.Fragment>
        )}

        <EditEnergyTypeDialog
          isOpened={energyTypeEditDialogOpened}
          alertType={alertType}
          onSubmit={this.onEnergyTypeEditSubmit}
          onClose={() => this.toggleDialog('energyTypeEditDialogOpened')}
        />
        <EditLocationDialog
          isOpened={locationEditDialogOpened}
          meter={meter}
          location={location}
          locations={allLocations}
          alertType={alertType}
          allMeters={{
            temperature: temperatureMeters,
            energy: meters,
          }}
          onSubmit={this.onLocationEditSubmit}
          onClose={() => this.toggleDialog('locationEditDialogOpened')}
        />
      </Grid>
    );
  }
}

EnergyAlertContent.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  widgetsColour: PropTypes.string.isRequired,
  alert: PropTypes.object,
  alertType: PropTypes.oneOf(Object.values(ENERGY_ALERTS_TYPE)).isRequired,
  readOnly: PropTypes.bool,
  energyLimit: PropTypes.number,
  percentageLimit: PropTypes.number,
  meter: PropTypes.object,
  location: PropTypes.object,
  limitDuration: PropTypes.string,
  limitCondition: PropTypes.string,
  limitPeriodStart: PropTypes.string,
  limitPeriodEnd: PropTypes.string,
  allLocations: PropTypes.array,
  meters: PropTypes.array.isRequired,
  temperatureMeters: PropTypes.array.isRequired,
};

EnergyAlertContent.defaultProps = {
  alert: {},
  readOnly: false,
  allLocations: [],
  percentageLimit: 0,
  energyLimit: 0,
  limitCondition: '',
  limitDuration: '',
  limitPeriodStart: '',
  limitPeriodEnd: '',
  meter: {},
  location: {},
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...editActions,
    }, dispatch),
  };
}

function mapStateToProps(state, ownProps) {
  return {
    alert: state.energyAlertsEdit[ownProps.id],
    allLocations: state.schools.allLocations.data,
    meters: state.meters.data,
    temperatureMeters: state.smartThingsSensors.data,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(EnergyAlertContent);
