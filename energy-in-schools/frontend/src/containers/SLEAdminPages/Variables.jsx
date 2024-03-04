import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import queryString from 'query-string';

import { createFilter } from 'react-search-input';
import ReactPaginate from 'react-paginate';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import Variable from '../../components/Variable';
import SLEAdminHeader from '../../components/SLEAdminHeader';
import NoItems from '../../components/NoItems';
import VariablesHeader from '../../components/VariablesHeader';
import NewEditVariableDialog, { VARIABLE_DIALOG_TYPES } from '../../components/dialogs/NewEditVariableDialog';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import ResourceUsageDialog from '../../components/dialogs/ResourceUsageDialog';
import EditDatasetLocationDialog from '../../components/dialogs/EditDatasetLocationDialog';
import ConfirmationCheckbox from '../../components/dialogs/formControls/ConfirmationCheckbox';

import * as dialogActions from '../../actions/dialogActions';
import * as schoolsActions from '../../actions/schoolsActions';
import * as variablesActions from '../../actions/variablesActions';
import * as historicalDataActions from '../../actions/historicalDataActions';
import * as hubsActions from '../../actions/hubsActions';
import { PUPIL_ROLE, USAGE_STATISTIC_CONFIGS, USAGE_STATISTIC_CHART_NAME } from '../../constants/config';
import VARIABLES_PAGE_QUERY_PARAMS from './constants';

import PAGINATION_UTILS from '../../utils/paginationUtils';

import variableIcon from '../../images/variable.svg';

const KEYS_TO_FILTER = ['key', 'namespace'];

export const VARIABLE_MODE = 'variables';

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
  updateButton: {
    fontWeight: 500,
  },
  ...PAGINATION_UTILS.styles,
});

class Variables extends React.Component {
  state = {
    fromMyLocation: false,
    searchTerm: '',
    page: 0,
    itemsPerPage: 10,
    createDialogOpened: false,
    confirmDialogOpened: false,
    editDatasetLocationDialogOpened: false,
    selectedVariable: {},
    variableDialogType: VARIABLE_DIALOG_TYPES.newVariable,
    resourceUsageDialogOpened: false,
    deletePermanently: false,
  };

  componentDidMount() {
    const { actions } = this.props;
    actions.getHubsList();
  }

  componentDidUpdate(prevProps) {
    const { historicalData } = this.props;

    if (prevProps.historicalData !== historicalData && this.getVariableIdQueryParam()) {
      this.handleRedirectForDetailView();
    }
  }

  onDialogSubmit = (formData) => {
    const { actions, school } = this.props;
    const { variableDialogType, selectedVariable } = this.state;
    const {
      key, value, hubUid, sharedWith, namespace, name, datasetType, unitLabel,
    } = formData;
    switch (variableDialogType) {
      case VARIABLE_DIALOG_TYPES.newVariable:
        actions.createVariable(key, value, hubUid, school.id, sharedWith).then(() => {
          actions.getVariables();
          this.toogleDialog(variableDialogType);
        });
        break;
      case VARIABLE_DIALOG_TYPES.newDatasetVariable:
        actions.createHistoricalVariable(selectedVariable.id, value).then(() => {
          actions.getHistoricalData();
          this.toogleDialog(variableDialogType);
        });
        break;
      case VARIABLE_DIALOG_TYPES.newDataset:
        actions.createHistoricalDataset(namespace, name, datasetType, unitLabel, hubUid).then(() => {
          actions.getHistoricalData();
          this.toogleDialog(variableDialogType);
        });
        break;
      case VARIABLE_DIALOG_TYPES.editVariable:
        actions.editVariable(key, value, hubUid, school.id, sharedWith).then(() => {
          actions.getVariables();
          this.toogleDialog(variableDialogType);
        });
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn('Unxexpected dialog type!');
    }
  };

  onVariableDelete = () => {
    const { selectedVariable, deletePermanently } = this.state;
    const { actions, mode } = this.props;
    if (mode === VARIABLE_MODE) {
      actions.deleteVariable(selectedVariable.key).then(() => {
        actions.getVariables();
        this.toogleVariableDialog({}, 'confirmDialogOpened');
      });
    } else {
      actions.deleteHistoricalVariable(selectedVariable.id, deletePermanently).then(() => {
        actions.getHistoricalData();
        this.toogleVariableDialog({}, 'confirmDialogOpened');
      });
    }
  };

  onDatasetLocationEditSubmit = (datasetId, locationId) => {
    const { actions } = this.props;
    actions.editHistoricalVariableLocation(datasetId, locationId).then(() => {
      actions.getHistoricalData();
      this.toogleVariableDialog({}, 'editDatasetLocationDialogOpened');
    });
  };

  handleChangeFromMyLocation = getVariables => () => {
    this.setState((prevState) => {
      getVariables(!prevState.fromMyLocation);
      return { fromMyLocation: !prevState.fromMyLocation };
    });
  };

  handleDecrease = () => {
    const { itemsPerPage } = this.state;
    if (itemsPerPage > 1) {
      this.setState(prevState => ({ itemsPerPage: prevState.itemsPerPage - 1 }));
    }
  };

  handleIncrease = () => {
    this.setState(prevState => ({ itemsPerPage: prevState.itemsPerPage + 1 }));
  };

  handlePageClick = (data) => {
    const selected = data.selected;
    this.setState({ page: selected });
  };

  getVariableIdQueryParam = () => {
    const queryParams = queryString.parse(window.location.search);

    return queryParams[VARIABLES_PAGE_QUERY_PARAMS.showHistoricalChartForDataset];
  };

  handleRedirectForDetailView = () => {
    const { variables, historicalData, mode } = this.props;

    const allVariables = mode === VARIABLE_MODE ? variables.data : historicalData.data;

    if (mode === VARIABLE_MODE) {
      return;
    }

    const variableId = this.getVariableIdQueryParam();

    const variable = allVariables.find(selectedVariable => String(selectedVariable.id) === variableId);

    this.toogleVariableDialog(variable, 'resourceUsageDialogOpened');

    window.history.replaceState(null, null, window.location.pathname); // clear path
  };

  searchUpdate = (term) => {
    this.setState({ searchTerm: term, page: 0 });
  };

  toogleDialog = (type, variable = {}) => {
    this.setState(prevState => ({
      createDialogOpened: !prevState.createDialogOpened,
      variableDialogType: type,
      selectedVariable: variable,
    }));
  };

  toogleVariableDialog = (variable, stateKey) => {
    this.setState(prevState => ({ [stateKey]: !prevState[stateKey], selectedVariable: variable }));
  };

  render() {
    const {
      classes, actions, school, mode, hubs, user, variables, historicalData, locations,
    } = this.props;
    const {
      confirmDialogOpened,
      createDialogOpened,
      variableDialogType,
      selectedVariable,
      resourceUsageDialogOpened,
      editDatasetLocationDialogOpened,
      searchTerm,
      itemsPerPage,
      page,
      fromMyLocation,
      deletePermanently,
    } = this.state;

    const allVariables = mode === VARIABLE_MODE ? variables.data : historicalData.data;

    const filteredVariables = allVariables.filter(createFilter(searchTerm, KEYS_TO_FILTER));

    const itemsCount = filteredVariables.length;

    const pageCount = Math.ceil(itemsCount / itemsPerPage);

    const variablesToShow = PAGINATION_UTILS.getItemsToShow(filteredVariables, page, itemsPerPage);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">

          <Grid item xs={12} md={11}>
            <Grid container style={{ padding: '25px 0px' }}>
              {school.name
                && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  onRefreshClick={() => {
                    if (mode === VARIABLE_MODE) {
                      actions.getVariables(fromMyLocation);
                    }
                    actions.getHistoricalData(fromMyLocation);
                  }}
                  rightContent={{
                    label: mode === VARIABLE_MODE ? 'ADD NEW VARIABLE' : 'ADD NEW DATASET',
                    onClick: () => this.toogleDialog(mode === VARIABLE_MODE ? VARIABLE_DIALOG_TYPES.newVariable : VARIABLE_DIALOG_TYPES.newDataset),
                  }}
                  classes={{
                    button: classes.updateButton,
                  }}
                />
                )
              }
            </Grid>

            { allVariables.length
              ? (
                <VariablesHeader
                  count={itemsCount}
                  description={mode === VARIABLE_MODE
                    ? 'This page stores micro:bit data that is one reading only e.g. temperature in the room at 11:59PM on 31.12.2019'
                    : 'This page stores micro:bit data for a given time period e.g. temperature in the room from \'start date and time\' to \'end date and time\''
                  }
                  itemsPerPage={itemsPerPage}
                  searchUpdate={this.searchUpdate}
                  handleIncrease={this.handleIncrease}
                  handleDecrease={this.handleDecrease}
                  fromMyLocation={fromMyLocation}
                  handleChangeFromMyLocation={this.handleChangeFromMyLocation(mode === VARIABLE_MODE ? actions.getVariables : actions.getHistoricalData)}
                />
              )
              : null
            }

            <Grid xs={12} item>
              {
                variablesToShow.length ? (
                  <Fragment>
                    <div className={classes.cardsWrapper}>
                      {
                        variablesToShow.map(variable => (
                          <div key={`${variable.id}_${variable.updated_at}`} className={classes.item}>
                            <Variable
                              variable={variable}
                              showMessageBar={actions.showMessageSnackbar}
                              mode={mode}
                              onDelete={user.role !== PUPIL_ROLE ? () => this.toogleVariableDialog(variable, 'confirmDialogOpened') : null}
                              onLocationEdit={user.role !== PUPIL_ROLE ? () => this.toogleVariableDialog(variable, 'editDatasetLocationDialogOpened') : null}
                              onEdit={user.role !== PUPIL_ROLE ? () => this.toogleDialog(VARIABLE_DIALOG_TYPES.editVariable, variable) : null}
                              onNewHistoricalVariable={() => this.toogleDialog(VARIABLE_DIALOG_TYPES.newDatasetVariable, variable)}
                              onShowUsageStatistic={() => this.toogleVariableDialog(variable, 'resourceUsageDialogOpened')}
                            />
                          </div>
                        ))
                      }
                    </div>
                    {pageCount > 1
                      ? (
                        <ReactPaginate
                          previousLabel="<"
                          nextLabel=">"
                          breakLabel={<span>...</span>}
                          breakClassName={classes.paginationBreak}
                          pageCount={pageCount}
                          marginPagesDisplayed={2}
                          pageRangeDisplayed={5}
                          onPageChange={this.handlePageClick}
                          containerClassName={classes.pagination}
                          pageClassName={classes.paginationItem}
                          previousClassName={`${classes.paginationItem} ${classes.prevNext}`}
                          nextClassName={`${classes.paginationItem} ${classes.prevNext}`}
                          activeClassName={classes.active}
                          disabledClassName={classes.disabled}
                        />
                      )
                      : null
                    }
                  </Fragment>
                ) : (
                  <NoItems />
                )
              }
            </Grid>
          </Grid>
        </Grid>

        <NewEditVariableDialog
          variable={selectedVariable}
          isOpened={createDialogOpened}
          onClose={() => this.toogleDialog(variableDialogType)}
          onSubmit={this.onDialogSubmit}
          hubs={hubs}
          type={variableDialogType}
        />
        <EditDatasetLocationDialog
          isOpened={editDatasetLocationDialogOpened}
          locations={locations}
          dataset={selectedVariable}
          onSubmit={this.onDatasetLocationEditSubmit}
          onClose={() => this.toogleVariableDialog({}, 'editDatasetLocationDialogOpened')}
        />

        <ConfirmDialog
          title={mode === VARIABLE_MODE ? 'Delete variable?' : 'Delete dataset?'}
          isOpened={confirmDialogOpened}
          onSubmit={this.onVariableDelete}
          onClose={() => this.toogleVariableDialog({}, 'confirmDialogOpened')}
          onExited={mode === VARIABLE_MODE ? () => {} : () => this.setState({ deletePermanently: false })}
        >
          {mode !== VARIABLE_MODE
            ? (
              <ConfirmationCheckbox
                checked={deletePermanently}
                onChange={e => this.setState({ deletePermanently: e.target.checked })}
                label="Delete permanently"
              />
            )
            : null
          }
        </ConfirmDialog>
        <ResourceUsageDialog
          title={selectedVariable ? selectedVariable.key || `${selectedVariable.namespace}_${selectedVariable.name}` : ''}
          isOpened={resourceUsageDialogOpened}
          onClose={() => this.toogleVariableDialog({}, 'resourceUsageDialogOpened')}
          resource={selectedVariable}
          chartConfig={USAGE_STATISTIC_CONFIGS[USAGE_STATISTIC_CHART_NAME.microbit]}
          titleIcon={variableIcon}
        />
      </div>
    );
  }
}

Variables.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  hubs: PropTypes.array.isRequired,
  locations: PropTypes.array.isRequired,
  variables: PropTypes.object.isRequired,
  historicalData: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...schoolsActions,
      ...variablesActions,
      ...historicalDataActions,
      ...hubsActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    locations: state.schools.allLocations.data,
    variables: state.variables,
    historicalData: state.historicalData,
    hubs: state.hubs.data,
    user: state.users.currentUser,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(Variables);
