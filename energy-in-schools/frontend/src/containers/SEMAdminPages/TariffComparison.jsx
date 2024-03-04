import React, { PureComponent, createRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import {
  Element,
  scroller,
} from 'react-scroll';

import classnames from 'classnames';

import { isNil, isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import {
  getComparisonQuotes,
  callPeriodConsumptionActions,
  getPeriodConsumption,
  createSwitch,
} from '../../actions/MUGActions';
import { getEnergyMetersBillingInfoList } from '../../actions/schoolsActions';

import {
  CONSUMPTION_PERIOD,
  ENERGY_METER_INFO_GENERAL_KEYS,
  ENERGY_METER_INFO_EXTRA_KEYS,
  ENERGY_METER_INFO_KEY_RESULT_LABEL,
  NO_SELECTED_METER_ID,
  PAYMENT_INFO_KEYS_ENTRIES,
} from '../../components/TariffComparison/constants';

import { getMeterInfoDetails, meterDetailFormatValueFunc } from '../../components/TariffComparison/utils';

import NoMetersBillingInfo from '../../components/TariffComparison/NoMetersBillingInfo';
import ComparisonResult from '../../components/TariffComparison/ComparisonResult';
import NoItems from '../../components/NoItems';
import DetailedTariffDialog from '../../components/dialogs/DetailedTariffDialog';
import SwitchTariffDialog from '../../components/dialogs/SwitchTariffDialog';
import PeriodsConsumptionContainer from '../../components/TariffComparison/PeriodsConsumptionContainer';
import EnergyMeterBillingInfoDetails from '../../components/TariffComparison/EnergyMeterBillingInfoDetails';
import MeterSelect from '../../components/TariffComparison/MeterSelect';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import AlertDialog from '../../components/dialogs/AlertDialog';

import { UNIT } from '../../constants/config';

import { ROUTE_PATH } from '../../constants/routing';

import formatErrorMessageFromError from '../../utils/errorHandler';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.87)',
    fontFamily: 'Roboto-Medium',
  },
  pageTitle: {
    height: 70,
    width: '100%',
    backgroundImage: 'linear-gradient(to bottom right, rgb(0, 188, 212), rgb(38, 229, 243))',
    [theme.breakpoints.down('xs')]: {
      height: 60,
    },
  },
  pageTitleText: {
    fontSize: 21,
    fontWeight: 600,
    fontFamily: 'Roboto, Helvetica',
    letterSpacing: 3,
    wordSpacing: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
      fontWeight: 500,
    },
  },
  noBillingInfoRoot: {
    height: '80%',
  },
  meterSelectContainer: {
    paddingTop: 30,
    paddingBottom: 30,
  },
  meterBillingInfoDetailContainer: {
    marginBottom: 0,
  },
  meterInfoTitleText: {
    fontSize: 21,
  },
  periodsConsumptionContainerRoot: {
    padding: 0,
    borderRadius: 0,
    boxShadow: 'none',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  },
  periodsConsumptionTitleText: {
    fontSize: 18,
    marginTop: 12,
  },
  periodsConsumptionChartsContainer: {
    marginTop: 8,
  },
  resultsContainer: {
    paddingBottom: 10,
    borderRadius: 13,
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  tableContainer: {
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: 20,
  },
  confirmDialogRootPaper: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      marginLeft: 0,
      marginRight: 0,
    },
  },
  confirmDialogTitle: {
    margin: '16px auto',
  },
  requestStatusMessageText: {
    display: 'block',
    textAlign: 'center',
    fontWeight: 500,
    fontSize: 18,
    color: 'rgba(75, 181, 67, 1)',
  },
  errorText: {
    color: 'rgba(243, 20, 49, 1)',
  },
  requestStatusTextBlock: {
    display: 'block',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  requestReportDialogContextText: {
    marginBottom: 0,
  },
  requestReportDialogTitle: {
    margin: '16px auto',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 500,
  },
  emailLink: {
    textDecoration: 'none',
    color: 'rgb(4, 187, 221)',
  },
});

const DIALOG_STATE_KEY = Object.freeze({
  detailedTariffDialogOpened: 'detailedTariffDialogOpened',
  switchDialogOpened: 'switchDialogOpened',
  requestSwitchConfirmDialogOpened: 'requestSwitchConfirmDialogOpened',
  switchRequestReportDialogOpened: 'switchRequestReportDialogOpened',
});

const DIALOGS_DEFAULT_STATE = Object.freeze({
  [DIALOG_STATE_KEY.detailedTariffDialogOpened]: false,
  [DIALOG_STATE_KEY.switchDialogOpened]: false,
  [DIALOG_STATE_KEY.requestSwitchConfirmDialogOpened]: false,
  [DIALOG_STATE_KEY.switchRequestReportDialogOpened]: false,
});

/* eslint-disable react/destructuring-assignment */
class TariffComparison extends PureComponent {
  state = {
    loading: true, // need it to prevent extra rendering on init
    selectedQuote: null,
    ...DIALOGS_DEFAULT_STATE,
  };

  selectedMeterId = NO_SELECTED_METER_ID;

  paymentData = {};

  tariffSwitchRequestStatus = null;

  constructor(props) {
    super(props);
    this.EnergyMeterBillingInfoDetailsElement = createRef();
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getEnergyMetersBillingInfoList()
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  getComparisonData = (energyMeterBillingInfoId) => {
    this.getComparisonQuotes(energyMeterBillingInfoId);
    this.getPeriodsConsumptionData(energyMeterBillingInfoId);
  };

  getPeriodsConsumptionData = (energyMeterBillingInfoId) => {
    const { actions, energyMetersBillingData } = this.props;
    const currentMeterBillingInfo = energyMetersBillingData.data.find(infoItem => infoItem.id === energyMeterBillingInfoId) || {};
    const resourceId = currentMeterBillingInfo.resource_id;
    actions.callPeriodConsumptionActions(
      Object.values(CONSUMPTION_PERIOD).map(period => getPeriodConsumption(resourceId, period, UNIT.kilowattHour)),
    );
  };

  getComparisonQuotes = (energyMeterBillingInfoId) => {
    const { actions } = this.props;
    actions.getComparisonQuotes(energyMeterBillingInfoId);
  };

  getQuotesResultsToDisplay = () => {
    const { quotesData: { data } } = this.props;
    if (isEmpty(data)) return [];
    return [...data].sort((a, b) => a.total_cost_excluding_vat - b.total_cost_excluding_vat);
  };

  getPeriodsConsumptionDataToDisplay = () => {
    const { periodsConsumptionData: { data } } = this.props;
    return data || {};
  };

  onSelectMeter = (energyMeterBillingInfoId) => {
    this.selectedMeterId = energyMeterBillingInfoId;
    this.getComparisonData(energyMeterBillingInfoId);
  };

  toggleDetailedTariffDialog = (result) => {
    this.setState(prevState => ({
      detailedTariffDialogOpened: !prevState.detailedTariffDialogOpened && !isNil(result),
      selectedQuote: result,
    }));
  };

  toggleSwitchDialog = (result = null) => {
    this.setState(prevState => ({
      switchDialogOpened: !prevState.switchDialogOpened,
      selectedQuote: result,
    }));
  };

  sendTariffSwitchRequest = () => {
    const { actions } = this.props;
    const { selectedQuote } = this.state;
    this.toggleDialog(DIALOG_STATE_KEY.requestSwitchConfirmDialogOpened);
    actions.createSwitch(
      this.selectedMeterId,
      PAYMENT_INFO_KEYS_ENTRIES.reduce((res, entry) => {
        const [paymentDataKey, requestDataKey] = entry;
        res[requestDataKey] = this.paymentData[paymentDataKey];
        return res;
      }, {
        result_id: selectedQuote.result_id,
        supplier_id: selectedQuote.supplier_id,
        tariff_name: selectedQuote.tariff_name,
        to_standing_charge: selectedQuote.standing_charge,
        tariff_rate_infos: selectedQuote.tariff_rate_infos,
        contract_start_date: selectedQuote.contract_start_date,
        contract_end_date: selectedQuote.contract_end_date,
      }),
    )
      .then(() => {
        const message = `${selectedQuote.supplier_name} contract has been sent to customer and is waiting to be signed using DocuSign!`;
        this.tariffSwitchRequestStatus = {
          success: true,
          message,
        };
      })
      .catch((error) => {
        this.tariffSwitchRequestStatus = {
          success: false,
          message: formatErrorMessageFromError(error),
        };
      })
      .finally(() => {
        this.toggleDialog(DIALOG_STATE_KEY.switchRequestReportDialogOpened);
      });
  }

  onPaymentInfoFormSubmit = (selectedMeterId, data) => {
    this.paymentData = data;
    this.toggleDialog(
      DIALOG_STATE_KEY.switchDialogOpened,
      { [DIALOG_STATE_KEY.requestSwitchConfirmDialogOpened]: true },
    );
  }

  onClickTariffPrice = () => {
    this.EnergyMeterBillingInfoDetailsElement.current.forceExpand(() => {
      scroller.scrollTo('PeriodsConsumptionContainer', {
        smooth: true,
        offset: -50,
      });
    });
  };

  navigateToSwitches = () => {
    const { history } = this.props;
    this.toggleDialog(DIALOG_STATE_KEY.switchRequestReportDialogOpened)
      .then(() => {
        history.push(ROUTE_PATH.switches);
      });
  }

  onEditPaymentInfo = () => {
    this.toggleDialog(
      DIALOG_STATE_KEY.switchRequestReportDialogOpened,
      { [DIALOG_STATE_KEY.switchDialogOpened]: true },
    );
  }

  toggleDialog = (dialogStateKey, newState = {}) => new Promise((resolve) => {
    const dialogPrevState = this.state[dialogStateKey];
    this.setState(
      {
        [dialogStateKey]: !dialogPrevState,
        ...newState,
      },
      () => { resolve(); },
    );
  })
    .catch((err) => {
      console.error(err); // eslint-disable-line no-console
    });

  renderTariffSwitchSentRequestStatusMessage = () => {
    const { classes } = this.props;
    const { selectedQuote } = this.state;
    if (isNil(this.tariffSwitchRequestStatus) || isNil(selectedQuote)) return null;
    const { success, message } = this.tariffSwitchRequestStatus;
    return (
      <Fragment>
        <Typography
          component="span"
          className={classnames(
            classes.requestStatusMessageText,
            { [classes.errorText]: !success },
          )}
        >
          {message}
        </Typography>
        {success && (
          <Fragment>
            <br />
            <Typography component="span" className={classes.requestStatusTextBlock} style={{ fontWeight: 500 }}>
              Attention: Immediate further action required.
            </Typography>
            <br />
            <Typography component="span" className={classes.requestStatusTextBlock}>
              Your Customer&rsquo;s contract with {selectedQuote.supplier_name} has been emailed and is waiting to be signed using DocuSign.
            </Typography>
            <br />
            <Typography component="span" className={classes.requestStatusTextBlock}>
              Please inform the customer on the following steps to validate this contract
            </Typography>
            <Typography component="span" className={classes.requestStatusTextBlock}>
              <ol>
                <li>Please go to the inbox given and open the link to DocuSign the contract</li>
                <li>Review contract thoroughly</li>
                <li>Have an individual who has signing authority sign the contract</li>
                <li>Press Submit Contract</li>
                <li>Keep Contract for your records</li>
              </ol>
            </Typography>
            <Typography component="span" className={classes.requestStatusTextBlock}>
              For further questions, please contact <a className={classes.emailLink} href="mailto:support@myutilitygenius.co.uk">support@myutilitygenius.co.uk</a>
            </Typography>
            <br />
            <Typography component="span" className={classes.requestStatusTextBlock}>
              Thank you for using EnergyInSchools for your business energy needs.
            </Typography>
          </Fragment>
        )}
      </Fragment>
    );
  }

  render() {
    const { loading } = this.state;
    if (loading) return null;
    const { classes, energyMetersBillingData: { data: metersBillingData } } = this.props;
    const { selectedQuote } = this.state;

    const billingInfoIsAvailable = metersBillingData.length > 0;

    const currentMeterBillingInfo = metersBillingData.find(item => item.id === this.selectedMeterId);

    const quotesResults = this.getQuotesResultsToDisplay();

    const periodsConsumptionDataResult = this.getPeriodsConsumptionDataToDisplay();

    const switchRequestSucceed = this.tariffSwitchRequestStatus && this.tariffSwitchRequestStatus.success;

    return (
      <div className={classes.root}>
        <Grid container style={{ height: billingInfoIsAvailable ? 'auto' : '100%' }}>
          <Grid item container xs={12} justify="center" alignItems="center" className={classes.pageTitle}>
            <Typography align="center" className={classes.pageTitleText}>TARIFF COMPARISON</Typography>
          </Grid>
          { billingInfoIsAvailable ? (
            <Grid item container xs={12} justify="center">
              <Grid item container xs={12} justify="center" alignItems="center" className={classes.meterSelectContainer}>
                <MeterSelect metersBillingData={metersBillingData} onChange={this.onSelectMeter} />
              </Grid>
            </Grid>
          ) : (
            <NoMetersBillingInfo classes={{ root: classes.noBillingInfoRoot }} onChange={this.onSelectMeter} />
          )}
        </Grid>
        {(billingInfoIsAvailable && !isNil(currentMeterBillingInfo)) && (
          <React.Fragment>
            <Grid container className={classes.meterBillingInfoDetailContainer}>
              <EnergyMeterBillingInfoDetails
                classes={{ titleText: classes.meterInfoTitleText }}
                generalInfoItems={getMeterInfoDetails(currentMeterBillingInfo, ENERGY_METER_INFO_GENERAL_KEYS, ENERGY_METER_INFO_KEY_RESULT_LABEL)}
                extraInfoItems={getMeterInfoDetails(currentMeterBillingInfo, ENERGY_METER_INFO_EXTRA_KEYS, ENERGY_METER_INFO_KEY_RESULT_LABEL)}
                formatValueFunc={meterDetailFormatValueFunc}
                ref={this.EnergyMeterBillingInfoDetailsElement}
              >
                <Element name="PeriodsConsumptionContainer" />
                <PeriodsConsumptionContainer
                  showTitle={false}
                  showExpand={false}
                  openedOnInit
                  title="Daily Consumption"
                  classes={{
                    root: classes.periodsConsumptionContainerRoot,
                    titleText: classes.periodsConsumptionTitleText,
                    chartsContainer: classes.periodsConsumptionChartsContainer,
                  }}
                  data={periodsConsumptionDataResult}
                />
              </EnergyMeterBillingInfoDetails>
            </Grid>
            <Grid container alignItems="center" justify="center">
              <Grid item xs={12} container direction="column" className={classes.resultsContainer}>
                {quotesResults.length > 0 ? (
                  <Grid item container className={classes.tableContainer} justify="center">
                    {quotesResults.map(result => (
                      <Grid item xs={12} md={11} lg={10} key={result.result_id}>
                        <ComparisonResult
                          resultData={result}
                          onClickDetailedTariffInfo={() => { this.toggleDetailedTariffDialog(result); }}
                          onClickSwitch={() => { this.toggleSwitchDialog(result); }}
                          onClickTariffPrice={this.onClickTariffPrice}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <NoItems />
                )}
              </Grid>
            </Grid>
          </React.Fragment>
        )}
        <DetailedTariffDialog
          isOpened={this.state[DIALOG_STATE_KEY.detailedTariffDialogOpened]}
          onClose={() => { this.toggleDetailedTariffDialog(null); }}
          tariffInfo={selectedQuote}
          title="Detailed Tariff Info"
          maxWidth={false}
        />
        <ConfirmDialog
          title="Confirm the tariff switch"
          isOpened={this.state[DIALOG_STATE_KEY.requestSwitchConfirmDialogOpened]}
          onClose={() => { this.toggleDialog(DIALOG_STATE_KEY.requestSwitchConfirmDialogOpened); }}
          onSubmit={this.sendTariffSwitchRequest}
          classes={{
            dialogTitle: classes.confirmDialogTitle,
          }}
          rootDialogProps={{
            classes: {
              paper: classes.confirmDialogRootPaper,
            },
          }}
        >
          {selectedQuote && (
            <Grid container>
              <Typography>Switch to</Typography>
              <br />
              <Typography align="center" style={{ fontWeight: 500, width: '100%', padding: 8 }}>
                {selectedQuote.tariff_name}
              </Typography>
              <br />
              <Typography>Are you sure you want to proceed?</Typography>
            </Grid>
          )}
        </ConfirmDialog>
        {this.selectedMeterId && (
          <SwitchTariffDialog
            isOpened={this.state[DIALOG_STATE_KEY.switchDialogOpened]}
            onClose={() => { this.toggleDialog(DIALOG_STATE_KEY.switchDialogOpened); }}
            selectedMeterId={this.selectedMeterId}
            onSubmitSwitch={this.onPaymentInfoFormSubmit}
          />
        )}
        <AlertDialog
          classes={{ dialogContentText: classes.requestReportDialogContextText }}
          isOpened={this.state[DIALOG_STATE_KEY.switchRequestReportDialogOpened]}
          onClose={() => { this.toggleDialog(DIALOG_STATE_KEY.switchRequestReportDialogOpened); }}
          title={switchRequestSucceed ? 'Contract Sent!' : 'Error!'}
          content={this.renderTariffSwitchSentRequestStatusMessage()}
          onSubmit={switchRequestSucceed ? this.navigateToSwitches : this.onEditPaymentInfo}
          submitLabel={switchRequestSucceed ? 'Switches' : 'Edit Payment Info'}
          rootDialogProps={{
            classes: { dialogTitle: classes.requestReportDialogTitle },
          }}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    energyMetersBillingData: state.energyMetersBillingData,
    quotesData: state.tariffsComparisonData.quotesData,
    periodsConsumptionData: state.tariffsComparisonData.periodsConsumptionData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getComparisonQuotes,
      callPeriodConsumptionActions,
      getEnergyMetersBillingInfoList,
      createSwitch,
    }, dispatch),
  };
}

TariffComparison.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  energyMetersBillingData: PropTypes.object.isRequired,
  quotesData: PropTypes.object.isRequired,
  periodsConsumptionData: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(TariffComparison);
