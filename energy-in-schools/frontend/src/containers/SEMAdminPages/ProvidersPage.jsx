import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import * as dialogActions from '../../actions/dialogActions';
import * as hubsActions from '../../actions/hubsActions';
import * as schoolsActions from '../../actions/schoolsActions';
import * as metersActions from '../../actions/metersActions';
import * as providersActions from '../../actions/providersActions';

import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import NewMeterDialog from '../../components/dialogs/NewMeterDialog';
import NewEditProviderDialog from '../../components/dialogs/NewEditProviderDialog';
import Provider from '../../components/Provider';
import SLEAdminHeader from '../../components/SLEAdminHeader';
import NoItems from '../../components/NoItems';
import { ELECTRICITY, GAS, SOLAR } from '../../constants/config';
import { DIALOG_ACTIONS, withNewEditDialog } from '../../components/HOCs/NewEditDialog';
import ConfirmationCheckbox from '../../components/dialogs/formControls/ConfirmationCheckbox';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
  },
  rootContentWrapper: {
    padding: '50px 0',
    [theme.breakpoints.down('xs')]: {
      paddingTop: 30,
      paddingBottom: 30,
    },
  },
  item: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cardsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flexStart',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  title: {
    color: '#555555',
    fontSize: '18px',
  },
  subheader: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: '#00bcd4',
    lineHeight: '16px',
  },
  headerRoot: {
    marginBottom: 40,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 0,
    },
  },
  headerLine: {
    height: 135,
    backgroundColor: 'rgba(181, 181, 181, 0.25)',
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'rgba(181, 181, 181, 0.15)',
    },
    [theme.breakpoints.down('xs')]: {
      height: 100,
    },
    overflow: 'visible',
  },
});

const disableProviderSelect = true;

const PROVIDER_DIALOGS_CONFIG = Object.freeze({
  [DIALOG_ACTIONS.new]: {
    title: 'Create provider',
  },
  [DIALOG_ACTIONS.edit]: {
    title: 'Edit provider',
  },
});

class ProvidersPage extends React.Component {
  state = {
    createMeterDialogOpened: false,
    confirmDialogOpened: false,
    providerToRemove: null,
    deletePermanently: false,
    meterProviderToCreate: {},
  };

  componentDidMount() {
    const { actions, user } = this.props;
    actions.getSchoolInformation(user.location_id);
    actions.getMetersList(true);
    actions.getProvidersList();
    actions.getAllSchools(true);
  }

  dialogActionHandler = (data = {}) => {
    const { actions, dialog: { action }, toggleDialogHandler } = this.props;
    switch (action) {
      case DIALOG_ACTIONS.new:
        actions.createProvider(data.name, data.description, data.credentials, data.providerType).then(() => {
          actions.getProvidersList();
          toggleDialogHandler();
        });
        break;
      case DIALOG_ACTIONS.edit:
        actions.editProvider(data.id, data.name, data.description, data.credentials, data.providerType).then(() => {
          actions.getProvidersList();
          toggleDialogHandler({});
        });
        break;
      default:
    }
  };

  onMeterCreateSubmit = (name, description, meterId, locationId, type, provider) => {
    const { actions } = this.props;
    actions.createMeter(name, description, meterId, locationId, type, provider).then(() => {
      actions.getMetersList(true);
      this.toogleCreateMeterDialog({});
    });
  };

  onProviderDelete = () => {
    const { providerToRemove, deletePermanently } = this.state;
    const { actions } = this.props;
    actions.deleteProvider(providerToRemove, deletePermanently).then(() => {
      actions.getProvidersList();
      this.toogleConfirmDialog(null);
    });
  };

  getProviderData = (meters, locations, providers) => providers.map((provider) => {
    const providerData = meters.reduce((res, meter) => {
      if (meter.provider_account === provider.id) {
        const meterLocation = locations.find(location => location.id === meter.sub_location);
        switch (meter.type) {
          case GAS:
            res.meters[GAS].push(meter);
            res.locations[GAS].add(meterLocation);
            break;
          case ELECTRICITY:
            res.meters[ELECTRICITY].push(meter);
            res.locations[ELECTRICITY].add(meterLocation);
            break;
          case SOLAR:
            res.meters[SOLAR].push(meter);
            res.locations[SOLAR].add(meterLocation);
            break;
          default:
            // eslint-disable-next-line no-console
            console.warn('Unexpected resource child type');
        }
      }
      return res;
    }, { meters: { GAS: [], ELECTRICITY: [], SOLAR: [] }, locations: { GAS: new Set(), ELECTRICITY: new Set(), SOLAR: new Set() } });
    return Object.assign({}, provider, providerData);
  });

  toogleCreateMeterDialog = (provider) => {
    this.setState(prevState => ({ createMeterDialogOpened: !prevState.createMeterDialogOpened, meterProviderToCreate: provider }));
  };

  toogleConfirmDialog = (providerId) => {
    this.setState(prevState => ({ confirmDialogOpened: !prevState.confirmDialogOpened, providerToRemove: providerId }));
  };

  render() {
    const {
      classes, school, actions, meters, allLocations, providers, dialog, toggleDialogHandler,
    } = this.props;

    const {
      createMeterDialogOpened, confirmDialogOpened, meterProviderToCreate, deletePermanently,
    } = this.state;

    const providerData = this.getProviderData(meters.data, allLocations.data, providers.data);

    return (
      <div className={classes.root}>
        <Grid container className={classes.rootContentWrapper} alignItems="center" justify="center">
          <Grid item xs={12} md={10} className={classes.headerRoot}>
            <Grid container>
              {school.name && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  onRefreshClick={actions.getProvidersList}
                  rightContent={{
                    label: 'Add energy provider',
                    onClick: () => toggleDialogHandler(DIALOG_ACTIONS.new),
                  }}
                />
              )}
            </Grid>
          </Grid>
          <Grid xs={12} md={10} item>
            <div className={classes.headerLine} />
            <Grid container alignItems="center" justify="center" style={{ marginTop: '-80px', height: '100%' }}>
              <Grid item xs={12}>
                {
                  providerData.length > 0 ? (
                    <div className={classes.cardsWrapper}>
                      {
                        providerData.map(provider => (
                          <div key={provider.id} className={classes.item}>
                            <Provider
                              createdAt={new Date()}
                              name={provider.name}
                              type={provider.provider}
                              id={provider.id}
                              meters={provider.meters}
                              locations={provider.locations}
                              onEditClick={() => toggleDialogHandler(DIALOG_ACTIONS.edit, provider)}
                              onNewMeterClick={() => this.toogleCreateMeterDialog(provider)}
                              onDeleteClick={() => this.toogleConfirmDialog(provider.id)}
                            />
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <NoItems />
                  )
                }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <NewMeterDialog
          isOpened={createMeterDialogOpened}
          onClose={() => this.toogleCreateMeterDialog({})}
          onSubmit={this.onMeterCreateSubmit}
          locations={allLocations.data}
          providers={providers.data}
          selectedProvider={meterProviderToCreate}
          disableProviderSelect={disableProviderSelect}
        />
        <NewEditProviderDialog
          title={dialog.title}
          provider={dialog.dialogData}
          isOpened={dialog.opened}
          onSubmit={this.dialogActionHandler}
          onClose={toggleDialogHandler}
        />
        <ConfirmDialog
          title="Delete provider?"
          isOpened={confirmDialogOpened}
          onSubmit={this.onProviderDelete}
          onClose={() => this.toogleConfirmDialog(null)}
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

ProvidersPage.propTypes = {
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
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    user: state.users.currentUser,
    allLocations: state.schools.allLocations,
    meters: state.meters,
    providers: state.providers,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withNewEditDialog(PROVIDER_DIALOGS_CONFIG),
)(ProvidersPage);
