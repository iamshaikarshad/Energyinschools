import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import SLEAdminHeader from '../../components/SLEAdminHeader';
import NoItems from '../../components/NoItems';

import * as dialogActions from '../../actions/dialogActions';
import * as schoolsActions from '../../actions/schoolsActions';
import * as energyAlertActions from '../../actions/energyAlertActions';
import * as metersActions from '../../actions/metersActions';
import * as smartThingsSensorsActions from '../../actions/smartThingsSensorsActions';
import AlertsStatusHeader from '../../components/AlertsConfiguartion/AlertsStatusHeader';
import EnergyAlert from '../../components/AlertsConfiguartion/EnergyAlert';
import NewEnergyAlertDialog from '../../components/dialogs/NewEnergyAlertDialog';
import AlertDeleteDialog from '../../components/AlertsConfiguartion/dialogs/AlertDeleteDialog';
import AlertsDisableDialog from '../../components/AlertsConfiguartion/dialogs/AlertsDisableDialog';
import { ENERGY_ALERTS_TYPE } from '../../components/AlertsConfiguartion/constants';

import { SMART_THINGS_SENSOR_CAPABILITY } from '../../constants/config';

const styles = theme => ({
  root: {
    fontFamily: 'Roboto-Medium',
    paddingBottom: 100,
  },
  cardsWrapper: {
    backgroundColor: 'white',
    borderRadius: '7px',
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'transparent',
      borderRadius: '0',
    },
  },
  pagination: {
    listStyleType: 'none',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 24,
    fontWeight: 700,
  },
  paginationItem: {
    display: 'inline-block',
    marginLeft: 5,
    marginRight: 5,
    color: 'rgb(0, 188, 212)',
    opacity: 0.4,
    cursor: 'default',
  },
  prevNext: {
    opacity: 1,
  },
  active: {
    opacity: 1,
    '&>a': {
      outline: 'none',
    },
  },
  disabled: {
    display: 'none',
  },
  item: {
    padding: theme.spacing(2, 1),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
});

class Alerts extends React.Component {
  state = {
    createDialogOpened: false,
    deleteDialogOpened: false,
    alertsDisableDialogOpened: false,
    alertToDelete: {},
  };

  componentDidMount() {
    const { actions } = this.props;
    actions.getEnergyAlerts();
    actions.getMetersList(true);
    actions.getSmartThingsSensorsList({ capability: SMART_THINGS_SENSOR_CAPABILITY.temperature });
  }

  onAlertCreateDialogSubmit = (...args) => {
    const { actions } = this.props;
    actions.createEnergyAlert(
      args[1].alertType,
      args[1].name,
      args[1].alertFrequency,
      args[1].meterId,
      args[1].locationId,
      args[1].limitCondition,
      args[1].energyLimit,
      args[1].limitDuration,
      args[1].limitPeriodStart,
      args[1].limitPeriodEnd,
      args[1].differencePercentage,
      args[1].activeDays,
    ).then((response) => {
      Promise.all(args[0].map(notificationType => actions.createNotificationTarget(
        notificationType,
        response.data.id,
        args[1].email,
        args[1].phoneNumber,
      )));
    });
    this.toogleCreateDialog();
  };

  onAlertDeleteDialogSubmit = () => {
    const { alertToDelete } = this.state;
    const { actions } = this.props;
    actions.deleteAlert(alertToDelete.id);
    this.toogleDeleteDialog();
  };

  onDisableAllDialogSubmit = () => {
    const { actions, alerts } = this.props;
    this.toogleDisableDialog();
    Promise.all(alerts.data.filter(alert => alert.is_active).map(alert => actions.changeEnergyAlertStatus(alert.id, alert.type, !alert.is_active))).then(() => {
      actions.getEnergyAlerts();
    });
  };

  getAlertLocation = (locationId) => {
    const { allLocations } = this.props;
    return allLocations.find(location => locationId === location.id);
  };

  getAlertMeter = (meterId, alertType) => {
    const { meters, temperatureMeters } = this.props;
    if (alertType === ENERGY_ALERTS_TYPE.temperature_level) {
      return temperatureMeters.find(meter => meterId === meter.id);
    }
    return meters.find(meter => meterId === meter.id);
  };

  toogleCreateDialog = () => {
    this.setState(prevState => ({ createDialogOpened: !prevState.createDialogOpened }));
  };

  toogleDeleteDialog = () => {
    this.setState(prevState => ({ deleteDialogOpened: !prevState.deleteDialogOpened }));
  };

  toogleDisableDialog = () => {
    this.setState(prevState => ({ alertsDisableDialogOpened: !prevState.alertsDisableDialogOpened }));
  };

  render() {
    const {
      classes, actions, school, alerts, allLocations, meters, temperatureMeters,
    } = this.props;
    const {
      createDialogOpened, deleteDialogOpened, alertToDelete, alertsDisableDialogOpened,
    } = this.state;

    const activeAlertTypes = alerts.data.filter(alert => alert.is_active).map(alert => alert.type);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">
          <Grid item xs={12} md={10}>
            <Grid container style={{ padding: '25px 0px' }}>
              {school.name && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  onRefreshClick={actions.getEnergyAlerts}
                  rightContent={{
                    label: 'CREATE ALERT',
                    onClick: this.toogleCreateDialog,
                  }}
                />
              )}
            </Grid>
            <Grid xs={12} item>
              <AlertsStatusHeader activeAlertTypes={activeAlertTypes} onDisableSwitch={this.toogleDisableDialog} />
              <Grid container alignItems="center" justify="center">
                {
                    alerts.data.length > 0 ? (
                      <Grid container justify="space-around">
                        {
                          alerts.data.map(alert => (
                            <Grid item key={alert.id} className={classes.item}>
                              <EnergyAlert
                                id={alert.id}
                                active={alert.is_active}
                                name={alert.name}
                                alertType={alert.type}
                                notificationTypes={alert.notifications.map(notification => notification.type)}
                                location={this.getAlertLocation(alert.source_location_id)}
                                meter={this.getAlertMeter(alert.source_resource_id, alert.type)}
                                limitCondition={alert.value_level && alert.value_level.condition}
                                energyLimit={alert.value_level && alert.value_level.argument}
                                limitDuration={alert.value_level && moment(alert.value_level.min_duration, 'HH:mm:ss').format('mm')}
                                percentageLimit={alert.daily_usage && alert.daily_usage.threshold_in_percents}
                                limitPeriodStart={alert.active_time_range_start}
                                limitPeriodEnd={alert.active_time_range_end}
                                onDelete={() => { this.toogleDeleteDialog(); this.setState({ alertToDelete: alert }); }}
                              />
                            </Grid>
                          ))
                        }
                      </Grid>
                    ) : (
                      <NoItems />
                    )
                  }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <AlertDeleteDialog
          isOpened={deleteDialogOpened}
          name={alertToDelete.name || ''}
          onSubmit={this.onAlertDeleteDialogSubmit}
          onClose={this.toogleDeleteDialog}
        />
        <AlertsDisableDialog
          isOpened={alertsDisableDialogOpened}
          onClose={this.toogleDisableDialog}
          alertTypes={activeAlertTypes}
          onSubmit={this.onDisableAllDialogSubmit}
        />
        <NewEnergyAlertDialog
          isOpened={createDialogOpened}
          onClose={this.toogleCreateDialog}
          locations={allLocations}
          allMeters={{
            temperature: temperatureMeters,
            energy: meters,
          }}
          meters={meters}
          onSubmit={this.onAlertCreateDialogSubmit}
        />
      </div>
    );
  }
}

Alerts.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  alerts: PropTypes.object.isRequired,
  meters: PropTypes.array.isRequired,
  temperatureMeters: PropTypes.array.isRequired,
  allLocations: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...schoolsActions,
      ...energyAlertActions,
      ...metersActions,
      ...smartThingsSensorsActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    alerts: state.alerts.alerts,
    user: state.users.currentUser,
    meters: state.meters.data,
    temperatureMeters: state.smartThingsSensors.data,
    allLocations: state.schools.allLocations.data,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(Alerts);
