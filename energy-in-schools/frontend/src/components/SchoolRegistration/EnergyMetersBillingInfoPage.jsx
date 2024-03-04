import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { isNil, isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Grid } from '@material-ui/core';

import EnergyMetersBillingInfoForm from './EnergyMetersBillingInfoForm';
import NoItems from '../NoItems';

import ConfirmDialog from '../dialogs/ConfirmDialog';

import * as schoolsActions from '../../actions/schoolsActions';

import {
  ENERGY_METER_INFO_KEY,
  NOT_AVAILABLE_LABEL,
} from './constants';
import { getEnergyResourcesList } from '../../actions/energyResourcesActions';
import { getSuppliers } from '../../actions/MUGActions';
import CreateEnergyMeterBillingInfoDialog from '../dialogs/CreateEnergyMeterBillingInfoDialog';
import { BASE_URL } from '../../constants/config';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  addNewMeterBtnContainer: {
    padding: '15px 0px',
  },
  addNewMeterBtn: {
    fontStyle: 'italic',
  },
  chartButtom: {
    marginTop: 500,
    paddingLeft: -10,
  },
  helperText: {
    padding: '15px 8px',
  },
  helperContainer: {
    width: '100%',
  },
  submitBtnContainer: {
    textAlign: 'right',
    padding: '15px 0px',
  },
  noDataBlock: {
    padding: 25,
  },
});

class EnergyMetersBillingInfoPage extends React.Component {
  state = {
    prevFilledMeters: [],
    showPrevFilledInfo: false,
    meterToDelete: null,
    confirmDeleteDialogOpened: false,
    createEnergyMeterBillingInfoOpened: false,
  };

  componentDidMount() {
    const { actions, suppliers } = this.props;

    actions.getEnergyResourcesList();
    if (isEmpty(suppliers.data)) {
      actions.getSuppliers();
    }
    this.togglePrevFilledMetersBlock();
  }

  addNewMeter = () => {
    this.setState({
      createEnergyMeterBillingInfoOpened: true,
    });
  };

  onSubmit = (data) => {
    const { actions } = this.props;
    const { showPrevFilledInfo } = this.state;

    actions.createEnergyMetersBillingInfo(data).then(() => {
      if (showPrevFilledInfo) {
        this.getPrevFilledMetersInfo();
      }
      this.setState({
        createEnergyMeterBillingInfoOpened: false,
      });
    });
  };

  onPrevFilledMeterDelete = () => {
    const { actions } = this.props;
    const { meterToDelete } = this.state;
    actions.deleteEnergyMetersBillingInfoItem(meterToDelete.id)
      .then(() => {
        this.getPrevFilledMetersInfo();
        this.setState(prevState => ({
          confirmDeleteDialogOpened: !prevState.confirmDeleteDialogOpened,
          meterToDelete: null,
        }));
      });
  };

  removePrevFilledMeter = index => () => {
    const { prevFilledMeters } = this.state;
    const meterToDelete = prevFilledMeters[index];
    if (meterToDelete) {
      this.toggleConfirmDeleteDialog(meterToDelete);
    }
  };

  getPrevFilledMetersInfo = () => {
    const { actions } = this.props;
    actions.getEnergyMetersBillingInfoList()
      .then((response) => {
        this.setState({
          prevFilledMeters: this.transformToFormView(response.data),
        });
      });
  };

  exportMetersInfo = (meterId = null) => {
    const pathParams = typeof meterId !== 'object' ? `${meterId}/` : '';
    axios.get(`${BASE_URL}/energy-meters-billing-info/${pathParams}?download=true`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        const fileName = response.headers['content-disposition'].split('filename=')[1];
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
      });
  };

  transformToFormView = (meters) => {
    const keysToParse = Object.values(ENERGY_METER_INFO_KEY);
    const data = meters.map((meter) => {
      const dataItem = Object.keys(meter).reduce((res, key) => {
        if (keysToParse.includes(key)) {
          res[key] = this.getEnergyMeterInfoValue(meter, key);
        } else {
          res[key] = meter[key];
        }
        return res;
      }, {});
      return dataItem;
    });
    return data;
  };

  getEnergyMeterInfoValue = (meter, key) => {
    if (isNil(meter[key])) return NOT_AVAILABLE_LABEL;
    switch (key) {
      case ENERGY_METER_INFO_KEY.resource_id:
      case ENERGY_METER_INFO_KEY.supplier_id:
      case ENERGY_METER_INFO_KEY.contract_ends_on:
      case ENERGY_METER_INFO_KEY.contract_starts_on:
      case ENERGY_METER_INFO_KEY.meter_id:
      case ENERGY_METER_INFO_KEY.unit_rate_type:
      case ENERGY_METER_INFO_KEY.standing_charge:
      case ENERGY_METER_INFO_KEY.fuel_type:
      case ENERGY_METER_INFO_KEY.meter_type:
      case ENERGY_METER_INFO_KEY.school_address:
      case ENERGY_METER_INFO_KEY.site_capacity:
      case ENERGY_METER_INFO_KEY.battery_capacity:
      case ENERGY_METER_INFO_KEY.capacity_charge:
      case ENERGY_METER_INFO_KEY.solar_capacity:
      case ENERGY_METER_INFO_KEY.tpi_name:
        return String(meter[key]);
      case ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly:
      case ENERGY_METER_INFO_KEY.is_battery_physical:
      case ENERGY_METER_INFO_KEY.has_solar:
        return Boolean(meter[key]);
      case ENERGY_METER_INFO_KEY.annual_consumption: {
        return String(meter[key] / 1000); // Wh to kWh
      }
      case ENERGY_METER_INFO_KEY.consumption_by_rates:
        return meter[ENERGY_METER_INFO_KEY.consumption_by_rates];
      default:
        return NOT_AVAILABLE_LABEL;
    }
  };

  togglePrevFilledMetersBlock = () => {
    const { showPrevFilledInfo } = this.state;
    this.setState({ showPrevFilledInfo: !showPrevFilledInfo }, () => {
      if (!showPrevFilledInfo) {
        this.getPrevFilledMetersInfo();
      }
    });
  };

  toggleConfirmDeleteDialog = (meterToDelete) => {
    const { confirmDeleteDialogOpened } = this.state;
    this.setState({
      meterToDelete,
      confirmDeleteDialogOpened: !confirmDeleteDialogOpened,
    });
  };

  toggleCreateEnergyMeterBillingInfoDialog = () => {
    const { createEnergyMeterBillingInfoOpened } = this.state;
    this.setState({
      createEnergyMeterBillingInfoOpened: !createEnergyMeterBillingInfoOpened,
    });
  };

  render() {
    const {
      classes, energyResources, suppliers, actions,
    } = this.props;
    const {
      showPrevFilledInfo,
      isMeterChartOpen,
      prevFilledMeters,
      confirmDeleteDialogOpened,
      meterToDelete,
      createEnergyMeterBillingInfoOpened,
    } = this.state;
    return (
      <Grid container justify="center" className={classes.root}>
        <Grid item md={10} className={classes.addNewMeterBtnContainer}>
          <Button color="primary" className={classes.addNewMeterBtn} onClick={this.addNewMeter}>
            + Add new meter
          </Button>
          <Button color="primary" className={classes.addNewMeterBtn} onClick={this.togglePrevFilledMetersBlock}>
            {showPrevFilledInfo ? 'Hide prev saved info' : 'Show prev saved info'}
          </Button>
          {prevFilledMeters.length > 1 && (
            <Button color="primary" className={classes.addNewMeterBtn} onClick={() => this.exportMetersInfo()}>
              EXPORT ALL METERS
            </Button>
          )}
          <div className={classes.helperContainer}>
            <Typography className={classes.helperText}>
              *Please use your energy bills to add the meter information for all meters that are associated with your school
            </Typography>
          </div>
        </Grid>
        <Grid item md={10}>
          {showPrevFilledInfo && (
            <React.Fragment>
              {prevFilledMeters.length > 0 && !isMeterChartOpen ? (
                <EnergyMetersBillingInfoForm
                  showActionsButtons
                  refFunc={(el) => { this.prevEnergyMetersInfoForm = el; }}
                  meters={prevFilledMeters}
                  exportMeter={this.exportMetersInfo}
                  openChart={this.openChart}
                  onUpdate={actions.updateEnergyMetersBillingInfo}
                  removeMeter={this.removePrevFilledMeter}
                  energyResources={energyResources.data}
                  suppliers={suppliers.data}
                />
              ) : (
                <div className={classes.noDataBlock}>
                  <NoItems paddingTop={0} imageWidth={150} />
                </div>
              )}
            </React.Fragment>
          )}
        </Grid>
        <ConfirmDialog
          title="Delete current meter info?"
          isOpened={confirmDeleteDialogOpened}
          onSubmit={this.onPrevFilledMeterDelete}
          onClose={() => { this.toggleConfirmDeleteDialog(null); }}
        >
          <EnergyMetersBillingInfoForm
            onUpdate={actions.updateEnergyMetersBillingInfo}
            refFunc={(el) => { this.prevEnergyMetersInfoDeleteForm = el; }}
            meters={meterToDelete ? [meterToDelete] : []}
            energyResources={energyResources.data}
            suppliers={suppliers.data}
          />
        </ConfirmDialog>
        <CreateEnergyMeterBillingInfoDialog
          title="Add new meter"
          isOpened={createEnergyMeterBillingInfoOpened}
          onSubmit={this.onSubmit}
          onClose={() => { this.toggleCreateEnergyMeterBillingInfoDialog(); }}
          suppliers={suppliers.data}
        />
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    energyResources: state.energyResources,
    suppliers: state.suppliers,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...schoolsActions,
      getEnergyResourcesList,
      getSuppliers,
    }, dispatch),
  };
}

EnergyMetersBillingInfoPage.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  energyResources: PropTypes.object.isRequired,
  suppliers: PropTypes.object.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(EnergyMetersBillingInfoPage);
