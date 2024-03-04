import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import { bindActionCreators, compose } from 'redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Delete from '@material-ui/icons/Delete';

import SLEAdminHeader from '../../components/SLEAdminHeader';
import NoItems from '../../components/NoItems';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import AlertLog from '../../components/AlertsConfiguartion/AlertLog';

import * as energyAlertActions from '../../actions/energyAlertActions';
import * as metersActions from '../../actions/metersActions';
import * as smartThingsSensorsActions from '../../actions/smartThingsSensorsActions';

import PAGINATION_UTILS from '../../utils/paginationUtils';
import { ENERGY_ALERTS_TYPE } from '../../components/AlertsConfiguartion/constants';
import { SMART_THINGS_SENSOR_CAPABILITY } from '../../constants/config';

const styles = {
  root: {
    fontFamily: 'Roboto-Medium',
    paddingBottom: 100,
  },
  cardsWrapper: {
    borderRadius: '7px',
  },
  ...PAGINATION_UTILS.styles,
};

class AlertLogs extends React.Component {
  state = {
    page: 0,
    itemsPerPage: 10,
    confirmDialogOpened: false,
  };

  componentDidMount() {
    const { actions } = this.props;
    actions.getEnergyAlertsLogs();
    actions.getMetersList(true);
    actions.getSmartThingsSensorsList({ capability: SMART_THINGS_SENSOR_CAPABILITY.temperature });
  }

  onVariableDelete = () => {
    const { actions } = this.props;
    actions.cleanAlertLogs()
      .then(() => {
        actions.getEnergyAlertsLogs();
        this.toogleConfirmDialog();
      });
  };

  getItemsToShow = (arr, page, itemsPerPage) => {
    if (arr && arr.length) {
      const start = page * itemsPerPage;
      if ((page + 1) * itemsPerPage < arr.length) {
        return arr.slice(start, start + itemsPerPage);
      }

      if (start <= arr.length) {
        return arr.slice(start, arr.length);
      }
      return arr.slice();
    }
    return [];
  };

  getAlertLogLocation = (locationId) => {
    const { allLocations } = this.props;
    return allLocations.find(location => locationId === location.id);
  };

  getAlertLogMeter = (meterId, alertType) => {
    const { meters, temperatureMeters } = this.props;
    if (alertType === ENERGY_ALERTS_TYPE.temperature_level) {
      return temperatureMeters.find(meter => meterId === meter.id);
    }
    return meters.find(meter => meterId === meter.id);
  };

  handlePageClick = (data) => {
    const selected = data.selected;
    this.setState({ page: selected });
  };

  toogleConfirmDialog = () => {
    this.setState(prevState => ({ confirmDialogOpened: !prevState.confirmDialogOpened }));
  };

  render() {
    const {
      actions, classes, school, alertLogs, allLocations,
    } = this.props;
    const { confirmDialogOpened, page, itemsPerPage } = this.state;

    const pageCount = Math.ceil(alertLogs.data.length / itemsPerPage);
    const alertLogsToShow = this.getItemsToShow(alertLogs.data, page, itemsPerPage);

    return (
      <div className={classes.root}>
        <Grid container alignItems="center" justify="center">
          <Grid item xs={12} md={10}>
            <Grid container style={{ padding: '25px 0px' }}>
              {school.name && (
                <SLEAdminHeader
                  title={school.name}
                  schoolID={school.uid}
                  onRefreshClick={actions.getEnergyAlertsLogs}
                  rightContent={{
                    icon: Delete,
                    label: 'CLEAN LOG',
                    onClick: this.toogleConfirmDialog,
                  }}
                />
              )}
            </Grid>
            <Grid xs={12} item>
              {
                (alertLogsToShow.length && allLocations.length) ? (
                  <Fragment>
                    <div className={classes.cardsWrapper}>
                      {
                        alertLogsToShow.map(alertLog => (
                          <AlertLog
                            key={alertLog.event_time}
                            alertLog={alertLog}
                            alertMeter={this.getAlertLogMeter(alertLog.trigger_data.source_resource_id, alertLog.trigger_data.type)}
                            alertLocation={this.getAlertLogLocation(alertLog.trigger_data.source_location_id)}
                          />
                        ))
                      }
                    </div>
                    {pageCount > 1 ? (
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
                    ) : null
                    }
                  </Fragment>
                ) : (
                  <NoItems />
                )
              }
            </Grid>
          </Grid>
        </Grid>
        <ConfirmDialog
          title="Clean all logs?"
          isOpened={confirmDialogOpened}
          onSubmit={this.onVariableDelete}
          onClose={this.toogleConfirmDialog}
        />
      </div>
    );
  }
}

AlertLogs.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  school: PropTypes.object.isRequired,
  alertLogs: PropTypes.object.isRequired,
  meters: PropTypes.array.isRequired,
  temperatureMeters: PropTypes.array.isRequired,
  allLocations: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...energyAlertActions,
      ...metersActions,
      ...smartThingsSensorsActions,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    school: state.schools.activeSchool,
    alertLogs: state.alerts.alertsLog,
    meters: state.meters.data,
    temperatureMeters: state.smartThingsSensors.data,
    allLocations: state.schools.allLocations.data,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(AlertLogs);
