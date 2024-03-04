import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import CardHeader from '@material-ui/core/CardHeader';
import { withStyles } from '@material-ui/core/styles';

import * as dialogActions from '../../actions/dialogActions';
import * as hubsActions from '../../actions/hubsActions';
import * as schoolsActions from '../../actions/schoolsActions';
import * as metersActions from '../../actions/metersActions';
import * as providersActions from '../../actions/providersActions';
import * as energyResourcesActions from '../../actions/energyResourcesActions';

import NewEditMeterDialog from '../../components/dialogs/NewEditMeterDialog';
import EditSmartThingsEnergyMeterDialog from '../../components/dialogs/EditSmartThingsEnergyMeterDialog';
import Meter from '../../components/Meter';
import SLEAdminHeader from '../../components/SLEAdminHeader';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import NoItems from '../../components/NoItems';
import { DIALOG_ACTIONS, withNewEditDialog } from '../../components/HOCs/NewEditDialog';
import ConfirmationCheckbox from '../../components/dialogs/formControls/ConfirmationCheckbox';

import { RESOURCE_CHILD_TYPE } from '../../constants/config';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
  },
  item: {
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
    padding: '50px 0',
    [theme.breakpoints.down('xs')]: {
      paddingTop: 30,
      paddingBottom: 30,
    },
  },
  cardHeaderWrapper: {
    paddingLeft: 32,
  },
});

const METER_DIALOGS_CONFIG = Object.freeze({
  [DIALOG_ACTIONS.new]: {
    title: 'Create meter',
  },
  [DIALOG_ACTIONS.edit]: {
    title: 'Edit meter',
  },
});

class MetersPage extends React.Component {
  state = {
    confirmDeleteDialogOpened: false,
    meterToRemove: null,
    deletePermanently: false,
    smartThingsEnergyMeterEditDialogOpened: false,
    smartThingsEnergyMeterToEdit: {},
  };

  componentDidMount() {
    const { actions, user } = this.props;
    actions.getSchoolInformation(user.location_id);
    actions.getEnergyResourcesList();
    actions.getProvidersList();
    actions.getAllSchools(true);
  }

  dialogActionHandler = (data = {}) => {
    const { actions, dialog: { action }, toggleDialogHandler } = this.props;
    switch (action) {
      case DIALOG_ACTIONS.new:
        actions.createMeter(data.name, data.description, data.meterId, data.locationId, data.type, data.provider).then(() => {
          actions.getEnergyResourcesList();
          toggleDialogHandler();
        });
        break;
      case DIALOG_ACTIONS.edit:
        actions.editMeter(data.id, data.name, data.description, data.meterId, data.locationId, data.type, data.provider).then(() => {
          actions.getEnergyResourcesList();
          toggleDialogHandler({});
        });
        break;
      default:
    }
  };

  onEditClick = (meter) => {
    const { toggleDialogHandler } = this.props;
    switch (meter.child_type) {
      case RESOURCE_CHILD_TYPE.ENERGY: {
        toggleDialogHandler(DIALOG_ACTIONS.edit, meter);
        break;
      }
      case RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER: {
        this.toggleEditSmartThingsEnergyMeter(meter);
        break;
      }
      default:
        break;
    }
  }

  onMeterDelete = () => {
    const { meterToRemove, deletePermanently } = this.state;
    const { actions } = this.props;
    actions.deleteMeter(meterToRemove, deletePermanently).then(() => {
      actions.getEnergyResourcesList();
      this.toggleConfirmDeleteDialog(null);
    });
  };

  onSmartThingsEnergyMeterEditSubmit = (id, name, description, locationId, meterType) => {
    const { actions } = this.props;
    actions.editSmartThingsEnergyMeter(id, name, description, locationId, meterType)
      .then(() => {
        actions.getEnergyResourcesList();
        this.toggleEditSmartThingsEnergyMeter({});
      });
  };

  getLocationsMeters = (meters, locations, providers) => {
    const result = [];
    locations.forEach((location) => {
      const item = Object.assign({}, location);
      item.meters = meters.filter(meter => meter.sub_location === location.id || meter.sub_location_id === location.id) // TODO: temporary, need only one of: sub_location, sub_location_id
        .map((meter) => {
          const newMeter = Object.assign({}, meter);
          const meterProvider = providers.find(p => p.id === newMeter.provider_account);
          if (meterProvider) {
            newMeter.providerName = meterProvider.provider;
          }
          return newMeter;
        });
      result.push(item);
    });
    return result;
  };

  toggleConfirmDeleteDialog = (meterId) => {
    this.setState(prevState => ({ confirmDeleteDialogOpened: !prevState.confirmDeleteDialogOpened, meterToRemove: meterId }));
  };

  toggleEditSmartThingsEnergyMeter = (meter) => {
    this.setState(prevState => ({
      smartThingsEnergyMeterEditDialogOpened: !prevState.smartThingsEnergyMeterEditDialogOpened,
      smartThingsEnergyMeterToEdit: meter,
    }));
  };

  render() {
    const {
      classes, school, actions, meters, allLocations, providers, dialog, toggleDialogHandler,
    } = this.props;

    const {
      confirmDeleteDialogOpened, deletePermanently, smartThingsEnergyMeterEditDialogOpened, smartThingsEnergyMeterToEdit,
    } = this.state;

    const locationsMeters = this.getLocationsMeters(meters.data, allLocations.data, providers.data);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">
          <Grid item container xs={12} md={10} className={classes.adminHeaderWrapper}>
            {
              school.name && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  onRefreshClick={() => actions.getEnergyResourcesList()}
                  rightContent={{
                    label: 'ADD NEW METER',
                    onClick: () => toggleDialogHandler(DIALOG_ACTIONS.new),
                  }}
                />
              )
            }
          </Grid>
          <Grid xs={12} item>
            {
              locationsMeters.length > 0 ? (
                locationsMeters.map(location => (
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
                      <Grid item xs={10}>
                        <div className={classes.cardsWrapper}>
                          {
                            location.meters.map(meter => (
                              <Grid item key={meter.id} className={classes.item}>
                                <Meter
                                  name={meter.name}
                                  id={meter.id}
                                  type={meter.type}
                                  childType={meter.child_type}
                                  meterId={meter.meter_id}
                                  provider={meter.providerName}
                                  description={meter.description}
                                  smartThingsData={meter[RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR]}
                                  deleteAllowed={meter.child_type === RESOURCE_CHILD_TYPE.ENERGY}
                                  showMessageBar={actions.showMessageSnackbar}
                                  onDeleteClick={() => this.toggleConfirmDeleteDialog(meter.id)}
                                  onEditClick={() => this.onEditClick(meter)}
                                  updatedAt={meters.lastUpdated}
                                />
                              </Grid>
                            ))
                          }
                        </div>
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
        <NewEditMeterDialog
          title={dialog.title}
          isOpened={dialog.opened}
          meter={dialog.dialogData}
          onClose={toggleDialogHandler}
          onSubmit={this.dialogActionHandler}
          locations={allLocations.data}
          providers={providers.data}
        />
        <EditSmartThingsEnergyMeterDialog
          title="Edit meter"
          meter={smartThingsEnergyMeterToEdit}
          isOpened={smartThingsEnergyMeterEditDialogOpened}
          onSubmit={this.onSmartThingsEnergyMeterEditSubmit}
          locations={allLocations.data}
          onClose={() => this.toggleEditSmartThingsEnergyMeter({})}
        />
        <ConfirmDialog
          title="Delete meter?"
          isOpened={confirmDeleteDialogOpened}
          onSubmit={this.onMeterDelete}
          onClose={() => this.toggleConfirmDeleteDialog(null)}
          onExited={() => this.setState({ deletePermanently: false })}
        >
          <ConfirmationCheckbox
            checked={deletePermanently}
            onChange={e => this.setState({ deletePermanently: e.target.checked })}
            label="Delete permanently"
          />
        </ConfirmDialog>
      </div>
    );
  }
}

MetersPage.propTypes = {
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  allLocations: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  meters: PropTypes.object.isRequired,
  providers: PropTypes.object.isRequired,

  // these props come from HOC
  dialog: PropTypes.object.isRequired,
  toggleDialogHandler: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...hubsActions,
      ...schoolsActions,
      ...metersActions,
      ...providersActions,
      ...energyResourcesActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    user: state.users.currentUser,
    allLocations: state.schools.allLocations,
    meters: state.energyResources,
    providers: state.providers,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withNewEditDialog(METER_DIALOGS_CONFIG),
)(MetersPage);
