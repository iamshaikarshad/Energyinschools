import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router-dom';

import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ChooseIcon from '@material-ui/icons/ChevronRight';
import RefreshIcon from '@material-ui/icons/Refresh';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import { isNil } from 'lodash';

import Loader from './Loader';
import TypeSelect from './TypeSelect';

import DateTimeRangeSelect from '../../../components/DateTimeRangeSelect/DateTimeRangeSelect';

import * as dashboardActions from '../../../actions/EnergyManagerDashboard/energyManagerDashboardActions';
import { getAllSchools } from '../../../actions/schoolsActions';

import {
  CONSUMPTION_PERIOD_TYPE,
  CONSUMPTION_PERIOD_TYPE_LABEL,
  CONSUMPTION_PERIODS_ENABLED_TO_REFRESH,
  CONSUMPTION_ENERGY_TYPE,
  CONSUMPTION_ENERGY_TYPE_LABEL,
  CONSUMPTION_ENERGY_TYPE_QUERY_VALUE_MAP,
  CUSTOM_CONSUMPTION_PERIOD,
  DATE_RANGE_SELECT_THEME,
  DEFAULT_ENERGY_TYPE_SELECT_OPTIONS,
  PERIOD_TYPE_SELECT_OPTIONS_WITH_CUSTOM_SELECT,
} from './constants';

import { DATE_RANGE_VALIDATOR, DATE_RANGE_VALIDATOR_TYPE } from '../../../components/DateTimeRangeSelect/constants';

import {
  UNIT_TO_LABEL_MAP, UNIT, ELECTRICITY, GAS,
} from '../../../constants/config';


import roundToNPlaces from '../../../utils/roundToNPlaces';

import { getTodayTimeLimits, getYesterdayTimeLimits } from '../../../utils/timeUtils';

import SelectMeterTypeDialog from '../../../components/dialogs/SelectMeterTypeDialog';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
  },
  header: {
    padding: 16,
  },
  headerText: {
    color: 'rgb(255, 255, 255)',
    fontWeight: 500,
    fontSize: 21,
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  valueWidget: {
    marginTop: 16,
    border: '8px solid rgb(171, 226, 251)',
    borderRadius: 25,
    height: 210,
    color: 'rgb(255, 255, 255)',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  valueDetail: {
    color: 'inherit',
    fontSize: 21,
    padding: 12,
    textAlign: 'center',
  },
  customPeriodDetail: {
    color: 'inherit',
    fontSize: 14,
    padding: '12px 4px',
    textAlign: 'center',
    [theme.breakpoints.up('xl')]: {
      fontSize: 16,
    },
  },
  valueBlock: {
    color: 'rgb(171, 226, 251)',
    textAlign: 'center',
    lineHeight: 'normal',
  },
  value: {
    display: 'inline-block',
    fontSize: 26,
    fontWeight: 500,
    marginRight: 5,
    [theme.breakpoints.up('xl')]: {
      fontSize: 28,
    },
  },
  valueTypeLabel: {
    fontSize: 18,
    color: 'rgb(255, 255, 255)',
    textAlign: 'center',
    marginBottom: 16,
  },
  unit: {
    display: 'inline-block',
    fontSize: 18,
  },
  energyConsButtonContainer: {
    position: 'absolute',
    bottom: 0,
    padding: 16,
  },
  energyConsContainerButtons: {
    fontSize: 16,
    fontWeight: 500,
    justifyContent: 'center',
    color: 'rgb(150, 255, 255)',
    '&:hover': {
      backgroundColor: 'rgba(150, 255, 255, 0.1)',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 14,
    },
  },
  chooseIcon: {
    fontSize: 28,
    marginBottom: 2,
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
    },
  },
  energyTypeSelectContainer: {
    justifyContent: 'flex-start',
    paddingLeft: 8,
  },
  refreshButtonContainer: {
    padding: '0px 8px',
  },
  refreshButton: {
    color: 'rgb(150, 255, 255)',
  },
  refreshButtonDisabled: {
    color: 'rgba(150, 255, 255, 0.3) !important',
  },
  divider: {
    width: 1,
    height: '50%',
    backgroundColor: 'rgba(150, 255, 255, 0.3)',
    alignSelf: 'flex-end',
  },
  loaderRoot: {
    height: 'auto',
    position: 'static',
    overflow: 'hidden',
  },
  dateTimeInputLabelRoot: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  dateTimeInputLabelFocused: {
    color: 'rgba(0, 0, 0, 1) !important',
  },
  dateTimeInputRoot: {
    color: 'rgba(0, 0, 0, 0.87)',
    '&:hover::before': {
      borderBottom: '1px solid rgba(37, 173, 223, 0.5) !important',
    },
    '&::after': {
      borderBottom: '1px solid rgba(37, 173, 223, 1) !important',
    },
  },
  dateTimeInputIcon: {
    '& button': {
      color: 'rgb(37, 173, 223) !important',
    },
  },
  dateTimeSelectDialogRoot: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  dateTimeSelectSubmitButton: {
    color: 'rgb(37, 173, 223)',
  },
});

const PERIOD_LIMIT_DISPLAY_FORMAT = 'YYYY/MM/DD HH:mm';

const getDateTimePickerProps = classes => (
  {
    variant: 'inline',
    autoOk: true,
    ampm: false,
    format: PERIOD_LIMIT_DISPLAY_FORMAT,
    disableFuture: true,
    minutesStep: 5,
    maxDateMessage: 'Date should not be from the future',
    strictCompareDates: true,
    InputLabelProps: {
      classes: {
        root: classes.dateTimeInputLabelRoot,
        focused: classes.dateTimeInputLabelFocused,
      },
    },
    InputProps: {
      classes: {
        root: classes.dateTimeInputRoot,
      },
    },
    InputAdornmentProps: {
      classes: {
        root: classes.dateTimeInputIcon,
      },
    },
  }
);

class EnergyTotalConsumption extends React.Component {
  static formatDate(date, format = PERIOD_LIMIT_DISPLAY_FORMAT, errorText = '?') {
    if (!moment.isMoment(date) || !date.isValid()) return errorText;
    return moment(date).format(format);
  }

  state = {
    consumptionPeriodType: CONSUMPTION_PERIOD_TYPE.live,
    consumptionEnergyType: CONSUMPTION_ENERGY_TYPE.total,
    customPeriodSelectOpened: false,
    schoolCreatedAt: moment().subtract(1, 'year'),
    exportDataDialogOpened: false,
    selectMeterTypeDialogOpened: false,
    selectedMeterType: ELECTRICITY,
  };

  period = {};

  componentDidMount() {
    const { actions } = this.props;
    actions.getAllSchools(true)
      .then((data) => {
        const mainLocation = data.find(location => !location.is_sub_location);
        if (mainLocation) {
          this.setState({ schoolCreatedAt: moment(mainLocation.created_at) });
        }
      });
    this.getData();
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    return !nextProps.data.loading || !data.loading;
  }

  getData = (period) => {
    const { actions, name } = this.props;
    const { consumptionPeriodType, consumptionEnergyType } = this.state;
    const energyType = CONSUMPTION_ENERGY_TYPE_QUERY_VALUE_MAP[consumptionEnergyType];
    let getEnergyConsumptionAction;
    let getEnergyCostAction;
    let { from, to } = period || {};

    switch (consumptionPeriodType) {
      case CONSUMPTION_PERIOD_TYPE.live:
        getEnergyConsumptionAction = actions.getEnergyLiveTotalConsumption;
        getEnergyCostAction = actions.getEnergyLiveTotalCost;
        break;
      case CONSUMPTION_PERIOD_TYPE.today:
        getEnergyConsumptionAction = actions.getEnergyTotalConsumption;
        getEnergyCostAction = actions.getEnergyTotalCost;
        ({ from, to } = getTodayTimeLimits());
        break;
      case CONSUMPTION_PERIOD_TYPE.yesterday:
        getEnergyConsumptionAction = actions.getEnergyTotalConsumption;
        getEnergyCostAction = actions.getEnergyTotalCost;
        ({ from, to } = getYesterdayTimeLimits());
        break;
      case CUSTOM_CONSUMPTION_PERIOD:
        getEnergyConsumptionAction = actions.getEnergyTotalConsumption;
        getEnergyCostAction = actions.getEnergyTotalCost;
        break;
      default:
        getEnergyConsumptionAction = actions.getEnergyLiveTotalConsumption;
        getEnergyCostAction = actions.getEnergyLiveTotalCost;
        break;
    }
    actions.callDashboardItemActions(
      [getEnergyConsumptionAction(energyType, from, to), getEnergyCostAction(energyType, from, to)],
      name,
    );
  }

  static getValuePrecision(value) {
    if (value < 0.05) return 2;
    if (value >= 1000) return 0;
    return 1;
  }

  getValidators() {
    const { exportDataDialogOpened } = this.state;
    const dataRangeValidators = [
      DATE_RANGE_VALIDATOR[DATE_RANGE_VALIDATOR_TYPE.bothRequired](),
      DATE_RANGE_VALIDATOR[DATE_RANGE_VALIDATOR_TYPE.fromLessThanTo](),
    ];
    if (exportDataDialogOpened) {
      dataRangeValidators.push(DATE_RANGE_VALIDATOR[DATE_RANGE_VALIDATOR_TYPE.deltaYearPeriod]());
    }
    return dataRangeValidators;
  }


  onChangeConsumptionPeriodType = (event) => {
    const { consumptionPeriodType, customPeriodSelectOpened } = this.state;
    const { data } = this.props;
    const targetValue = event.target.value;
    if (targetValue === CUSTOM_CONSUMPTION_PERIOD) {
      this.setState({
        customPeriodSelectOpened: !customPeriodSelectOpened,
      });
      return;
    }
    if (targetValue !== consumptionPeriodType && !data.loading) {
      this.setState(
        { consumptionPeriodType: targetValue },
        () => { this.getData(); },
      );
    }
  }

  onChangeConsumptionEnergyType = (event) => {
    const { consumptionEnergyType } = this.state;
    const { data } = this.props;
    const targetValue = event.target.value;
    if (targetValue !== consumptionEnergyType && !data.loading) {
      this.setState(
        { consumptionEnergyType: targetValue },
        () => { this.getData(this.period); },
      );
    }
  }

  onDetailClick = () => {
    const { history } = this.props;
    history.push('/energy-usage');
  };

  onSelectDateTimeRange = (from, to) => {
    this.period = { from, to };
    this.setState(
      {
        consumptionPeriodType: CUSTOM_CONSUMPTION_PERIOD,
        customPeriodSelectOpened: false,
      },
      () => { this.getData({ from, to }); },
    );
  }

  onExportSubmitClick = (from, to) => {
    const { actions } = this.props;
    const { selectedMeterType } = this.state;
    this.period = { from, to };

    this.setState(
      {
        exportDataDialogOpened: false,
      },
      () => {
        actions.downloadExportHistoricalDataFile({
          from: from.format(),
          to: to.format(),
          meterType: selectedMeterType,
          unit: UNIT.kilowattHour,
        });
      },
    );
  }

  toggleSelectMeterTypeDialog = () => {
    this.setState(prevState => ({ selectMeterTypeDialogOpened: !prevState.selectMeterTypeDialogOpened }));
  };

  toggleExportDataDialog = () => {
    this.setState(prevState => ({ exportDataDialogOpened: !prevState.exportDataDialogOpened }));
  }

  onSelectMeterType = (type) => {
    this.setState({ selectedMeterType: type });
    this.toggleSelectMeterTypeDialog();
    this.toggleExportDataDialog();
  };

  render() {
    const { classes, data } = this.props;
    const { loading, consumptionData, costData } = data;
    const {
      consumptionPeriodType, consumptionEnergyType, customPeriodSelectOpened, schoolCreatedAt, exportDataDialogOpened, selectMeterTypeDialogOpened,
    } = this.state;
    const valueToDisplay = !isNil(consumptionData) ? roundToNPlaces(consumptionData.value, EnergyTotalConsumption.getValuePrecision(consumptionData.value)) : 'N/A';
    const unitToDisplay = !isNil(consumptionData) ? UNIT_TO_LABEL_MAP[consumptionData.unit] : '';
    const costValueToDisplay = !isNil(costData) ? roundToNPlaces(costData.value, EnergyTotalConsumption.getValuePrecision(costData.value)) : 'N/A';
    const costUnitToDisplay = !isNil(costData) ? UNIT_TO_LABEL_MAP[costData.unit] : '';
    const dateTimePickerProps = {
      ...getDateTimePickerProps(classes),
      minDate: schoolCreatedAt,
      minDateMessage: `Date should not be before School registration date (${EnergyTotalConsumption.formatDate(schoolCreatedAt)})`,
    };
    return (
      <div className={classes.root}>
        <Grid container justify="center" alignItems="center" className={classes.header}>
          <Typography className={classes.headerText}>
            Energy consumption overview
          </Typography>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <TypeSelect
              classes={{
                selectContainer: classes.energyTypeSelectContainer,
              }}
              onChangePeriodType={this.onChangeConsumptionEnergyType}
              currentValue={consumptionEnergyType}
              options={DEFAULT_ENERGY_TYPE_SELECT_OPTIONS}
              selectLabel="Energy Type"
            />
          </Grid>
          <Grid item xs={6}>
            <TypeSelect onChangePeriodType={this.onChangeConsumptionPeriodType} currentValue={consumptionPeriodType} options={PERIOD_TYPE_SELECT_OPTIONS_WITH_CUSTOM_SELECT} />
          </Grid>
        </Grid>
        <Grid container justify="flex-end" className={classes.refreshButtonContainer}>
          <Button
            className={classes.refreshButton}
            classes={{ disabled: classes.refreshButtonDisabled }}
            disabled={!CONSUMPTION_PERIODS_ENABLED_TO_REFRESH.includes(consumptionPeriodType)}
            onClick={this.getData}
          >
            <RefreshIcon style={{ marginRight: 9, width: 16 }} />
            Refresh
          </Button>
        </Grid>
        <Grid container justify="center">
          <Grid container item xs={10} sm={8} md={6} lg={7} className={classes.valueWidget} direction="column" wrap="nowrap">
            <Grid>
              <Typography className={classes.valueDetail}>{CONSUMPTION_ENERGY_TYPE_LABEL[consumptionEnergyType]}</Typography>
            </Grid>
            <Grid container wrap="nowrap" alignItems="center">
              <Grid container item xs={6} direction="column">
                <Typography className={classes.valueTypeLabel}>Usage</Typography>
                <Typography component="div" className={classes.valueBlock}>
                  {!loading ? (
                    <React.Fragment>
                      <span className={classes.value}>{valueToDisplay}</span>
                      <span className={classes.unit}>{unitToDisplay}</span>
                    </React.Fragment>
                  ) : (
                    <Loader classes={{ root: classes.loaderRoot }} circularProgressProps={{ size: 30 }} />
                  )}
                </Typography>
              </Grid>
              <Grid className={classes.divider} />
              <Grid container item xs direction="column">
                <Typography className={classes.valueTypeLabel}>Cost</Typography>
                <Typography component="div" className={classes.valueBlock}>
                  {!loading ? (
                    <React.Fragment>
                      <span className={classes.value}>{costValueToDisplay}</span>
                      <span className={classes.unit}>{costUnitToDisplay}</span>
                    </React.Fragment>
                  ) : (
                    <Loader classes={{ root: classes.loaderRoot }} circularProgressProps={{ size: 30 }} />
                  )}
                </Typography>
              </Grid>
            </Grid>
            <Grid container justify="center">
              {(consumptionPeriodType === CUSTOM_CONSUMPTION_PERIOD && !isNil(this.period)) ? (
                <Typography className={classes.customPeriodDetail}>
                  {EnergyTotalConsumption.formatDate(this.period.from)} &nbsp; &ndash; &nbsp; {EnergyTotalConsumption.formatDate(this.period.to)}
                </Typography>
              ) : (
                <Typography className={classes.valueDetail}>{CONSUMPTION_PERIOD_TYPE_LABEL[consumptionPeriodType]}</Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid>
          <DateTimeRangeSelect
            classes={{
              submitButton: classes.dateTimeSelectSubmitButton,
            }}
            isOpened={customPeriodSelectOpened || exportDataDialogOpened}
            initialFrom={moment().startOf('month')}
            theme={DATE_RANGE_SELECT_THEME}
            displayVariant="modal"
            dialogProps={{
              classes: {
                rootPaper: classes.dateTimeSelectDialogRoot,
              },
            }}
            pickerProps={{
              from: dateTimePickerProps,
              to: dateTimePickerProps,
            }}
            validators={this.getValidators()}
            onSubmit={exportDataDialogOpened ? (from, to) => {
              this.onExportSubmitClick(from, to);
            } : this.onSelectDateTimeRange}
            onCancel={() => { this.setState({ customPeriodSelectOpened: false, exportDataDialogOpened: false }); }}
            submitLabel={customPeriodSelectOpened ? 'Continue' : 'Export Data'}
          />
          <SelectMeterTypeDialog
            isOpened={selectMeterTypeDialogOpened}
            onClose={this.toggleSelectMeterTypeDialog}
            onSubmit={this.onSelectMeterType}
            types={[ELECTRICITY, GAS]}
            title="Choose energy type"

          />
        </Grid>
        <Grid container justify="space-between" alignItems="center" className={classes.energyConsButtonContainer}>
          <Button
            className={classes.energyConsContainerButtons}
            onClick={() => { this.setState({ selectMeterTypeDialogOpened: true }); }}
          >
            <SaveAltIcon style={{ marginRight: 9, width: 16 }} />
            Export data
          </Button>
          <Button
            className={classes.energyConsContainerButtons}
            onClick={this.onDetailClick}
          >
            Details
            <ChooseIcon className={classes.chooseIcon} />
          </Button>
        </Grid>
      </div>
    );
  }
}


function mapStateToProps(state, ownProps) {
  return {
    data: state.energyManagerDashboardData[ownProps.name],
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dashboardActions,
      getAllSchools,
    }, dispatch),
  };
}

EnergyTotalConsumption.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
};

export default compose(
  withRouter,
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(EnergyTotalConsumption);
