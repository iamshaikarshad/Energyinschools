import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import Hub from '../../components/Hub';
import SLEAdminHeader from '../../components/SLEAdminHeader';
import NewEditHubDialog from '../../components/dialogs/NewEditHubDialog';
import NoItems from '../../components/NoItems';

import * as hubsActions from '../../actions/hubsActions';
import * as dialogActions from '../../actions/dialogActions';
import * as schoolsActions from '../../actions/schoolsActions';
import { DIALOG_ACTIONS, withNewEditDialog } from '../../components/HOCs/NewEditDialog';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import ConfirmationCheckbox from '../../components/dialogs/formControls/ConfirmationCheckbox';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
    paddingTop: 40,
    paddingBottom: 100,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 30,
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
    maxWidth: 2000,
    'flex-wrap': 'wrap',
    'justify-content': 'center',
  },
});

const HUB_DIALOGS_CONFIG = Object.freeze({
  [DIALOG_ACTIONS.new]: {
    title: 'Create hub',
  },
  [DIALOG_ACTIONS.edit]: {
    title: 'Edit hub',
  },
});

class Hubs extends React.Component {
  state = {
    hubToRemove: null,
    deletePermanently: false,
    confirmDialogOpened: false,
  }

  componentWillMount() {
    const { actions } = this.props;
    actions.getAllSchools(true);
  }

  dialogActionHandler = (data = {}) => {
    const { actions, dialog: { action }, toggleDialogHandler } = this.props;
    switch (action) {
      case DIALOG_ACTIONS.new:
        actions.createHub(data.name, data.description, data.uid, data.locationId, data.type).then(() => {
          actions.getHubsList();
          toggleDialogHandler();
        });
        break;
      case DIALOG_ACTIONS.edit:
        actions.editHub(data.id, data.name, data.description, data.uid, data.locationId, data.type).then(() => {
          actions.getHubsList();
          toggleDialogHandler({});
        });
        break;
      default:
    }
  };

  onHubDelete = () => {
    const { hubToRemove, deletePermanently } = this.state;
    const { actions } = this.props;
    actions.deleteHub(hubToRemove, deletePermanently).then(() => {
      this.toogleConfirmDialog(null);
    });
  };

  toogleConfirmDialog = (hubId) => {
    this.setState(prevState => ({ confirmDialogOpened: !prevState.confirmDialogOpened, hubToRemove: hubId }));
  };

  render() {
    const {
      classes, school, hubs, actions, allLocations, dialog, toggleDialogHandler,
    } = this.props;

    const {
      deletePermanently, confirmDialogOpened,
    } = this.state;

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">
          <Grid item xs={12} md={10}>
            <Grid container>
              {school.name && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  onRefreshClick={actions.getHubsList}
                  rightContent={{
                    label: 'ADD NEW HUB',
                    onClick: () => toggleDialogHandler(DIALOG_ACTIONS.new),
                  }}
                />
              )}
            </Grid>

            <Grid xs={12} item>
              {
                hubs.data.length > 0 ? (
                  <div className={classes.cardsWrapper}>
                    {
                        hubs.data.map(hub => (
                          <div key={hub.id} className={classes.item}>
                            <Hub
                              name={hub.name}
                              id={hub.id}
                              uid={hub.uid}
                              description={hub.description}
                              type={hub.type}
                              createdAt={hub.created_at}
                              onEditClick={() => toggleDialogHandler(DIALOG_ACTIONS.edit, hub)}
                              onDeleteClick={() => this.toogleConfirmDialog(hub.id)}
                              showMessageBar={actions.showMessageSnackbar}
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
        <NewEditHubDialog
          title={dialog.title}
          isOpened={dialog.opened}
          hub={dialog.dialogData}
          onClose={toggleDialogHandler}
          onSubmit={this.dialogActionHandler}
          locations={allLocations}
        />
        <ConfirmDialog
          title="Delete hub?"
          isOpened={confirmDialogOpened}
          onSubmit={this.onHubDelete}
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

Hubs.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  allLocations: PropTypes.array.isRequired,
  school: PropTypes.object.isRequired,
  hubs: PropTypes.object.isRequired,

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
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    allLocations: state.schools.allLocations.data,
    hubs: state.hubs,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withNewEditDialog(HUB_DIALOGS_CONFIG),
)(Hubs);
