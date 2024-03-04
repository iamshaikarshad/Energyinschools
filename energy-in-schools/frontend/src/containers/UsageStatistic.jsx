/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import classNames from 'classnames';

import { isEmpty, isNil, mapValues } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ArrowBack from '@material-ui/icons/ArrowBack';

import SLEAdminHeader from '../components/SLEAdminHeader';
import UsageTabs from '../components/UsageStatistic/UsageTabs';
import ConsumptionBarsChart from '../components/UsageStatistic/charts/ConsumptionBarsChart';
import ConsumptionLineChart from '../components/UsageStatistic/charts/ConsumptionLineChart';

import * as usageStatisticActions from '../actions/usageStatisticActions';
import { getCurrentEnergyTariffs } from '../actions/energyTariffsActions';
import { getSchoolInformation, getAllSchools, getOpenSchoolInformation } from '../actions/schoolsActions';
import { getEnergyResourcesList } from '../actions/energyResourcesActions';
import { getSmartThingsSensorsList } from '../actions/smartThingsSensorsActions';
import { downloadExportHistoricalDataFile } from '../actions/EnergyManagerDashboard/energyManagerDashboardActions';

import NoItems from '../components/NoItems';
import ChartHeader from '../components/UsageStatistic/ChartHeader';
import CostTimePanel from '../components/UsageStatistic/CostTimePanel';
import EnergyCostAdvice from '../components/UsageStatistic/EnergyCostAdvice';

import {
  METER_TYPE, TIME_RESOLUTION, UNIT, UNIT_TO_LABEL_MAP, USAGE_STATISTIC_CHART_NAME, SMART_THINGS_SENSOR_CAPABILITY,
} from '../constants/config';

import {
  COMPARISON_DEFAULT_STATE, PERIOD, CUSTOM_PERIOD, COMPARISON, COMMON_COMPARISONS, energyTypeTab,
} from '../components/UsageStatistic/constants';

import {
  hourlyRangeTooltipDateFormatter, tooltipDateFormatter, utcToLocalTimeFormatter, getLocalTimeFromUTC,
} from '../components/UsageStatistic/utils';

import { calcYearlyEnergySavingCostByTodayAlwaysOn } from './SEMAdminPages/EnergyManagerDashboard/constants';

const styles = theme => ({
  root: {
    flexGrow: 1,
    fontFamily: 'Roboto-Medium',
    boxShadow: 'none',
  },
  tabRoot: {
    width: 200,
    height: 65,
    paddingBottom: 0,
    textTransform: 'uppercase',
  },
  energyTypeTabsFlexContainer: {
    [theme.breakpoints.up('md')]: {
      justifyContent: 'center',
    },
  },
  device: {
    padding: theme.spacing(2),
  },
  cardsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  valueUnit: {
    position: 'relative',
    top: '12px',
    left: '3px',
    lineHeight: 1.8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    display: 'flex',
    fontSize: 30,
    fontWeight: 500,
    color: '#555',
    lineHeight: 1.26,

  },
  valueLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
    lineHeight: 2,
  },
  usageCostTab: {
    [theme.breakpoints.down('xs')]: {
      width: '33%',
      height: 50,
    },
  },
  usageCostTabsRoot: {
    width: '100%',
  },
  usageCostTabsFlexContainer: {
    overflow: 'hidden',
    maxWidth: '100%',
    backgroundColor: '#fff',
    height: 60,
    [theme.breakpoints.up('md')]: {
      '&:first-child': {
        borderTopLeftRadius: 13,
      },
      '&:last-child': {
        borderTopRightRadius: 13,
      },
    },
    [theme.breakpoints.down('sm')]: {
      height: 48,
    },
  },
  usageCostTabSelected: {
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  costAdvicePanelRoot: {
    paddingLeft: 0,
    order: 1,
    [theme.breakpoints.up('lg')]: {
      order: 0,
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: 8,
    },
  },
  graphContainer: {
    paddingBottom: 10,
    boxShadow: '0 4px 16px 0 rgba(216, 216, 216, 0.63)',
    borderRadius: 13,
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
  boxShadow: '0 0px 16px 0 rgba(216, 216, 216, 0.63)',
  usageCostTabContainer: {
    borderRadius: 13,
  },
  noTariffsMessageContainer: {
    position: 'absolute',
    left: 0,
    bottom: 130,
  },
  noTariffsMessageBlock: {
    maxWidth: '80%',
    backgroundColor: 'rgb(252, 252, 252)',
  },
  noTariffsMessageText: {
    color: 'rgba(0, 0, 0, 0.7)',
    padding: 32,
    fontSize: 18,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      padding: 16,
    },
  },
  isHistoricalDataFilteredMessage: {
    fontSize: 15,
    color: '#555',
    padding: 10,
    textAlign: 'center',
  },
});

const chartTypeTab = Object.freeze({
  live: 'live',
  usage: 'usage',
  cost: 'cost',
});

const energyTypeTabAlwaysVisibility = Object.freeze({
  [energyTypeTab.electricity]: true,
  [energyTypeTab.gas]: false,
  [energyTypeTab.smartPlug]: false,
  [energyTypeTab.solar]: false,
  [energyTypeTab.unknown]: false,
});

const chartTypeToUnitMap = {
  energy: {
    [chartTypeTab.live]: UNIT.kilowatt,
    [chartTypeTab.usage]: UNIT.kilowattHour,
    [chartTypeTab.cost]: UNIT.poundSterling,
  },
  temperature: {
    [chartTypeTab.live]: UNIT.celsius,
    [chartTypeTab.usage]: UNIT.celsius,
  },
  microbit: {
    [chartTypeTab.live]: null,
    [chartTypeTab.usage]: null,
  },
};

const meterTypesPerEnergyTypeTab = {
  [energyTypeTab.electricity]: [METER_TYPE.electricity],
  [energyTypeTab.gas]: [METER_TYPE.gas],
  [energyTypeTab.solar]: [METER_TYPE.solar],
  [energyTypeTab.smartPlug]: [METER_TYPE.smartPlug],
  [energyTypeTab.unknown]: [METER_TYPE.unknown],
};

const meterTypeForTotalPerEnergyTypeTab = {
  [energyTypeTab.electricity]: METER_TYPE.electricity,
  [energyTypeTab.gas]: METER_TYPE.gas,
  [energyTypeTab.solar]: METER_TYPE.solar,
  [energyTypeTab.smartPlug]: METER_TYPE.smartPlug,
  [energyTypeTab.unknown]: METER_TYPE.unknown,
};

const timeFormatOptions = {
  [TIME_RESOLUTION.year]: { one: 'YYYY', several: 'YYYY' },
  [TIME_RESOLUTION.month]: { one: 'YYYY MMM', several: 'YYYY MMMM' },
  [TIME_RESOLUTION.week]: { one: 'MMM Do', several: 'YYYY MMMM Do' },
  [TIME_RESOLUTION.day]: { one: 'MMM Do', several: 'YYYY MMMM Do' },
  [TIME_RESOLUTION.hour]: { one: 'HH:mm', several: 'MMMM Do HH:mm' },
  [TIME_RESOLUTION.halfHour]: { one: 'HH:mm', several: 'MMMM Do HH:mm' },
  [TIME_RESOLUTION.minute]: { one: 'HH:mm', several: 'MMMM Do HH:mm' },
  [TIME_RESOLUTION.second]: { one: 'HH:mm:ss', several: 'MMMM Do HH:mm' },
};

const meterIndexForSchoolTotal = 0; // if selectedMeterIndex == 0 then full school is selected

class UsageStatistic extends Component {
  state = {
    selectedEnergyType: energyTypeTab.electricity,
    selectedChartType: chartTypeTab.live,
    selectedMeterIndex: meterIndexForSchoolTotal,
    selectedPeriod: PERIOD.day,
    selectedShowedPeriodsCount: 1,
    selectedComparisonPeriodOffset: { ...COMPARISON_DEFAULT_STATE },
    showBackButton: false,
    selectedDay: null,
    showAlwaysOn: false,
  };

  mounted = false;

  controlPanelRef = null;

  dateRange = {
    from: null,
    to: null,
    compareFrom: null,
    compareTo: null,
  };

  timeResolution = null;

  componentDidMount() {
    this.mounted = true;
    const {
      actions, user, locationData, match: { params: { schoolId } },
    } = this.props;
    if (schoolId) {
      actions.getOpenSchoolInformation(schoolId)
        .then(() => {
          this.requestUpdateHistoricalData();
        });
    } else {
      const locationDataAvailable = !isNil(locationData) && locationData.id;
      actions.getAllSchools(!locationDataAvailable);
      const locationId = locationDataAvailable ? locationData.id : user.location_id;
      actions.getSchoolInformation(locationId)
        .then(() => {
          this.requestUpdateHistoricalData();
        });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { meters } = this.props;
    const { selectedChartType, selectedEnergyType } = this.state;
    const propsAndState = this.allMetersAreHalfHour(meters, selectedEnergyType);
    const nextPropsAndState = this.allMetersAreHalfHour(nextProps.meters, nextState.selectedEnergyType);

    if (propsAndState !== nextPropsAndState) {
      this.setState({ selectedChartType: chartTypeTab.live });
      setTimeout(() => this.requestUpdateHistoricalData(), 0);
    }

    return nextProps.callsCount === 0 || selectedChartType !== nextState.selectedChartType;
  }

  componentDidUpdate(prevProps, prevState) {
    const { actions, meters, match: { params: { schoolId } } } = this.props;
    const { selectedChartType, selectedEnergyType, selectedMeterIndex } = this.state;

    if (schoolId && schoolId !== prevProps.match.params.schoolId) {
      actions.getOpenSchoolInformation(schoolId)
        .then(() => {
          this.requestUpdateHistoricalData();
        });
    }

    const selectedMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);
    const isHalfHourMeter = selectedMeter ? selectedMeter.is_half_hour_meter && !selectedMeter.live_values_meter
      : this.allMetersAreHalfHour(meters, selectedEnergyType);
    if (isHalfHourMeter && (
      selectedChartType === chartTypeTab.live && selectedEnergyType === energyTypeTab.electricity
    )) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ selectedChartType: chartTypeTab.usage });
    }

    if (selectedChartType !== prevState.selectedChartType) {
      setTimeout(() => this.requestUpdateHistoricalData(), 0);
    }
  }

  allMetersAreHalfHour = (meters, selectedEnergyType) => {
    const electricMeters = meters.filter(meter => meter.type === METER_TYPE.electricity);

    return selectedEnergyType === energyTypeTab.electricity
      && electricMeters.every(meter => meter.is_half_hour_meter);
  };

  getMetersToQueryForData = (meters) => {
    const { config } = this.props;
    if (!config.showTypeTabs) return meters;
    const { selectedEnergyType } = this.state;
    return meters.filter(meter => meterTypesPerEnergyTypeTab[selectedEnergyType].includes(meter.type));
  }

  getTimeResolutionByPeriod = (selectedPeriod, selectedChartType, maximalTimeResolution) => {
    switch (selectedPeriod) {
      case PERIOD.day:
        if (selectedChartType === chartTypeTab.live) {
          return maximalTimeResolution;
        }
        return TIME_RESOLUTION.hour;

      case PERIOD.week:
      case PERIOD.month:
        return TIME_RESOLUTION.day;

      case PERIOD.year:
        return TIME_RESOLUTION.month;

      case CUSTOM_PERIOD:
        return this.controlPanelRef.customPeriodTimeResolution;
      default:
        return TIME_RESOLUTION.hour;
    }
  };

  getHistoryDateRange = (periodsOffset) => {
    const { meters } = this.props;
    const {
      selectedDay, selectedPeriod, previousSelectedPeriod, selectedShowedPeriodsCount, selectedMeterIndex,
      selectedEnergyType, selectedChartType,
    } = this.state;

    const selectedMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);
    const electricMeters = meters.filter(meter => meter.type === METER_TYPE.electricity);
    const isHalfHourMeter = selectedMeter ? (
      selectedMeter.is_half_hour_meter && selectedChartType !== chartTypeTab.live
    ) : (
      selectedEnergyType === energyTypeTab.electricity
      && electricMeters.every(meter => meter.is_half_hour_meter || meter.hh_values_meter)
      && selectedChartType !== chartTypeTab.live
    );

    if (selectedPeriod === CUSTOM_PERIOD) {
      const { from, to } = this.controlPanelRef.customPeriodRange;
      return {
        from: from.format(),
        to: to.format(),
      };
    }

    const isoPeriod = selectedPeriod === PERIOD.week ? 'isoWeek' : selectedPeriod;
    let startTime = moment();

    if (selectedDay) {
      startTime = moment(selectedDay);

      if (periodsOffset > 0) {
        periodsOffset = startTime.clone().startOf(isoPeriod).diff(
          startTime.clone().subtract(periodsOffset, previousSelectedPeriod).startOf(isoPeriod),
          'days',
        );
      }
    }

    const hhMeterOffset = selectedPeriod === PERIOD.day ? isHalfHourMeter : 0;
    const fromOffset = selectedShowedPeriodsCount + periodsOffset;
    const from = startTime.clone().subtract(fromOffset + hhMeterOffset - 1, selectedPeriod).startOf(isoPeriod).format();
    const to = startTime.clone().subtract(periodsOffset + hhMeterOffset, selectedPeriod).endOf(isoPeriod).format();

    return { from, to };
  };

  getChartLabelFormat = () => {
    const { selectedPeriod, selectedShowedPeriodsCount, selectedChartType } = this.state;
    const { config } = this.props;
    const timeResolution = this.getTimeResolutionByPeriod(selectedPeriod, selectedChartType, config.maximalTimeResolution);
    const currentFormatOption = timeFormatOptions[timeResolution] || {};
    return {
      label: currentFormatOption[selectedShowedPeriodsCount === 1 ? 'one' : 'several'],
      tooltipLabel: currentFormatOption.several,
    };
  }

  /**
   * Returns empty data if it not yet ready to prevent extra chart rendering with a lot of points
   * @returns {Object}
   */
  getActualUsage = () => {
    const { dataUsage, config } = this.props;
    const { selectedChartType } = this.state;

    if (!this.mounted) {
      const instantInitialState = config.showInstantData ? { [config.instantDataStateKey]: {} } : {};
      return {
        ...instantInitialState,
        schoolTotal: null,
        totalByMeters: {},
        historicalData: [],
      };
    }
    return {
      ...dataUsage,
      schoolTotal: selectedChartType === chartTypeTab.live ? dataUsage.schoolLiveConsumption : dataUsage.schoolTotal,
    };
  };

  getDailyStandingChargeCost = () => {
    const { currentTariffs } = this.props;
    const { selectedMeterIndex } = this.state;
    if (isEmpty(currentTariffs) || selectedMeterIndex !== meterIndexForSchoolTotal) return null; // need to discuss it
    return currentTariffs[0].daily_fixed_cost;
  }

  getUnitLabel = (chartType, unit) => {
    const { resource } = this.props;
    if (unit === UNIT.unknown && resource) {
      return resource.unit_label;
    }
    return UNIT_TO_LABEL_MAP[unit];
  };

  getUnit = (chartType) => {
    const { config, resource } = this.props;
    if (resource) {
      // return resource.unit;
      // todo: why resource is not a resource but resource.energy_meter part?!!!!
      if (Object.values(UNIT).includes(resource.unit_label)) {
        return resource.unit_label;
      }
      return UNIT.unknown;
    }
    return chartTypeToUnitMap[config.name][chartType];
  };

  // need it as backend takes time offset from 'from' parameter
  getDataTimeUTCOffset = () => {
    const { from } = this.dateRange;
    if (isNil(from)) return null;
    return moment(from).utcOffset();
  }

  meterByMeterTabIndex = (meterIndex, energyType) => {
    const { meters, config } = this.props;
    if (config.showTypeTabs) {
      return meters.filter(meter => meterTypesPerEnergyTypeTab[energyType].includes(meter.type))[meterIndex - 1];
    }
    return meters[meterIndex - 1];
  };

  handleGraphBarClick = (data) => {
    const { selectedPeriod, selectedShowedPeriodsCount } = this.state;
    this.updateState({
      selectedPeriod: PERIOD.day,
      previousSelectedPeriod: selectedPeriod,
      selectedShowedPeriodsCount: 1,
      previousSelectedShowedPeriodsCount: selectedShowedPeriodsCount,
      showBackButton: true,
      selectedDay: data.time,
    });
  };

  handleBackButtonClick = () => {
    const { previousSelectedPeriod, previousSelectedShowedPeriodsCount } = this.state;
    this.updateState({
      showBackButton: false,
      selectedDay: null,
      selectedPeriod: previousSelectedPeriod,
      selectedShowedPeriodsCount: previousSelectedShowedPeriodsCount,
      previousSelectedPeriod: null,
    });
  };

  /**
   * requestUpdateHistoricalData calls actions for usage data. Use it as single point to get new data
   */
  requestUpdateHistoricalData = () => {
    const {
      actions,
      school: { uid: schoolUid },
      config: {
        maximalTimeResolution,
        name: chartName,
        getHistoricalByLocation,
        getHistoricalTotalByLocation,
      },
      resource,
    } = this.props;
    const {
      selectedEnergyType, selectedMeterIndex, selectedChartType, selectedComparisonPeriodOffset, selectedPeriod, showAlwaysOn,
    } = this.state;

    const unit = this.getUnit(selectedChartType);
    const selectedTimeResolution = this.getTimeResolutionByPeriod(
      selectedPeriod,
      selectedChartType,
      maximalTimeResolution,
    );

    this.timeResolution = selectedTimeResolution;

    const dateRange = this.getHistoryDateRange(0);
    const { from: compareFrom, to: compareTo } = selectedComparisonPeriodOffset.key !== COMPARISON.disabled
      ? this.getHistoryDateRange(selectedComparisonPeriodOffset.value)
      : { from: null, to: null };

    this.dateRange = { ...dateRange, ...{ compareFrom, compareTo } };
    const comparisonDateRange = selectedComparisonPeriodOffset.key !== COMPARISON.disabled
    // need setDateRangeUTCOffset for comparisonDateRange in order to backend set correctly time offsets (set 'comparison_from' and 'comparison_to' ofssets to 'from' offset)
      ? this.setDateRangeUTCOffset({ from: compareFrom, to: compareTo })
      : { from: null, to: null };

    if (selectedChartType === chartTypeTab.live) {
      this.requestLiveUsage(unit);
    } else if (getHistoricalTotalByLocation) {
      this.requestHistoricalTotal(unit);
    }

    if (selectedChartType === chartTypeTab.cost) {
      actions.getCurrentEnergyTariffs(
        meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
        schoolUid,
        this.dateRange.from,
        this.dateRange.to,
      );
      if (selectedMeterIndex === meterIndexForSchoolTotal) {
        if (selectedEnergyType === energyTypeTab.electricity) {
          actions.getLiveConsumptionByLocation(
            chartName,
            schoolUid,
            meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
            UNIT.kilowatt,
          );
          actions.getAlwaysOnUsage( // get today always-on. If planning to show always-on on COST tab then need separate call(and separate store prop)
            chartName,
            schoolUid,
            meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
          );
        } else if (selectedEnergyType === energyTypeTab.gas) {
          actions.getLiveConsumptionByLocation(
            chartName,
            schoolUid,
            meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
            UNIT.kilowatt,
          );
        }
      }
    }

    const { from, to } = dateRange;

    if (selectedMeterIndex === meterIndexForSchoolTotal && !resource) {
      if (getHistoricalByLocation) {
        actions.getHistoricalConsumptionByLocation(
          chartName,
          schoolUid,
          meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
          from,
          to,
          unit,
          selectedTimeResolution,
          comparisonDateRange.from,
          comparisonDateRange.to,
        );
      }
      if (showAlwaysOn && this.showAlwaysOnToggle()) {
        actions.getAlwaysOnUsage(
          chartName,
          schoolUid,
          meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
          from,
          to,
        );
      }
    } else {
      const meter = selectedMeterIndex ? this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType) : {};
      const selectedMeterId = meter.live_values_meter && selectedChartType === chartTypeTab.live ? (
        meter.live_values_meter
      ) : meter.id;
      const meterId = resource ? resource.id : selectedMeterId;
      actions.getHistoricalConsumptionForMeter(
        chartName,
        meterId,
        from,
        to,
        unit,
        selectedTimeResolution,
        comparisonDateRange.from,
        comparisonDateRange.to,
      );
      if (showAlwaysOn && selectedChartType === chartTypeTab.usage) {
        actions.getAlwaysOnUsage(
          chartName,
          null,
          null,
          from,
          to,
          meterId,
        );
      }
    }
  };

  /**
   * prepareHistoryData appends to meter data its usage, location name, and total usage
   * @param locations list of all school locations
   * @param meters list if school meters
   * @param chartData all data about school historical usage
   * @param totalByMeter {number} total value of each meter
   * @returns {Array} school meters with historical usage and location name
   */
  prepareHistoryData = (locations, meters, chartData, totalByMeter) => (
    meters.map((meter) => {
      const meterLocation = locations.find(location => meter.sub_location === location.id);
      const { id } = meter;
      return {
        ...meter,
        locationName: meterLocation && meterLocation.name,
        historical: chartData && id === chartData.meterId ? chartData.data : [],
        total: totalByMeter[id],
      };
    })
  );

  handleSelectedEnergyTypeChanged = (event, value) => {
    this.updateState({
      selectedEnergyType: value,
      selectedMeterIndex: meterIndexForSchoolTotal, // after tab changed, selected meter idx goes to summary
    });
  };

  handleSelectedChartTypeChanged = (event, value) => {
    const newState = { selectedChartType: value };
    const { selectedComparisonPeriodOffset: { key: comparisonKey } } = this.state;
    if (!COMMON_COMPARISONS.includes(comparisonKey)) {
      newState.selectedComparisonPeriodOffset = { ...COMPARISON_DEFAULT_STATE };
    }
    this.updateState(newState);
  };

  handleMeterChanged = (event, selectedMeterIndex) => {
    const { selectedEnergyType } = this.state;
    const selectedMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);
    if (selectedMeter && selectedMeter.type === METER_TYPE.solar) {
      const selectedChartType = chartTypeTab.usage;
      this.updateState({ selectedMeterIndex, selectedChartType });
    } else {
      this.updateState({ selectedMeterIndex });
    }
  };

  // need it for the backend to set correctly time offsets(for historical data)
  setDateRangeUTCOffset = (dateRange) => {
    const dataTimeUTCOffset = this.getDataTimeUTCOffset();
    if (isNil(dataTimeUTCOffset)) return dateRange;
    return mapValues(
      dateRange,
      value => (!isNil(value) ? moment(value).clone().utcOffset(dataTimeUTCOffset, true).format() : value), // important: passing true will keep the same local time, but at the expense of choosing a different point in Universal Time.
    );
  }

  /**
   * Update state and request new data for charts
   * @param newState {Object}
   */
  updateState = (newState) => {
    this.setState(newState, () => {
      this.requestUpdateHistoricalData();
    });
  };

  showAlwaysOnToggle = () => {
    const { config } = this.props;
    const { selectedEnergyType, selectedChartType, selectedPeriod } = this.state;
    return (
      config.showAlwaysOn
      && selectedEnergyType === energyTypeTab.electricity
      && selectedChartType === chartTypeTab.usage
      && selectedPeriod === PERIOD.day
    );
  };

  requestDataExport = (from, to) => {
    const { config: { dataExportAvailable, name } } = this.props;
    if (!dataExportAvailable) return;
    if (name === USAGE_STATISTIC_CHART_NAME.energy) {
      const { actions, school } = this.props;
      const { selectedEnergyType, selectedChartType, selectedMeterIndex } = this.state;
      const unit = selectedChartType === chartTypeTab.live ? UNIT.kilowattHour : chartTypeToUnitMap[name][selectedChartType];

      const energyMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);
      const paramsObject = {
        from: from.format(),
        to: to.format(),
        timeResolution: this.controlPanelRef.customPeriodTimeResolution,
        meterType: meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
        unit,
        locationUid: school.uid,
      };
      if (energyMeter) {
        paramsObject.resourceId = energyMeter.id;
      }

      actions.downloadExportHistoricalDataFile(paramsObject);
    }
  }

  requestMetersList = () => {
    const {
      actions, config: { name }, school: { uid: schoolUid },
    } = this.props;
    switch (name) {
      case USAGE_STATISTIC_CHART_NAME.energy:
        return actions.getEnergyResourcesList({ location_uid: schoolUid });
      case USAGE_STATISTIC_CHART_NAME.temperature:
        return actions.getSmartThingsSensorsList({
          location_uid: schoolUid,
          capability: SMART_THINGS_SENSOR_CAPABILITY.temperature,
        });
      default:
        return Promise.resolve([]);
    }
  }

  requestLiveUsage(unit) {
    const {
      actions,
      config: { name: chartName, getLiveByLocation, showInstantData },
      resource,
      school: { uid: schoolUid },
    } = this.props;
    const { selectedEnergyType } = this.state;
    if (getLiveByLocation) {
      actions.getLiveConsumptionByLocation(
        chartName,
        schoolUid,
        meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
        unit,
      );
    }

    if (showInstantData && resource) {
      actions.getLiveConsumptionForMeter(
        chartName,
        resource.id,
        unit,
      );
      return;
    }

    this.requestMetersList()
      .then((meters) => {
        this.getMetersToQueryForData(meters)
          .forEach((meter) => {
            actions.getLiveConsumptionForMeter(
              chartName,
              meter.id,
              unit,
            );
          });
      });
  }

  requestHistoricalTotal(unit) {
    const {
      actions, config: { name: chartName }, school: { uid: schoolUid },
    } = this.props;
    const { selectedEnergyType } = this.state;
    const { from, to } = this.dateRange;
    actions.getTotalHistoricalConsumptionByLocation(
      chartName,
      schoolUid,
      meterTypeForTotalPerEnergyTypeTab[selectedEnergyType],
      from,
      to,
      unit,
    );
    this.requestMetersList()
      .then((meters) => {
        this.getMetersToQueryForData(meters)
          .forEach((meter) => {
            actions.getTotalHistoricalConsumptionForMeter(
              chartName,
              meter.id,
              from,
              to,
              unit,
            );
          });
      });
  }

  /**
   * Renders left panel for cost reduction advice
   * @returns JSX markup
   */
  renderAdvicePanel = (percentageReduceValue = 50) => {
    const { config } = this.props;
    const { selectedChartType, selectedMeterIndex } = this.state;
    if (!config.showAdvicePanel || selectedChartType !== chartTypeTab.cost || selectedMeterIndex !== meterIndexForSchoolTotal) return null;
    const {
      classes, currentTariffs, dataUsage, width, alwaysOnValue,
    } = this.props;

    const { selectedEnergyType } = this.state;

    const { schoolLiveConsumption } = dataUsage;

    if (![energyTypeTab.electricity, energyTypeTab.gas].includes(selectedEnergyType) || !schoolLiveConsumption || isEmpty(currentTariffs)) {
      return null; // if data is empty or we are not on cost tab render nothing
    }

    let difference;
    const yearlyUsage = schoolLiveConsumption * 24 * 365;
    if (selectedEnergyType === energyTypeTab.electricity) {
      const { value: costSavingValue } = calcYearlyEnergySavingCostByTodayAlwaysOn(
        percentageReduceValue,
        { value: alwaysOnValue * 1000 }, // 1000 = kWh to Wh
        currentTariffs,
      );
      if (!costSavingValue) return null;
      difference = costSavingValue;
    } else if (selectedEnergyType === energyTypeTab.gas) {
      const wattHourCosts = currentTariffs.map(item => item.watt_hour_cost);
      const minWattHourCost = Math.min(...wattHourCosts);
      difference = minWattHourCost * yearlyUsage * 1000 * percentageReduceValue / 100; // * 1000 = kWh to Wh
    } else {
      return null;
    }

    return (
      <Grid
        item
        xs={12}
        lg={1}
        container
        className={classes.costAdvicePanelRoot}
      >
        <EnergyCostAdvice
          saving={difference}
          shiftPercent={percentageReduceValue}
          yearUsage={yearlyUsage}
          energyType={selectedEnergyType}
          largeScreenMode={isWidthUp('lg', width)}
        />
      </Grid>
    );
  };

  /**
   * Renders charts on page
   * @param chartData data for charts
   * @returns JSX markup
   */
  renderCharts = (chartData, unit, onBarClick) => {
    const {
      config, alwaysOnValue, currentTariffs, classes, dataUsage,
    } = this.props;
    const {
      selectedEnergyType, selectedChartType, selectedPeriod, selectedComparisonPeriodOffset,
      showAlwaysOn, selectedMeterIndex,
    } = this.state;

    const { label: labelFormat, tooltipLabel: tooltipLabelFormat } = this.getChartLabelFormat();
    const { isHistoricalDataFiltered } = dataUsage;
    const unitLabel = this.getUnitLabel(selectedChartType, unit);

    let GraphComponent;
    let useDateRangeTooltipLabelFormatter = false;
    if (selectedChartType === chartTypeTab.live) {
      GraphComponent = ConsumptionLineChart;
    } else {
      GraphComponent = ConsumptionBarsChart;
      useDateRangeTooltipLabelFormatter = (selectedPeriod === PERIOD.day) || (selectedPeriod === CUSTOM_PERIOD && this.controlPanelRef.customPeriodTimeResolution === TIME_RESOLUTION.hour);
    }

    const currentTooltipDateFormatter = useDateRangeTooltipLabelFormatter ? hourlyRangeTooltipDateFormatter : tooltipDateFormatter;

    const dataTimeUTCOffset = this.getDataTimeUTCOffset();

    const selectedMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);
    const tariffsToDisplay = selectedMeterIndex === meterIndexForSchoolTotal ? currentTariffs : (
      currentTariffs.filter(tariff => tariff.resource_id === selectedMeter.id)
    );

    return (
      chartData && chartData.length !== 0 ? ( // only render if we have some data
        <React.Fragment>
          {/* render electricity cost panel if energy type is ELECTRICITY */}
          {
            selectedEnergyType === energyTypeTab.electricity && config.showCostTimePanel
            && selectedChartType === chartTypeTab.cost && !isEmpty(currentTariffs)
            && (
              <CostTimePanel currentTariffs={tariffsToDisplay} />
            )
          }
          { isHistoricalDataFiltered && (
            <Grid container alignItems="center" justify="center">
              <Typography className={classes.isHistoricalDataFilteredMessage}>
                Data in this graph is filtered. Please, download CSV file to get full dataset
              </Typography>
            </Grid>
          )}
          <GraphComponent
            data={chartData}
            unitLabel={unitLabel}
            showAlwaysOn={showAlwaysOn && selectedChartType === chartTypeTab.usage && selectedPeriod === PERIOD.day}
            alwaysOnValue={this.timeResolution === TIME_RESOLUTION.hour ? alwaysOnValue : null}
            isComparison={selectedComparisonPeriodOffset.key !== COMPARISON.disabled}
            labelFormat={labelFormat} // only format label for day PERIOD
            tooltipLabelFormat={tooltipLabelFormat}
            highlight={config.highlight}
            onBarClick={onBarClick}
            connectNulls={config.connectNulls}
            tooltipDateFormatter={currentTooltipDateFormatter(selectedComparisonPeriodOffset.value, selectedPeriod, dataTimeUTCOffset)}
            xAxisTickFormatter={utcToLocalTimeFormatter(labelFormat, dataTimeUTCOffset)}
            highlightTickValueGetter={timeStr => getLocalTimeFromUTC(timeStr, dataTimeUTCOffset)}
          />
          {this.renderNoTariffsMessage()}
        </React.Fragment>
      ) : (
        <Grid item style={{ height: 350 }}>
          <NoItems imageWidth={200} paddingTop={0} />
        </Grid>
      )
    );
  };

  renderNoTariffsMessage = () => {
    const { classes, config, currentTariffs } = this.props;
    const { selectedChartType, selectedEnergyType, selectedMeterIndex } = this.state;
    if (!config.showCostTab || selectedChartType !== chartTypeTab.cost) return null;
    let details = `for ${selectedEnergyType} type`;
    if (!isEmpty(currentTariffs)) {
      if (!selectedMeterIndex) return null;
      const selectedMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);
      if (
        currentTariffs.some(tariff => selectedMeter.id === tariff.resource_id)
        || (!isNil(selectedMeter.provider_account) && currentTariffs.some(tariff => selectedMeter.provider_account === tariff.provider_account_id))
      ) return null;
      details = `for ${selectedMeter.name}`;
    }

    return (
      <Grid container justify="center" className={classes.noTariffsMessageContainer}>
        <Paper elevation={2} classes={{ root: classes.noTariffsMessageBlock }}>
          <Typography component="div" className={classes.noTariffsMessageText}>
            There is no tariff info {details}.
            <br />
            <br />
            Please send your tariff info for cost chart
          </Typography>
        </Paper>
      </Grid>
    );
  }

  render() {
    if (!this.mounted) return null;
    const {
      classes, school, meters, locations, config, resource,
    } = this.props;

    const {
      selectedEnergyType, selectedMeterIndex, selectedChartType,
      selectedPeriod, selectedShowedPeriodsCount, selectedComparisonPeriodOffset, showBackButton, showAlwaysOn,
    } = this.state;

    const actualUsage = this.getActualUsage();

    const unit = this.getUnit(selectedChartType);

    const chartData = actualUsage.historicalData;

    let selectedMeter;
    let metersUsageByType;
    let total; // can be energy or money
    let instantData;

    if (config.showTypeTabs || config.showUsageTabs || config.showTotalUsage) {
      selectedMeter = this.meterByMeterTabIndex(selectedMeterIndex, selectedEnergyType);

      const metersWithData = this.prepareHistoryData(locations, meters, actualUsage.historicalData, actualUsage.totalByMeters); // append to meters its usage

      metersUsageByType = config.showTypeTabs
        ? Object.values(energyTypeTab).reduce((res, type) => {
          res[type] = metersWithData.filter(meter => meterTypesPerEnergyTypeTab[type].includes(meter.type));
          return res;
        }, {})// sort all meters by energy type
        : metersWithData;

      if (selectedMeterIndex === 0) {
        total = actualUsage.schoolTotal;
      } else {
        total = config.showTypeTabs
          ? metersUsageByType[selectedEnergyType][selectedMeterIndex - 1].total
          : metersUsageByType[selectedMeterIndex - 1].total; // build chart by meter usage
      }
    }

    if (config.showInstantData && resource) {
      const instantDataStateKey = config.instantDataStateKey;
      instantData = actualUsage[instantDataStateKey][resource.id];
    }

    const costAdvicePanel = this.renderAdvicePanel();
    const onChartBarClick = [PERIOD.week, PERIOD.month].includes(selectedPeriod)
      ? this.handleGraphBarClick
      : () => {};

    const electricMeters = meters.filter(meter => meter.type === METER_TYPE.electricity);
    const isHalfHourMeter = selectedMeter ? (
      selectedMeter.is_half_hour_meter
    ) : (
      selectedEnergyType === energyTypeTab.electricity
        && electricMeters.every(meter => meter.is_half_hour_meter || meter.hh_values_meter)
    );
    const isHalfHourOnlyMeter = selectedMeter ? (
      selectedMeter.is_half_hour_meter && !selectedMeter.live_values_meter
    ) : (
      selectedEnergyType === energyTypeTab.electricity
        && electricMeters.every(meter => meter.is_half_hour_meter)
    );

    return (
      <div style={{ width: '100%', backgroundColor: 'white', overflow: 'hidden' }}>
        {config.showTypeTabs
        && (
        <Paper className={classes.root}>
          <Tabs
            classes={{ flexContainer: classes.energyTypeTabsFlexContainer }}
            value={selectedEnergyType}
            onChange={this.handleSelectedEnergyTypeChanged}
            indicatorColor="primary"
            textColor="primary"
            scrollButtons="on"
            variant="scrollable"
          >
            {
              Object.values(energyTypeTab).map((type) => {
                const metersCountByType = metersUsageByType[type].length;
                return (metersCountByType || energyTypeTabAlwaysVisibility[type])
                  ? (
                    <Tab
                      key={type}
                      disabled={showBackButton}
                      classes={{ root: classes.tabRoot }}
                      label={<span>{type} ({metersCountByType})</span>}
                      value={type}
                    />
                  )
                  : null;
              })
            }
          </Tabs>
        </Paper>
        )
        }
        <Grid container alignItems="center" justify="center">
          <Grid item container justify="center" xs={12} style={{ backgroundColor: '#efefef' }}>
            {(config.showAdminHeader && school.name)
              && (
                <Grid item xs={12} sm={10} container style={{ padding: '24px 0px' }}>
                  <SLEAdminHeader
                    title={school.name}
                    onRefreshClick={this.requestUpdateHistoricalData}
                    schoolID={school.uid}
                  />
                </Grid>
              )
            }
          </Grid>
          {config.showUsageTabs && (
            <Grid xs={12} item>
              <UsageTabs
                type={config.showTypeTabs ? selectedEnergyType : config.name}
                unit={unit}
                summaryUsage={actualUsage.schoolTotal}
                selectedMeterIdx={selectedMeterIndex}
                metersUsage={config.showTypeTabs ? metersUsageByType[selectedEnergyType] : metersUsageByType}
                onMeterChange={this.handleMeterChanged}
                placesAfterDot={config.placesAfterDot}
                summaryLabel={config.summaryLabel}
              />
            </Grid>
          )}
          <Grid
            item
            xs={12}
            container
            direction="row"
            style={{ paddingBottom: 20 }}
          >
            <Grid item xs={false} md={1} />
            <Grid item xs={12} md={10} container direction="column" className={classes.graphContainer}>
              <Grid item container>
                <Tabs
                  variant="fullWidth"
                  name="selectedChartType"
                  value={isHalfHourOnlyMeter
                    && selectedChartType === chartTypeTab.live ? chartTypeTab.usage : selectedChartType}
                  onChange={this.handleSelectedChartTypeChanged}
                  indicatorColor="primary"
                  textColor="primary"
                  centered
                  classes={{
                    root: classes.usageCostTabsRoot,
                    flexContainer: classes.usageCostTabsFlexContainer,
                  }}
                >
                  {!isHalfHourOnlyMeter && (
                    <Tab
                      disabled={showBackButton}
                      classes={{
                        root: classes.usageCostTabRoot,
                        selected: classes.usageCostTabSelected,
                      }}
                      className={classNames(classes.tabRoot, classes.usageCostTab)}
                      label={<span>LIVE</span>}
                      value={chartTypeTab.live}
                    />
                  )}
                  <Tab
                    classes={{
                      root: classes.usageCostTabRoot,
                      selected: classes.usageCostTabSelected,
                    }}
                    className={classNames(classes.tabRoot, classes.usageCostTab)}
                    label={<span>{config.historyLabel}</span>}
                    value={chartTypeTab.usage}
                  />
                  {config.showCostTab
                  && (
                  <Tab
                    disabled={(selectedMeter && selectedMeter.type === METER_TYPE.solar) || showBackButton}
                    classes={{
                      root: classes.usageCostTabRoot,
                      selected: classes.usageCostTabSelected,
                    }}
                    className={classNames(classes.tabRoot, classes.usageCostTab)}
                    label={<span>COST</span>}
                    value={chartTypeTab.cost}
                  />
                  )
                  }
                </Tabs>
              </Grid>
              <Grid item container>
                {(costAdvicePanel)}
                <Grid item xs={12} lg={costAdvicePanel ? 11 : 12} style={{ position: 'relative' }}>
                  {showBackButton ? (
                    <Button
                      variant="contained"
                      onClick={this.handleBackButtonClick}
                      style={{ margin: 8, marginLeft: 40 }}
                    >
                      <ArrowBack style={{ marginRight: 8 }} />
                      GO BACK
                    </Button>
                  ) : (
                    <ChartHeader
                      onRef={(elem) => { this.controlPanelRef = elem; }}
                      unitLabel={this.getUnitLabel(selectedChartType, unit)}
                      totalCost={total}
                      totalUsage={total}
                      showTotalUsage={config.showTotalUsage && selectedChartType === chartTypeTab.usage}
                      showInstantData={config.showInstantData && selectedChartType === chartTypeTab.live}
                      instantData={instantData}
                      showTotalCost={selectedChartType === chartTypeTab.cost}
                      dailyStandingChargeCost={this.getDailyStandingChargeCost()}
                      showPeriod={selectedChartType !== chartTypeTab.live}
                      selectedPeriod={selectedPeriod}
                      selectedShowedPeriodsCount={selectedShowedPeriodsCount}
                      selectedComparisonPeriodOffset={selectedComparisonPeriodOffset}
                      showOnlyCommonComparisons={selectedChartType === chartTypeTab.live}
                      config={config}
                      alwaysOnEnabled={showAlwaysOn}
                      showAlwaysOnToggle={this.showAlwaysOnToggle()}
                      onChange={this.updateState}
                      school={school}
                      showDataExportButton={config.dataExportAvailable}
                      onDataExport={this.requestDataExport}
                      currentDateRange={this.dateRange}
                      isHalfHourMeter={isHalfHourMeter}
                      selectedChartType={selectedChartType}
                    />
                  )}
                  {this.renderCharts(chartData, unit, onChartBarClick)}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={false} md={1} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

UsageStatistic.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  meters: PropTypes.array.isRequired,
  locations: PropTypes.array.isRequired,
  school: PropTypes.object.isRequired,
  dataUsage: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  alwaysOnValue: PropTypes.number.isRequired,
  currentTariffs: PropTypes.array,
  resource: PropTypes.object,
  locationData: PropTypes.object, // don't use "location" as we have such router prop
  callsCount: PropTypes.number.isRequired,
};

UsageStatistic.defaultProps = {
  currentTariffs: [],
  resource: null,
  locationData: null,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...usageStatisticActions,
      getCurrentEnergyTariffs,
      getAllSchools,
      getSchoolInformation,
      getOpenSchoolInformation,
      getEnergyResourcesList,
      getSmartThingsSensorsList,
      downloadExportHistoricalDataFile,
    }, dispatch),
  };
}

function mapStateToProps(state, ownProps) {
  const config = ownProps.config;
  return {
    user: state.users.currentUser,
    school: state.schools.activeSchool,
    dataUsage: state[config.stateKey],
    alwaysOnValue: state.energyUsage.alwaysOnValue,
    meters: state[config.metersStateKey].data,
    locations: state.schools.allLocations.data,
    currentTariffs: state.energyUsage.currentTariffs,
    callsCount: state.callsCounter,
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withWidth(),
)(UsageStatistic);
