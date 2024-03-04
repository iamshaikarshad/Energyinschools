import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isEmpty, isNil } from 'lodash';

import {
  IconButton,
  Grid,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import CachedIcon from '@material-ui/icons/Cached';

import TablePaginationComponent from '../../../components/TablePagination/TablePaginationComponent';

import ContentWrapperDialog from '../../../components/dialogs/ContentWrapperDialog';

import {
  METERS_CONNECTIVITY_RESOURCE_TYPE_LABEL,
  METERS_CONNECTIVITY_RESOURCE_TYPES,
  METERS_CONNECTIVITY_DETAILS,
  METERS_CONNECTIVITY_DETAIL_CONFIG,
  METERS_CONNECTIVITY_DETAIL_ACTION,
  METERS_CONNECTIVITY_DETAIL_ACTIONS,
  METERS_CONNECTIVITY_DETAIL_ACTION_CONFIG,
  STATUS_COLOR,
  NOT_AVAILABLE_LABEL,
} from './constants';

import objectHasNonEmptyValue from '../../../utils/objectHasNonEmptyValue';
import { createHildebrandMeter, editHildebrandMeter } from '../../../actions/schoolsMonitoringActions';
import { deleteMeter, refreshMeter } from '../../../actions/metersActions';
import ManageHildebrandMeterDialog from '../../../components/dialogs/ManageHildebrandMeterDialog';
import deleteMeterIcon from '../../../images/delete_floor.svg';
import editMeterIcon from '../../../images/edit_sensor.svg';
import ConfirmDialog from '../../../components/dialogs/ConfirmDialog';


const styles = theme => ({
  root: {
    width: '100%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  title: {
    width: '100%',
    padding: '8px 16px',
    fontWeight: 500,
    fontSize: 21,
    textAlign: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  contentContainer: {
    padding: '8px 16px',
  },
  tableWrapper: {
    marginBottom: 4,
  },
  tableTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: 500,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: 16,
    },
  },
  tableRoot: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    boxShadow: 'none',
    marginTop: 8,
    marginBottom: 8,
  },
  tableCellRoot: {
    borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
  },
  emptyTableRow: {
    height: 'auto',
  },
  tableEmptyRowCellRoot: {
    borderBottom: 'none',
    padding: 0,
  },
  tablePaginationToolbar: {
    minHeight: 24,
    height: 'auto',
    paddingLeft: 16,
  },
  tablePaginationSpacer: {
    [theme.breakpoints.down('sm')]: {
      flexBasis: 0,
      flexGrow: 0,
    },
  },
  detailsDialogTitle: {
    padding: '0px 24px',
    margin: '16px auto',
    fontWeight: 500,
    [theme.breakpoints.down('xs')]: {
      margin: '12px auto',
      padding: '0px 12px',
    },
  },
  actionButton: {
    fontSize: 14,
    color: 'rgb(13, 180, 225)',
    textTransform: 'none',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  button: {
    fontSize: 14,
    textTransform: 'none',
    backgroundColor: 'rgb(0, 188, 212)',
    '&:hover': {
      backgroundColor: 'rgb(0, 188, 212)',
    },
  },
  metersListHeader: {
    fontSize: 16,
    fontWeight: 500,
    padding: 16,
    [theme.breakpoints.down('xs')]: {
      padding: 8,
    },
  },
  metersListRoot: {
    listStyleType: 'decimal',
    paddingTop: 0,
    paddingLeft: 40,
    paddingRight: 8,
  },
  metersListItemTextPrimary: {
    fontSize: 14,
    padding: 8,
  },
  noData: {
    fontSize: 18,
    color: STATUS_COLOR.alert,
  },
  extraInfoItemText: {
    fontSize: 12,
    padding: '4px 8px',
  },
  editMeterContainer: {
    width: 11,
    height: 11,
    backgroundColor: '#eba117',
    margin: '0px 4px 2px 2px',
  },
  refreshMeterContainer: {
    width: 11,
    height: 11,
    color: 'white',
    backgroundColor: '#3dbdd5',
    margin: '0px 4px 2px 2px',
  },
  deleteMeterContainer: {
    width: 11,
    height: 11,
    backgroundColor: '#CD5C5C',
    margin: '0px 0px 2px 2px',
  },
  actionIcon: {
    width: 11,
    height: 11,
  },
});

class EnergyMetersConnectivity extends PureComponent {
  state = {
    detailsDialogOpened: false,
    newMeterDialogOpened: false,
    details: null,
    meterToDelete: null,
    meterToEdit: null,
  }

  onAction = (actionKey, resourceType, resourceTypeData) => {
    switch (actionKey) {
      case METERS_CONNECTIVITY_DETAIL_ACTION.showNotOnlineMetersList:
        if (isEmpty(resourceTypeData)) return;
        this.setState(
          {
            details: {
              key: actionKey,
              resourceType,
              data: resourceTypeData,
            },
          },
          () => {
            this.toggleDetailsDialog();
          },
        );
        break;
      default:
        break;
    }
  }

  getRowsDataItemActions = (resourceType, resourceTypeData) => {
    const { classes } = this.props;
    return METERS_CONNECTIVITY_DETAIL_ACTIONS.reduce((res, prop) => {
      const propConfig = METERS_CONNECTIVITY_DETAIL_ACTION_CONFIG[prop];
      if (propConfig) {
        const {
          name, label, key, getActionIsDisabled,
        } = propConfig;
        const isDisabled = getActionIsDisabled(resourceType, resourceTypeData);
        res[name] = (
          <Button
            disabled={isDisabled}
            className={classes.actionButton}
            onClick={() => { this.onAction(key, resourceType, resourceTypeData); }}
          >
            {!isDisabled ? label : NOT_AVAILABLE_LABEL.nullable}
          </Button>
        );
      }
      return res;
    }, {});
  }

  getTableRowsData = (data) => {
    const rowsData = METERS_CONNECTIVITY_RESOURCE_TYPES.map((resourceType) => {
      const resourceTypeData = data[resourceType];
      const rowsDataItem = METERS_CONNECTIVITY_DETAILS.reduce((res, prop) => {
        const propConfig = METERS_CONNECTIVITY_DETAIL_CONFIG[prop];
        if (propConfig) {
          const { name, getValue } = propConfig;
          res[name] = getValue(resourceType, resourceTypeData);
        }
        return res;
      }, {});
      const rowsDataItemActions = this.getRowsDataItemActions(resourceType, resourceTypeData);
      return { ...rowsDataItem, ...rowsDataItemActions };
    });
    return rowsData;
  }

  getHildebrandTableRowsData = data => data.filter(({ hh_values_meter: hhMeter }) => !hhMeter).map((meter) => {
    const { classes, actions, refreshSchoolInfo } = this.props;
    const {
      name, is_half_hour_meter: isHalfHourMeter, minutes_delay: minutesDelay, resource_ptr: id,
      meter_id: meterId, live_values_meter__pk: liveMeterPk, live_values_meter__meter_id: liveMeterId,
    } = meter;

    const liveMeterDelay = liveMeterPk ? data.find(m => m.resource_ptr === liveMeterPk).minutes_delay : minutesDelay;

    let lastData = '--';
    switch (liveMeterDelay) {
      case null:
      case undefined:
        lastData = 'yesterday';
        break;
      case 0:
        break;
      default:
        lastData = `${liveMeterDelay} minutes ago`;
        break;
    }

    // TODO: remove 'Half hour meter' column and use live meter as base meter to see valid last data
    return {
      Id: liveMeterPk ? `${id} (${liveMeterPk})` : id,
      Name: name,
      'Last data': lastData,
      Actions: (
        <Grid container alignItems="center">
          <IconButton
            className={classes.editMeterContainer}
            onClick={() => this.setState({
              meterToEdit: {
                id, meterId, name, isHalfHourMeter, minutesDelay, liveMeterId,
              },
            })}
          >
            <img src={editMeterIcon} alt="edit current sensor" className={classes.actionIcon} />
          </IconButton>
          <IconButton
            className={classes.refreshMeterContainer}
            onClick={() => actions.refreshMeter(id).then(() => setTimeout(refreshSchoolInfo, 0))}
          >
            <CachedIcon style={{ height: 20, width: 20 }} />
          </IconButton>
          <IconButton
            className={classes.deleteMeterContainer}
            onClick={() => this.setState({ meterToDelete: { id, name, liveMeterPk } })}
          >
            <img src={deleteMeterIcon} alt="delete current sensor" className={classes.actionIcon} />
          </IconButton>
        </Grid>
      ),
    };
  });

  toggleDetailsDialog = () => {
    this.setState(prevState => ({ detailsDialogOpened: !prevState.detailsDialogOpened }));
  }

  renderDetailsData = () => {
    const { classes } = this.props;
    const { details } = this.state;
    if (isEmpty(details)) return null;
    const { key, data, resourceType } = details;
    switch (key) {
      case METERS_CONNECTIVITY_DETAIL_ACTION.showNotOnlineMetersList: {
        if (isNil(data)) return null;
        const listData = data.not_online || [];
        return (
          <div>
            <Grid container justify="center">
              <Typography align="center" className={classes.metersListHeader}>
                {METERS_CONNECTIVITY_RESOURCE_TYPE_LABEL[resourceType]} disconnected meters list
              </Typography>
            </Grid>
            <Grid container>
              <List component="ol" classes={{ root: classes.metersListRoot }}>
                {listData.map(item => (
                  <ListItem key={item} style={{ display: 'list-item' }} disableGutters>
                    <ListItemText classes={{ primary: classes.metersListItemTextPrimary }}>
                      {item}
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </div>
        );
      }
      default:
        return null;
    }
  }

  render() {
    const {
      actions, classes, data, schoolId, refreshSchoolInfo,
    } = this.props;
    const {
      detailsDialogOpened, newMeterDialogOpened, meterToDelete, meterToEdit,
    } = this.state;
    if (!data) return null;
    const { meters: hildebrandMeters, provider_exists: providerExists } = data.hildebrand;
    return (
      <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
        <Grid item xs={12} container justify="center">
          <Typography className={classes.title}>
            Energy Meters
          </Typography>
        </Grid>
        <Grid item xs={12} container className={classes.contentContainer}>
          {objectHasNonEmptyValue(data) ? (
            <Fragment>
              <Grid item xs={12} container className={classes.tableWrapper}>
                <TablePaginationComponent
                  classes={{
                    root: classes.tableRoot,
                    tableCellRoot: classes.tableCellRoot,
                    emptyTableRow: classes.emptyTableRow,
                    emptyRowCellRoot: classes.tableEmptyRowCellRoot,
                    paginationToolbar: classes.tablePaginationToolbar,
                    paginationSpacer: classes.tablePaginationSpacer,
                  }}
                  rows={this.getTableRowsData(data)}
                  showTableHead
                  paginationColSpan={METERS_CONNECTIVITY_DETAILS.length}
                />
              </Grid>
              <Grid container item xs={12} className={classes.extraInfoContainer}>
                <Typography className={classes.extraInfoItemText}>
                  *includes meters with offline and unknown statuses for SmartThings energy meters
                </Typography>
              </Grid>
              <Grid container item xs={12} justify="center" className={classes.extraInfoContainer}>
                <h3>Hildebrand meters</h3>
              </Grid>
              {hildebrandMeters && hildebrandMeters.length ? (
                <Grid item xs={12} container className={classes.tableWrapper}>
                  <TablePaginationComponent
                    classes={{
                      root: classes.tableRoot,
                      tableCellRoot: classes.tableCellRoot,
                      emptyTableRow: classes.emptyTableRow,
                      emptyRowCellRoot: classes.tableEmptyRowCellRoot,
                      paginationToolbar: classes.tablePaginationToolbar,
                      paginationSpacer: classes.tablePaginationSpacer,
                    }}
                    rows={this.getHildebrandTableRowsData(hildebrandMeters)}
                    showTableHead
                    paginationColSpan={METERS_CONNECTIVITY_DETAILS.length}
                  />
                </Grid>
              ) : (
                <Grid container justify="center">
                  <Typography className={classes.noData}>
                    No hildebrand meter!
                  </Typography>
                </Grid>
              )}
              <Grid container item xs={12} justify="flex-end" className={classes.extraInfoContainer}>
                <Button
                  color="primary"
                  className={classes.button}
                  variant="contained"
                  onClick={() => { this.setState({ newMeterDialogOpened: true }); }}
                >
                  Create Hildebrand meter
                </Button>
              </Grid>
              <ContentWrapperDialog
                title="Details"
                isOpened={detailsDialogOpened}
                breakpointDownUseFullScreen="sm"
                classes={{
                  dialogTitle: classes.detailsDialogTitle,
                }}
                onClose={this.toggleDetailsDialog}
              >
                {this.renderDetailsData()}
              </ContentWrapperDialog>
            </Fragment>
          ) : (
            <Grid item container xs={12} justify="center" alignItems="center">
              <Typography className={classes.noData}>
                No energy meter!
              </Typography>
              <Grid container item xs={12} justify="flex-end" alignItems="center" className={classes.extraInfoContainer}>
                <Button
                  color="primary"
                  className={classes.button}
                  variant="contained"
                  onClick={() => { this.setState({ newMeterDialogOpened: true }); }}
                >
                  Create Hildebrand meter
                </Button>
              </Grid>
            </Grid>
          )}
          {newMeterDialogOpened && (
            <ManageHildebrandMeterDialog
              title="Create New Hildebrand meter"
              submitLabel="Create"
              providerExists={providerExists}
              isOpened={newMeterDialogOpened}
              onClose={() => { this.setState({ newMeterDialogOpened: false }); }}
              onSubmit={(formData) => {
                actions
                  .createHildebrandMeter({ ...formData, schoolId })
                  .then((created) => {
                    if (created) {
                      this.setState({ newMeterDialogOpened: false });
                      setTimeout(refreshSchoolInfo, 0);
                    }
                  });
              }}
            />
          )}
          {meterToEdit && (
            <ManageHildebrandMeterDialog
              title="Edit Hildebrand meter"
              submitLabel="Submit"
              meter={meterToEdit}
              providerExists={providerExists}
              isOpened={!!meterToEdit}
              onClose={() => { this.setState({ meterToEdit: null }); }}
              onSubmit={(formData) => {
                actions
                  .editHildebrandMeter({ ...formData, schoolId }, meterToEdit.id)
                  .then((edited) => {
                    if (edited) {
                      this.setState({ meterToEdit: null });
                      setTimeout(refreshSchoolInfo, 0);
                    }
                  });
              }}
            />
          )}
          {meterToDelete && (
            <ConfirmDialog
              title={`Would you like delete '${meterToDelete.name}' ?`}
              isOpened={!!meterToDelete}
              onSubmit={() => {
                actions
                  .deleteMeter(meterToDelete.id, true)
                  .then(() => meterToDelete.liveMeterPk && actions.deleteMeter(meterToDelete.liveMeterPk, true))
                  .then(() => {
                    this.setState({ meterToDelete: null });
                    setTimeout(refreshSchoolInfo, 0);
                  });
              }}
              onClose={() => { this.setState({ meterToDelete: null }); }}
            />
          )}
        </Grid>
      </Grid>
    );
  }
}

EnergyMetersConnectivity.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  schoolId: PropTypes.number.isRequired,
  refreshSchoolInfo: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      createHildebrandMeter,
      editHildebrandMeter,
      refreshMeter,
      deleteMeter,
    }, dispatch),
  };
}

export default compose(
  withStyles(styles),
  connect(null, mapDispatchToProps),
)(EnergyMetersConnectivity);
