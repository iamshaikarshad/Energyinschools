import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { groupBy, isNil } from 'lodash';

import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

import {
  Element, Events, scrollSpy, scroller,
} from 'react-scroll';

import WarningIcon from '@material-ui/icons/Warning';

import * as dialogActions from '../../actions/dialogActions';
import * as hubsActions from '../../actions/hubsActions';
import * as schoolsActions from '../../actions/schoolsActions';
import * as smartThingsSensorsActions from '../../actions/smartThingsSensorsActions';
import * as devicesActions from '../../actions/devicesActions';

import EditSmartThingsSensorDialog from '../../components/dialogs/EditSmartThingsSensorDialog';
import SmartThingsSensor from '../../components/SmartThingsSensor';
import SLEAdminHeader from '../../components/SLEAdminHeader';
import NoItems from '../../components/NoItems';

import { SMART_THINGS_DEVICE_CONNECTION_STATUS } from '../../constants/config';

import commonSensorIcon from '../../images/devicesIcons/common_sensor_blue.svg';

import getInteger from '../../utils/getInteger';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
  },
  item: {
    width: 292,
    padding: theme.spacing(2),
  },
  cardsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  title: {
    color: '#555555',
    fontSize: '18px',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  },
  subheader: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#00bcd4',
    lineHeight: '16px',
  },
  adminHeaderWrapper: {
    padding: '30px 0',
    [theme.breakpoints.down('xs')]: {
      paddingTop: 15,
      paddingBottom: 15,
    },
  },
  cardHeaderWrapper: {
    paddingLeft: 32,
  },
  groupLabel: {
    padding: '4px 8px',
    textAlign: 'center',
    fontSize: 21,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.57)',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  },
  sensorsGroup: {
    flex: '0 1 auto',
    maxWidth: '100%',
    margin: 10,
    borderRadius: 10,
    boxShadow: '2px 2px 7px 1px #888888',
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      boxShadow: 'none',
      border: '1px solid rgba(0, 0, 0, 0.2)',
      marginLeft: 0,
      marginRight: 0,
    },
  },
  groupAvatar: {
    width: 36,
    height: 35,
    marginRight: 5,
    display: 'inline-block',
    verticalAlign: 'text-bottom',
    transform: 'rotate(-45deg)',
  },
  warningIcon: {
    color: 'rgb(255, 68, 51)',
  },
  warningTooltip: {
    backgroundColor: 'rgba(255, 68, 51, 1)',
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
    borderRadius: 10,
  },
});

const SCROLLER_CONFIG = Object.freeze({
  duration: 2000,
  delay: 400,
  smooth: 'linear',
  offset: -135,
});

const SENSOR_ID_PREFIX = 'sensor_';

class SmartThingsSensors extends React.Component {
  state = {
    editDialogOpened: false,
    sensorToEdit: {},
  };

  sensor = {};

  componentDidMount() {
    const { actions, user } = this.props;
    this.registerScrollEndEvent();
    actions.getSchoolInformation(user.location_id);
    this.getSmartThingsSensorsData();
    actions.getAllSchools(true);
    actions.getDevicesList();
  }

  componentWillUnmount() {
    Events.scrollEvent.remove('end');
  }

  onSensorEditSubmit = (id, name, description, locationId) => {
    const {
      actions, history, location, match: { params },
    } = this.props;
    actions.editSmartThingsSensor(id, name, description, locationId).then(() => {
      if (isNil(params.sensorId)) {
        history.replace(`${location.pathname}/${id}`);
      }
      this.getSmartThingsSensorsData();
      this.toggleEditSensorDialog({});
    });
  };

  getSmartThingsSensorsData = () => {
    const { actions } = this.props;
    actions.getSmartThingsSensorsList()
      .then((data) => {
        data.forEach((sensor) => { actions.getSensorLiveValue(sensor.id); });
        this.execActionsFromURLParams();
      });
  }

  getLocationsSensors = (sensors, locations) => {
    const result = [];
    locations.forEach((location) => {
      const item = Object.assign({}, location);
      const sensorsByDeviceId = groupBy(sensors.filter(sensor => sensor.sub_location_id === location.id), 'device_id');
      item.sensorsGroups = Object.values(sensorsByDeviceId).map((groupSensors) => {
        const deviceData = groupSensors[0].device;
        const {
          id, label, name, status, status_updated_at: updatedAt,
        } = deviceData;
        return {
          id,
          label: label || name,
          deviceConnectionStatus: { status, updatedAt },
          sensors: groupSensors,
        };
      });
      result.push(item);
    });
    return result;
  };

  execActionsFromURLParams = () => {
    const {
      location, history, match: { params }, sensors,
    } = this.props;
    const { state } = location;
    const sensorId = getInteger(params.sensorId);
    if (isNil(sensorId) || sensorId < 0) return;
    this.scrollToSensor(sensorId);
    if (state) {
      const { editDialogOpened } = state;
      if (editDialogOpened) {
        const sensorToEdit = sensors.data.find(sensor => sensor.id === sensorId);
        if (!isNil(sensorToEdit)) {
          this.setState({ editDialogOpened, sensorToEdit });
        }
        history.replace(location.pathname, null);
      }
    }
  }

  openTargetExtendedInfo = (targetRef) => {
    const target = this.sensor[targetRef];
    if (target) {
      target.handleExpandClick();
    }
  }

  refreshSmartThingsSensorsData = () => {
    const { actions } = this.props;
    actions.refreshDevices()
      .then(() => {
        this.getSmartThingsSensorsData();
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
      });
  }

  registerScrollEndEvent = () => {
    Events.scrollEvent.register('end', (target) => {
      this.openTargetExtendedInfo(target);
    });

    scrollSpy.update();
  }

  scrollToSensor = (id) => {
    const { sensors } = this.props;
    const targetSensor = sensors.data.find(sensor => sensor.id === id);
    if (targetSensor) {
      scroller.scrollTo(
        `${SENSOR_ID_PREFIX}${id}`,
        SCROLLER_CONFIG,
      );
    }
  }

  toggleEditSensorDialog = (sensor) => {
    this.setState(prevState => ({ editDialogOpened: !prevState.editDialogOpened, sensorToEdit: sensor }));
  };

  render() {
    const {
      classes, school, actions, sensors, allLocations,
    } = this.props;

    const {
      editDialogOpened, sensorToEdit,
    } = this.state;

    const locationsSensors = this.getLocationsSensors(sensors.data, allLocations.data);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">
          <Grid item container xs={12} md={10} className={classes.adminHeaderWrapper}>
            {
              school.name && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  updateButtonLabel="Refresh sensors info"
                  onRefreshClick={this.refreshSmartThingsSensorsData}
                />
              )
            }
          </Grid>
          <Grid xs={12} item>
            {
              locationsSensors.length > 0 ? (
                locationsSensors.map(location => (
                  <div key={location.id} style={{ marginBottom: 40 }}>
                    <Grid container alignItems="center" justify="center" style={{ backgroundColor: 'rgba(181, 181, 181, 0.25)' }}>
                      <Grid item xs={12} sm={10} container className={classes.cardHeaderWrapper}>
                        <CardHeader
                          title={location.name.toUpperCase()}
                          subheader={`ID: ${location.uid}`}
                          classes={{ root: classes.root, title: classes.title, subheader: classes.subheader }}
                        />
                      </Grid>
                    </Grid>
                    <Grid container alignItems="center" justify="center">
                      <Grid item xs={12} md={10} container justify="center" alignItems="flex-start">
                        {location.sensorsGroups.length > 0 ? (
                          <React.Fragment>
                            {location.sensorsGroups.map(group => (
                              <Grid item key={`sensorsGroup_${group.id}`} className={classes.sensorsGroup}>
                                <Typography component="div" className={classes.groupLabel}>
                                  <Avatar src={commonSensorIcon} className={classes.groupAvatar} />
                                  {group.label}
                                  {group.deviceConnectionStatus.status === SMART_THINGS_DEVICE_CONNECTION_STATUS.OFFLINE && (
                                    <Tooltip
                                      classes={{
                                        tooltip: classes.warningTooltip,
                                      }}
                                      disableFocusListener
                                      disableTouchListener
                                      title="Device is offline"
                                      aria-label="Device is offline"
                                      placement="top"
                                    >
                                      <WarningIcon className={classes.warningIcon} />
                                    </Tooltip>
                                  )}
                                </Typography>
                                <Divider />
                                <Grid container justify="center">
                                  {
                                    group.sensors.map((sensor) => {
                                      const sensorElemId = `${SENSOR_ID_PREFIX}${sensor.id}`;
                                      return (
                                        <Grid item key={sensorElemId} className={classes.item}>
                                          <Element name={sensorElemId}>
                                            <SmartThingsSensor
                                              onRef={(elem) => { this.sensor[sensorElemId] = elem; }}
                                              sensor={sensor}
                                              updatedAt={sensors.lastUpdated}
                                              showMessageBar={actions.showMessageSnackbar}
                                              onEditClick={() => this.toggleEditSensorDialog(sensor)}
                                            />
                                          </Element>
                                        </Grid>
                                      );
                                    })
                                  }
                                </Grid>
                              </Grid>
                            ))}
                          </React.Fragment>
                        ) : null
                        }
                      </Grid>
                    </Grid>
                  </div>
                ))
              ) : (
                <NoItems />
              )
            }
          </Grid>
        </Grid>
        <EditSmartThingsSensorDialog
          sensor={sensorToEdit}
          isOpened={editDialogOpened}
          onSubmit={this.onSensorEditSubmit}
          locations={allLocations.data}
          onClose={() => this.toggleEditSensorDialog({})}
        />
      </div>
    );
  }
}

SmartThingsSensors.propTypes = {
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  allLocations: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  sensors: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...hubsActions,
      ...schoolsActions,
      ...smartThingsSensorsActions,
      ...devicesActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    user: state.users.currentUser,
    allLocations: state.schools.allLocations,
    sensors: state.smartThingsSensors,
    devices: state.devices,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SmartThingsSensors);
