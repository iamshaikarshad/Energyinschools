import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import StackGrid from 'react-stack-grid';

import moment from 'moment';
import Device from '../components/Device';
import SLEAdminHeader from '../components/SLEAdminHeader';
import EditDeviceDialog from '../components/dialogs/EditDeviceDialog';
import NoItems from '../components/NoItems';
import DevicesRefreshButton from '../components/DevicesRefreshButton';
import TokenManager from '../utils/tokenManager';
import * as devicesActions from '../actions/devicesActions';
import * as dialogActions from '../actions/dialogActions';
import * as schoolsActions from '../actions/schoolsActions';
import { SLE_ADMIN_ROLE, SEM_ADMIN_ROLE } from '../constants/config';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
    paddingTop: 40,
    paddingBottom: 100,
  },
  item: {
    padding: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cardsWrapper: {
    display: 'flex',
    maxWidth: 2000,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  adminHeaderWrapper: {
    [theme.breakpoints.down('xs')]: {
      padding: '0 !important',
    },
  },
});

class SmartThingsDevices extends React.Component {
  state = {
    editDialogOpened: false,
    deviceToEdit: {},
    readOnly: ![SLE_ADMIN_ROLE, SEM_ADMIN_ROLE].includes(TokenManager.getUserRole()),
  };

  componentDidMount() {
    const { actions, user } = this.props;
    actions.getSchoolInformation(user.location_id);
    actions.getDevicesList();
    actions.getAllSchools(true);
  }

  onDeviceEditSubmit = (id, label) => {
    const { actions } = this.props;
    actions.editDevice(id, label).then(() => {
      actions.getDevicesList();
      this.toggleEditDeviceDialog({});
    });
  };

  getLocationById = (id) => {
    const { allLocations } = this.props;
    const found = allLocations.find(location => location.id === id);
    return found ? found.name : '';
  };

  toggleEditDeviceDialog = (device) => {
    this.setState(prevState => ({ editDialogOpened: !prevState.editDialogOpened, deviceToEdit: device }));
  };

  render() {
    const {
      classes, school, devices, actions, allLocations,
    } = this.props;
    const { editDialogOpened, deviceToEdit, readOnly } = this.state;
    const devicesStatusesUpdatedValidDates = devices.map(d => moment(d.status_updated_at)).filter(d => d.isValid());
    const lastUpdatedAt = devicesStatusesUpdatedValidDates.length > 0 ? moment.max(devicesStatusesUpdatedValidDates) : null;
    const sortedDevices = [...devices].sort((a, b) => b.is_connected - a.is_connected);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">

          <Grid item container xs={12} md={10} spacing={3}>
            <Grid item xs={12} container className={classes.adminHeaderWrapper}>
              {school.name
                && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  leftContent={(
                    <DevicesRefreshButton
                      lastUpdated={lastUpdatedAt}
                      onClick={() => { actions.getRefreshedDevicesList(); }}
                    />
                  )}
                />
                )
              }
            </Grid>

            <Grid xs={12} item>
              {
                sortedDevices.length > 0 ? (
                  <StackGrid columnWidth={280} gridRef={(grid) => { this.gridRef = grid; }}>
                    {
                      sortedDevices.map(device => (
                        <Grid item key={device.id} className={classes.item}>
                          <Device
                            name={device.label || device.name}
                            id={device.smart_things_id}
                            allowedForUse={device.is_connected || false}
                            roomName={device.room_name}
                            deviceCapabilities={device.capabilities}
                            readOnly={readOnly}
                            updatedAt={device.status_updated_at}
                            connectionStatus={
                              {
                                status: device.status,
                                updatedAt: device.status_updated_at,
                              }
                            }
                            batteryHealth={device.battery_health}
                            onAllowedSwitch={() => { actions.changeStatusDevice(device); }}
                            onEditClick={() => this.toggleEditDeviceDialog(device)}
                            showMessageBar={actions.showMessageSnackbar}
                            // in StackGrid need always to update if item changes size in order to avoid overlapping
                            onUpdatedSize={() => { this.gridRef.updateLayout(); }}
                          />
                        </Grid>
                      ))
                    }
                  </StackGrid>
                ) : (
                  <NoItems />
                )
              }
            </Grid>
          </Grid>
        </Grid>
        <EditDeviceDialog
          locations={allLocations}
          isOpened={editDialogOpened}
          device={deviceToEdit}
          onSubmit={this.onDeviceEditSubmit}
          onClose={() => this.toggleEditDeviceDialog({})}
        />
      </div>
    );
  }
}

SmartThingsDevices.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  devices: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  allLocations: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...devicesActions,
      ...schoolsActions,
      ...dialogActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    user: state.users.currentUser,
    school: state.schools.activeSchool,
    allLocations: state.schools.allLocations.data,
    devices: state.devices.data,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SmartThingsDevices);
