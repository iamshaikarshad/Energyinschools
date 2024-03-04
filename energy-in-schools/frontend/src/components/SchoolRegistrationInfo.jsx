import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { isNil, isPlainObject } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import TablePaginationComponent from './TablePagination/TablePaginationComponent';

import NoItems from './NoItems';

import * as schoolsActions from '../actions/schoolsActions';
import { getSuppliers } from '../actions/MUGActions';
import { getEnergyResourcesList } from '../actions/energyResourcesActions';

import {
  NULLABLE_VALUE_DISPLAY_VALUE,
  QUESTIONNAIRE,
  QUESTIONNAIRE_INTEREST_LABEL,
  SCHOOL_REGISTRATION_INFO_FIELD_DISPLAYING_OPTIONS,
  ENERGY_METER_INFO_KEY,
  NOT_AVAILABLE_LABEL,
  FUEL_TYPE_LABEL,
  METER_TYPE_LABEL,
  MUG_METER_RATE_TYPE,
  REGISTRATION_REQUEST_STATUS,
  ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION,
  ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL_KEYS,
  ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION_KEYS,
  EXCLUDED_ENERGY_METER_INFO_KEY_REPRESENTATION_KEYS,
} from './SchoolRegistration/constants';

const TRUE_FALSE_LABEL = Object.freeze({
  true: 'Yes',
  false: 'No',
});

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
  },
  interestsTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginTop: 40,
  },
  buttonContainer: {
    margin: '15px 0px',
    textAlign: 'center',
  },
  button: {
    margin: theme.spacing(1),
  },
  showMeterBillInfoBtnContainer: {
    margin: '15px 0px',
  },
  noDataBlock: {
    padding: 25,
  },
});

const ENERGY_METER_INFO_ITEMS_LENGTH = Object.keys(ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION).length;

class SchoolRegistrationInfo extends React.Component {
  state = {
    meters: [],
    showMetersBillingInfoBlock: false,
  };

  componentDidMount() {
    const { actions } = this.props;
    actions.getSuppliers();
    actions.getEnergyResourcesList();
  }

  getTrialRegRowsData = (registrationRequest) => {
    const data = Object.keys(SCHOOL_REGISTRATION_INFO_FIELD_DISPLAYING_OPTIONS).map((key) => {
      const infoDetail = SCHOOL_REGISTRATION_INFO_FIELD_DISPLAYING_OPTIONS[key];
      const dataItem = {
        name: infoDetail.label,
        value: infoDetail.getDisplayValue(registrationRequest[key]),
      };
      return dataItem;
    });
    return data;
  };

  getQuestionnaireValueLabel = (value) => {
    if (isNil(value)) return NULLABLE_VALUE_DISPLAY_VALUE;
    const valueToString = String(value);
    const label = TRUE_FALSE_LABEL[valueToString];
    return !isNil(label) ? label : valueToString;
  };

  getQuestionnaireInterestsRegRowsData = (registrationRequest) => {
    const questionnaireData = registrationRequest[QUESTIONNAIRE];
    if (!isPlainObject(questionnaireData)) return [];

    const data = Object.keys(QUESTIONNAIRE_INTEREST_LABEL).map((key) => {
      const valueLabel = this.getQuestionnaireValueLabel(questionnaireData[key]);
      return {
        name: QUESTIONNAIRE_INTEREST_LABEL[key],
        value: valueLabel,
      };
    });
    return data;
  };

  getEnergyMetersBillingInfo = () => {
    const { actions, registrationRequest } = this.props;
    actions.getEnergyMetersBillingInfoList(registrationRequest.registered_school_id)
      .then((response) => {
        this.setState({
          meters: response.data,
        });
      });
  }

  getEnergyMetersInfoRowsData = (meters) => {
    const data = meters.map((meter) => {
      const dataItem = ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION_KEYS.reduce((res, key) => {
        if (EXCLUDED_ENERGY_METER_INFO_KEY_REPRESENTATION_KEYS.indexOf(key) === -1) {
          res[ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION[key]] = this.getEnergyMeterInfoValueLabel(meter, key);
        }
        return res;
      }, {});
      return dataItem;
    });
    return data;
  }

  getEnergyMeterInfoValueLabel = (meter, key) => {
    const { suppliers, energyResources } = this.props;
    if (isNil(meter[key]) && ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL_KEYS.indexOf(key) === -1) return NOT_AVAILABLE_LABEL;
    switch (key) {
      case ENERGY_METER_INFO_KEY.contract_starts_on:
      case ENERGY_METER_INFO_KEY.contract_ends_on:
      case ENERGY_METER_INFO_KEY.meter_id:
      case ENERGY_METER_INFO_KEY.unit_rate_type:
      case ENERGY_METER_INFO_KEY.standing_charge:
        return meter[key];
      case ENERGY_METER_INFO_KEY.fuel_type:
        return FUEL_TYPE_LABEL[meter[key]] || NOT_AVAILABLE_LABEL;
      case ENERGY_METER_INFO_KEY.meter_type:
        return METER_TYPE_LABEL[meter[key]] || NOT_AVAILABLE_LABEL;
      case ENERGY_METER_INFO_KEY.annual_consumption: {
        return meter[key] / 1000; // Wh to kWh
      }
      case ENERGY_METER_INFO_KEY.supplier_id: {
        const foundSupplier = suppliers.data.find(supplier => supplier.id === meter[key]);
        return foundSupplier ? foundSupplier.name : NOT_AVAILABLE_LABEL;
      }
      case ENERGY_METER_INFO_KEY.resource_id: {
        const foundResource = energyResources.data.find(resource => resource.id === meter[key]);
        return foundResource ? foundResource.name : NOT_AVAILABLE_LABEL;
      }
      case 'unit_rate':
        return meter[ENERGY_METER_INFO_KEY.consumption_by_rates].reduce((baseString, ratePeriod) => {
          const unitRatePeriod = meter[ENERGY_METER_INFO_KEY.unit_rate_type] !== MUG_METER_RATE_TYPE.SINGLE
            ? `${ratePeriod.unit_rate_period}: ` : '';
          const unitRate = meter[ENERGY_METER_INFO_KEY.unit_rate_type] !== MUG_METER_RATE_TYPE.SINGLE
            ? `${ratePeriod.unit_rate}, ` : ratePeriod.unit_rate;
          return `${baseString}${unitRatePeriod}${unitRate}`;
        }, '');
      case 'consumption':
        return meter[ENERGY_METER_INFO_KEY.consumption_by_rates].reduce((baseString, ratePeriod) => {
          const unitRatePeriod = meter[ENERGY_METER_INFO_KEY.unit_rate_type] !== MUG_METER_RATE_TYPE.SINGLE
            ? `${ratePeriod.unit_rate_period}: ` : '';
          const consumption = meter[ENERGY_METER_INFO_KEY.unit_rate_type] !== MUG_METER_RATE_TYPE.SINGLE
            ? `${ratePeriod.consumption}, ` : ratePeriod.consumption;
          return `${baseString}${unitRatePeriod}${consumption}`;
        }, '');
      default:
        return NOT_AVAILABLE_LABEL;
    }
  };

  toggleEnergyMetersBillingInfo = () => {
    const { showMetersBillingInfoBlock } = this.state;
    this.setState({ showMetersBillingInfoBlock: !showMetersBillingInfoBlock }, () => {
      if (!showMetersBillingInfoBlock) {
        this.getEnergyMetersBillingInfo();
      }
    });
  };

  render() {
    const { classes, registrationRequest, style } = this.props;
    const { meters, showMetersBillingInfoBlock } = this.state;
    const trialRegRowsData = this.getTrialRegRowsData(registrationRequest);
    const questInterestsRegRowsData = this.getQuestionnaireInterestsRegRowsData(registrationRequest);
    const showEnergyMetersBillInfoBtn = registrationRequest.status === REGISTRATION_REQUEST_STATUS.activation_accepted;
    return (
      <div className={classes.root} style={style}>
        <TablePaginationComponent rows={trialRegRowsData} />
        {questInterestsRegRowsData.length > 0 && (
          <React.Fragment>
            <Typography className={classes.interestsTitle}>
              Energy information in the expression of interest
            </Typography>
            <TablePaginationComponent rows={questInterestsRegRowsData} />
          </React.Fragment>
        )}
        {showEnergyMetersBillInfoBtn && (
          <div className={classes.showMeterBillInfoBtnContainer}>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={() => this.toggleEnergyMetersBillingInfo()}
            >
              {showMetersBillingInfoBlock ? 'Hide energy meters billing info' : 'Show energy meters billing info'}
            </Button>
          </div>
        )}
        {showMetersBillingInfoBlock && (
          <React.Fragment>
            {meters.length > 0 ? (
              <React.Fragment>
                <Typography className={classes.interestsTitle}>
                  Energy meters information
                </Typography>
                <TablePaginationComponent rows={this.getEnergyMetersInfoRowsData(meters)} showTableHead paginationColSpan={ENERGY_METER_INFO_ITEMS_LENGTH} />
              </React.Fragment>
            ) : (
              <div className={classes.noDataBlock}>
                <NoItems paddingTop={0} imageWidth={150} />
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

SchoolRegistrationInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  registrationRequest: PropTypes.object.isRequired,
  suppliers: PropTypes.object.isRequired,
  energyResources: PropTypes.object.isRequired,
  style: PropTypes.object,
};

SchoolRegistrationInfo.defaultProps = {
  style: {},
};

function mapStateToProps(state) {
  return {
    suppliers: state.suppliers,
    energyResources: state.energyResources,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...schoolsActions,
      getSuppliers,
      getEnergyResourcesList,
    }, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SchoolRegistrationInfo);
