import React, { PureComponent } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import moment from 'moment';

import { isNil, hasIn as hasProperty, isEqual } from 'lodash';

import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Hidden from '@material-ui/core/Hidden';
import Button from '@material-ui/core/Button';

import SaveAltIcon from '@material-ui/icons/SaveAlt';

import DateTimeRangeSelect from '../DateTimeRangeSelect/DateTimeRangeSelect';

import SelectTimeResolutionDialog from '../dialogs/SelectTimeResolutionDialog';

import {
  DATE_RANGE_VALIDATOR, DATE_RANGE_VALIDATOR_TYPE, LIMITS_DISPLAY_MODE, DATE_RANGE_PICKER_VARIANT,
} from '../DateTimeRangeSelect/constants';

import {
  COMMON_COMPARISONS,
  COMMON_COMPARISON_OPTIONS,
  COMPARISON_OPTION,
  COMPARISON_DEFAULT_STATE,
  PERIOD,
  PERIODS,
  CUSTOM_PERIOD,
  CUSTOM_PERIOD_LABEL,
  CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS,
  CUSTOM_COMPARISON,
  CUSTOM_COMPARISONS,
  CUSTOM_COMPARISON_OPTION,
  PERIOD_PREDEFINED_COMPARISON_OPTIONS,
  TIME_RESOLUTION_BY_CUSTOM_PERIOD_DURATION_DETERMINE_RULES,
  PERIOD_CUSTOM_COMPARISON_OPTION,
} from './constants';

import { TIME_RESOLUTION } from '../../constants/config';

import { isValidDate } from './utils';

import roundToNPlaces from '../../utils/roundToNPlaces';

const styles = theme => ({
  root: {
    padding: 16,
  },
  date: {
    fontSize: 18,
    fontWeight: 500,
    color: '#555',
    lineHeight: 1.67,
    margin: 'auto',
  },
  totalsContainer: {
    paddingLeft: 60,
    [theme.breakpoints.only('sm')]: {
      paddingLeft: 40,
    },
    [theme.breakpoints.only('xs')]: {
      paddingLeft: 15,
    },
  },
  periodTab: {
    minWidth: 90,
    [theme.breakpoints.only('sm')]: {
      minWidth: 120,
    },
    [theme.breakpoints.only('xs')]: {
      minWidth: 60,
    },
  },
  selectWrapper: {
    marginRight: 30,
    width: 150,
    [theme.breakpoints.down('xs')]: {
      marginRight: 16,
    },
  },
  selectUnderline: {
    '&:before': {
      borderBottom: '2px solid #00006b',
    },
    '&:after': {
      borderBottom: '2px solid #00006b',
    },
  },
  selectPeriodHelperRoot: {
    color: 'rgba(0, 0, 0, 0.87)',
  },
  value: {
    display: 'flex',
    fontSize: 30,
    fontWeight: 500,
    color: '#555',
    lineHeight: 1.26,
    [theme.breakpoints.only('xs')]: {
      fontSize: 21,
    },
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
    lineHeight: 2,
  },
  valueUnit: {
    position: 'relative',
    top: '12px',
    left: '3px',
    lineHeight: 2.25,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    [theme.breakpoints.only('xs')]: {
      top: 3,
    },
  },
  verticalDivider: {
    border: '1px solid #b5b5b5',
    height: 50,
    marginRight: 20,
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
  dataExportButton: {
    color: 'rgb(0, 188, 212)',
  },
  dataExportIcon: {
    color: 'inherit',
    marginRight: 4,
    width: 16,
  },
});

const periodToTabs = {
  day: ['TODAY', '2 DAYS', '3 DAYS', '4 DAYS'],
  week: ['THIS WEEK', '2 WEEKS', '3 WEEKS', '4 WEEKS'],
  month: ['THIS MONTH', '2 MONTHS', '3 MONTHS', '4 MONTHS'],
  year: ['THIS YEAR', '2 YEARS', '3 YEARS', '4 YEARS'],
};

const CUSTOM_SELECT_DIALOG = Object.freeze({
  periodSelect: 'periodSelect',
  timeResolutionSelect: 'timeResolutionSelect',
});

const CUSTOM_PERIOD_SELECT_KEY = Object.freeze({
  consumption: 'consumption',
  exportData: 'exportData',
  comparison: 'comparison',
});

const CUSTOM_PERIOD_SELECT_KEY_EXTRA_VALIDATORS = Object.freeze({
  [CUSTOM_PERIOD_SELECT_KEY.consumption]: [],
  [CUSTOM_PERIOD_SELECT_KEY.exportData]: [
    DATE_RANGE_VALIDATOR[DATE_RANGE_VALIDATOR_TYPE.deltaYearPeriod](),
  ],
  [CUSTOM_PERIOD_SELECT_KEY.comparison]: [],
});

const CUSTOM_PERIOD_SELECT_KEY_COMPONENT_PROPS = Object.freeze({
  [CUSTOM_PERIOD_SELECT_KEY.consumption]: {},
  [CUSTOM_PERIOD_SELECT_KEY.exportData]: {},
  [CUSTOM_PERIOD_SELECT_KEY.comparison]: {
    limitsDisplayMode: LIMITS_DISPLAY_MODE.single,
    pickerComponentVariant: DATE_RANGE_PICKER_VARIANT.date,
  },
});

const CUSTOM_PERIOD_SELECT_KEY_PICKER_PROPS = Object.freeze({
  [CUSTOM_PERIOD_SELECT_KEY.consumption]: () => {},
  [CUSTOM_PERIOD_SELECT_KEY.exportData]: () => {},
  [CUSTOM_PERIOD_SELECT_KEY.comparison]: (config) => {
    const { customComparisonKey } = config;
    switch (customComparisonKey) {
      case CUSTOM_COMPARISON.selectMonth: {
        return {
          format: 'YYYY/MM',
          views: ['year', 'month'],
          label: 'Month',
        };
      }
      case CUSTOM_COMPARISON.selectDay:
      default: {
        return {
          format: 'YYYY/MM/DD',
          views: ['year', 'month', 'date'],
          label: 'Date',
        };
      }
    }
  },
});

const TIME_RESOLUTION_SELECT_KEY = Object.freeze({
  consumption: 'consumption',
  exportData: 'exportData',
});

const TIME_RESOLUTION_SELECT_KEY_DIALOG_CONFIG = Object.freeze({
  [TIME_RESOLUTION_SELECT_KEY.consumption]: {
    title: 'Historical data time resolution',
  },
  [TIME_RESOLUTION_SELECT_KEY.exportData]: {
    title: 'Exported data time resolution',
  },
});

const CUSTOM_SELECT_DIALOG_DEFAULT_STATE = Object.freeze({
  [CUSTOM_SELECT_DIALOG.periodSelect]: {
    key: CUSTOM_PERIOD_SELECT_KEY.consumption,
    isOpened: false,
  },
  [CUSTOM_SELECT_DIALOG.timeResolutionSelect]: {
    key: TIME_RESOLUTION_SELECT_KEY.consumption,
    isOpened: false,
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
    minutesStep: 60,
    maxDateMessage: 'Date should not be from the future',
    strictCompareDates: true,
    hideTabs: true,
    views: ['year', 'month', 'date', 'hours'],
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
/* eslint-disable react/destructuring-assignment */
class ChartHeader extends PureComponent {
  static formatDate(date, format = PERIOD_LIMIT_DISPLAY_FORMAT, errorText = '?') {
    if (!isValidDate(date)) return errorText;
    return moment(date).format(format);
  }

  state = {
    ...CUSTOM_SELECT_DIALOG_DEFAULT_STATE,
  };

  customPeriodRange = {
    from: null,
    to: null,
  };

  dateTimeRangeSelectRef = null;

  customPeriodTimeResolution = TIME_RESOLUTION.day;

  customComparisonOffset = {
    key: null,
    value: null,
  };

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  componentDidUpdate(prevProps) {
    const { currentDateRange } = this.props;
    if (!isEqual(prevProps.currentDateRange, currentDateRange)) {
      const { from, to } = currentDateRange;
      this.setDateRangePickerLimits(moment(from), moment(to));
    }
  }

  getTimeResolutionOptionsByCustomPeriod = (defaultOptions = CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.day) => {
    const { key } = this.state[CUSTOM_SELECT_DIALOG.periodSelect];
    switch (key) {
      case CUSTOM_PERIOD_SELECT_KEY.consumption: {
        const { from, to } = this.customPeriodRange;
        if (!isValidDate(from) || !isValidDate(to)) return defaultOptions;
        const duration = moment.duration(to.diff(from));

        for (let ruleIndex = 0; ruleIndex < TIME_RESOLUTION_BY_CUSTOM_PERIOD_DURATION_DETERMINE_RULES.length; ruleIndex += 1) {
          const currentRuleConfig = TIME_RESOLUTION_BY_CUSTOM_PERIOD_DURATION_DETERMINE_RULES[ruleIndex];
          const { getCountFromMomentObjFuncName, getResolutionByCountRulesConfigs } = currentRuleConfig;
          if (!hasProperty(duration, getCountFromMomentObjFuncName)) {
            console.error('Wrong "getCountFromMomentObjFuncName" func!'); // eslint-disable-line no-console
            return defaultOptions;
          }
          const countByUnit = duration[getCountFromMomentObjFuncName]();
          for (let ruleByCountIndex = 0; ruleByCountIndex < getResolutionByCountRulesConfigs.length; ruleByCountIndex += 1) {
            const currentRuleByCountConfig = getResolutionByCountRulesConfigs[ruleByCountIndex];
            const { checkingConditionRule, valueToReturnOnSuccess } = currentRuleByCountConfig;
            const conditionSucceed = checkingConditionRule(countByUnit);
            if (conditionSucceed) {
              return valueToReturnOnSuccess;
            }
          }
        }
        return defaultOptions;
      }
      case CUSTOM_PERIOD_SELECT_KEY.exportData: {
        return CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.halfHourHourDayMonth;
      }
      default:
        return defaultOptions;
    }
  }

  handleSelectedShowedPeriodsCountChanged = (event, value) => {
    const newState = { selectedShowedPeriodsCount: value };

    if (value !== 1) { // comparison works only for one period
      newState.selectedComparisonPeriodOffset = { ...COMPARISON_DEFAULT_STATE };
    }

    this.updateState(newState);
  };

  handleSelectedPeriodChanged = (event) => {
    const { target: { value } } = event;
    if (value === CUSTOM_PERIOD) {
      this.toggleDialog(CUSTOM_SELECT_DIALOG.periodSelect, { key: CUSTOM_PERIOD_SELECT_KEY.consumption });
      return;
    }
    const newState = { selectedPeriod: value };
    const { selectedComparisonPeriodOffset: { key } } = this.props;
    if (!COMMON_COMPARISONS.includes(key)) {
      newState.selectedComparisonPeriodOffset = { ...COMPARISON_DEFAULT_STATE };
    }
    this.updateState(newState);
  };

  handleSelectedComparisonPeriodOffsetChanged = (event) => {
    const offsetKey = event.target.value;
    if (CUSTOM_COMPARISONS.includes(offsetKey)) {
      this.customComparisonOffset.key = offsetKey;
      this.toggleDialog(CUSTOM_SELECT_DIALOG.periodSelect, { key: CUSTOM_PERIOD_SELECT_KEY.comparison });
      return;
    }
    const currentComparison = COMPARISON_OPTION[offsetKey];
    const value = !isNil(currentComparison) ? currentComparison.getValue() : COMPARISON_DEFAULT_STATE.value;
    this.updateState({
      selectedComparisonPeriodOffset: {
        key: offsetKey,
        value,
      },
    });
  };

  handleAlwaysOnSwitchChange = (event) => {
    this.updateState({ showAlwaysOn: event.target.checked });
  };

  onSelectDateTimeRange = (from, to) => {
    const currentDialog = CUSTOM_SELECT_DIALOG.periodSelect;
    this.toggleDialog(currentDialog)
      .then(() => {
        const { key } = this.state[currentDialog];
        switch (key) {
          case CUSTOM_PERIOD_SELECT_KEY.consumption: {
            this.customPeriodRange = { from, to };
            this.toggleDialog(CUSTOM_SELECT_DIALOG.timeResolutionSelect, { key: TIME_RESOLUTION_SELECT_KEY.consumption });
            break;
          }
          case CUSTOM_PERIOD_SELECT_KEY.exportData: {
            this.customPeriodRange = { from, to };
            this.toggleDialog(CUSTOM_SELECT_DIALOG.timeResolutionSelect, { key: TIME_RESOLUTION_SELECT_KEY.exportData });
            break;
          }
          case CUSTOM_PERIOD_SELECT_KEY.comparison: {
            const { key: offsetKey } = this.customComparisonOffset;
            const currentComparison = CUSTOM_COMPARISON_OPTION[offsetKey];
            const offsetValue = !isNil(currentComparison) ? currentComparison.getValue(from) : COMPARISON_DEFAULT_STATE.value;
            this.customComparisonOffset.value = offsetValue;
            this.updateState({
              selectedComparisonPeriodOffset: { ...this.customComparisonOffset },
            });
            break;
          }
          default:
            break;
        }
      });
  }

  onSelectTimeResolution = (timeResolution) => {
    const currentDialog = CUSTOM_SELECT_DIALOG.timeResolutionSelect;
    this.toggleDialog(currentDialog)
      .then(() => {
        const { key } = this.state[currentDialog];
        this.customPeriodTimeResolution = timeResolution || CUSTOM_PERIOD_PREDEFINED_SELECT_OPTIONS.day[0].value;
        switch (key) {
          case TIME_RESOLUTION_SELECT_KEY.consumption: {
            this.setCustomPeriod();
            break;
          }
          case TIME_RESOLUTION_SELECT_KEY.exportData: {
            const { onDataExport } = this.props;
            const { from, to } = this.customPeriodRange;
            onDataExport(from, to);
            break;
          }
          default:
            break;
        }
      });
  }

  setDateRangePickerLimits = (from, to) => {
    if (!isValidDate(from) || !isValidDate(to)) return;
    const dateRange = { from, to };
    const dateNow = moment();
    if (to > dateNow) {
      dateRange.to = dateNow.startOf('hour');
    }
    const { from: PickerPropsFrom } = this.dateTimeRangeSelectRef.props.pickerProps;
    if (PickerPropsFrom && PickerPropsFrom.minDate && from < PickerPropsFrom.minDate) {
      dateRange.from = PickerPropsFrom.minDate.clone();
    }
    this.dateTimeRangeSelectRef.updateState({ ...dateRange });
  }

  setCustomPeriod = () => {
    this.updateState({
      selectedPeriod: CUSTOM_PERIOD,
      selectedComparisonPeriodOffset: { ...COMPARISON_DEFAULT_STATE },
      selectedShowedPeriodsCount: 1,
    });
  }

  toggleDialog = (dialogName, newState) => new Promise((resolve) => {
    const dialogPrevState = { ...this.state[dialogName] };
    const { isOpened } = dialogPrevState;
    this.setState(
      {
        [dialogName]: { ...dialogPrevState, isOpened: !isOpened, ...newState },
      },
      () => { resolve(); },
    );
  });

  /**
   * The function returns state to the parent component
   * @param newState {Object}
   */
  updateState = (newState) => {
    const { onChange } = this.props;
    onChange(newState);
  };

  render() {
    const {
      classes, totalUsage, totalCost, unitLabel, showPeriod, showTotalCost, showTotalUsage,
      selectedShowedPeriodsCount, selectedPeriod, selectedComparisonPeriodOffset, config, alwaysOnEnabled,
      showInstantData, instantData, school, showDataExportButton, showOnlyCommonComparisons, currentDateRange,
      dailyStandingChargeCost, showAlwaysOnToggle, isHalfHourMeter, selectedChartType,
    } = this.props;

    const {
      placesAfterDot, totalLabel, showComparison, showCustomPeriod,
    } = config;

    if (!showPeriod && selectedPeriod !== PERIOD.day) {
      this.updateState({ selectedPeriod: PERIOD.day });
    }

    const schoolCreatedAt = !isNil(school) ? moment(school.created_at) : moment().subtract(1, 'year');

    const dateTimePickerProps = {
      ...getDateTimePickerProps(classes),
      minDate: schoolCreatedAt.startOf('day'),
      minDateMessage: `Date should not be before start of School registration day (${ChartHeader.formatDate(schoolCreatedAt)})`,
      ...CUSTOM_PERIOD_SELECT_KEY_PICKER_PROPS[this.state[CUSTOM_SELECT_DIALOG.periodSelect].key]({
        customComparisonKey: this.customComparisonOffset.key,
      }),
    };

    const {
      from, to, compareFrom, compareTo,
    } = currentDateRange;

    return (
      <Grid container justify="space-between" className={classes.root}>
        <Grid item container xs={3} alignItems="center" className={classes.totalsContainer}>
          {showTotalCost ? (
            <Grid item xs={12} container direction="column" alignItems="flex-start" justify="center">
              <Typography variant="caption" className={classes.valueLabel}>TOTAL COST</Typography>
              <Typography variant="h4" className={classes.value}>{`£${roundToNPlaces(totalCost, placesAfterDot)}`} </Typography>
              {Boolean(dailyStandingChargeCost) && Boolean(totalCost) && (
                <Typography variant="body2">
                  cost includes a daily standing charge of £{roundToNPlaces(dailyStandingChargeCost, 2)}
                </Typography>
              )}
            </Grid>
          ) : null}
          {showInstantData ? (
            <Grid item xs={12} container direction="column" alignItems="flex-start" justify="center">
              <Typography variant="caption" className={classes.valueLabel}>INSTANT DATA</Typography>
              <Typography variant="h4" className={classes.value}>
                {`${roundToNPlaces(instantData, placesAfterDot)}`}
                <Typography className={classes.valueUnit}>{unitLabel}</Typography>
              </Typography>
            </Grid>
          ) : null}
          {showTotalUsage ? (
            <Grid item xs={12} md={6} container direction="column" alignItems="flex-start" justify="center">
              <Typography variant="caption" className={classes.valueLabel}>{totalLabel}</Typography>
              <Typography variant="h4" className={classes.value}>
                {roundToNPlaces(totalUsage, placesAfterDot)}
                <Typography className={classes.valueUnit}>{unitLabel}</Typography>
              </Typography>
            </Grid>
          ) : null}
        </Grid>
        <Grid item xs={9} container justify="flex-end">
          {showDataExportButton && (
            <Button
              className={classes.dataExportButton}
              onClick={() => { this.toggleDialog(CUSTOM_SELECT_DIALOG.periodSelect, { key: CUSTOM_PERIOD_SELECT_KEY.exportData }); }}
            >
              <SaveAltIcon className={classes.dataExportIcon} />
              Export data
            </Button>
          )}
          <Grid container justify="flex-end" spacing={2}>
            {showAlwaysOnToggle && (
              <Grid item>
                <FormControlLabel
                  control={(
                    <Switch
                      color="primary"
                      checked={alwaysOnEnabled}
                      onChange={this.handleAlwaysOnSwitchChange}
                    />
                  )}
                  label="'Always-on' usage"
                />
              </Grid>
            )
            }
            {showPeriod ? (
              <Grid item>
                <FormControl className={classes.selectWrapper}>
                  <InputLabel htmlFor="selectedPeriod">Period</InputLabel>
                  <Select
                    value={selectedPeriod}
                    onChange={this.handleSelectedPeriodChanged}
                    name="selectedPeriod"
                    input={<Input classes={{ underline: classes.selectUnderline }} />}
                  >
                    {PERIODS.map((period) => {
                      const { value, label } = period;
                      return (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      );
                    })}
                    {showCustomPeriod && (
                      <MenuItem value={CUSTOM_PERIOD}>{CUSTOM_PERIOD_LABEL}</MenuItem>
                    )}
                  </Select>
                  {(!isNil(from) && !isNil(to)) && (
                    <FormHelperText classes={{ root: classes.selectPeriodHelperRoot }}>
                      {ChartHeader.formatDate(moment(from))} &nbsp; &ndash; &nbsp; {ChartHeader.formatDate(moment(to))}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            ) : null}
            {showComparison && (
              <Grid item>
                <FormControl className={classes.selectWrapper}>
                  <InputLabel htmlFor="selectedComparisonPeriodOffset">Select comparison</InputLabel>
                  <Select
                    disabled={selectedShowedPeriodsCount > 1 || selectedPeriod === CUSTOM_PERIOD}
                    value={selectedComparisonPeriodOffset.key}
                    onChange={this.handleSelectedComparisonPeriodOffsetChanged}
                    name="selectedComparisonPeriodOffset"
                    input={<Input classes={{ underline: classes.selectUnderline }} />}
                  >
                    {COMMON_COMPARISON_OPTIONS.map(option => (
                      <MenuItem key={option.key} value={option.key}>{option.label(selectedPeriod)}</MenuItem>
                    ))}
                    {!showOnlyCommonComparisons
                      && (PERIOD_PREDEFINED_COMPARISON_OPTIONS[selectedPeriod] || []).map(option => (
                        <MenuItem key={option.key} value={option.key}>{option.label}</MenuItem>
                      ))
                    }
                    {(!showOnlyCommonComparisons && PERIOD_CUSTOM_COMPARISON_OPTION[selectedPeriod]) && (
                      <MenuItem value={PERIOD_CUSTOM_COMPARISON_OPTION[selectedPeriod].key}>{PERIOD_CUSTOM_COMPARISON_OPTION[selectedPeriod].label}</MenuItem>
                    )}
                  </Select>
                  {(!isNil(compareFrom) && !isNil(compareTo)) && (
                    <FormHelperText classes={{ root: classes.selectPeriodHelperRoot }}>
                      {ChartHeader.formatDate(moment(compareFrom))} &nbsp; &ndash; &nbsp; {ChartHeader.formatDate(moment(compareTo))}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )
            }
            <Hidden smDown>
              <Grid item>
                <Tabs
                  value={selectedShowedPeriodsCount}
                  onChange={this.handleSelectedShowedPeriodsCountChanged}
                  textColor="primary"
                  indicatorColor="primary"
                  name="selectedShowedPeriodsCount"
                >
                  {(periodToTabs[selectedPeriod] || []).map((item, index) => (
                    <Tab
                      key={item}
                      value={index + 1}
                      classes={{ root: classes.periodTab }}
                      label={item === 'TODAY' && isHalfHourMeter && selectedChartType !== 'live' ? 'YESTERDAY' : item}
                    />
                  ))}
                </Tabs>
              </Grid>
            </Hidden>
          </Grid>
        </Grid>
        <Hidden mdUp>
          {selectedPeriod !== CUSTOM_PERIOD && (
            <Grid item container xs={12} alignItems="center" justify="space-around" style={{ marginTop: 25 }}>
              <Tabs
                value={selectedShowedPeriodsCount}
                onChange={this.handleSelectedShowedPeriodsCountChanged}
                textColor="primary"
                indicatorColor="primary"
                name="selectedShowedPeriodsCount"
              >
                {(periodToTabs[selectedPeriod] || []).map((item, index) => (
                  <Tab
                    key={item}
                    value={index + 1}
                    classes={{ root: classes.periodTab }}
                    label={item === 'TODAY' && isHalfHourMeter && selectedChartType !== 'live' ? 'YESTERDAY' : item}
                  />
                ))}
              </Tabs>
            </Grid>
          )}
        </Hidden>
        <DateTimeRangeSelect
          onRef={(elem) => { this.dateTimeRangeSelectRef = elem; }}
          classes={{
            submitButton: classes.dateTimeSelectSubmitButton,
          }}
          isOpened={this.state[CUSTOM_SELECT_DIALOG.periodSelect].isOpened}
          displayVariant="modal"
          dialogProps={{
            title: this.state[CUSTOM_SELECT_DIALOG.periodSelect].key === CUSTOM_PERIOD_SELECT_KEY.comparison ? 'Select date' : undefined,
            classes: {
              rootPaper: classes.dateTimeSelectDialogRoot,
            },
          }}
          pickerProps={{
            from: dateTimePickerProps,
            to: dateTimePickerProps,
          }}
          validators={[
            DATE_RANGE_VALIDATOR[DATE_RANGE_VALIDATOR_TYPE.bothRequired](),
            DATE_RANGE_VALIDATOR[DATE_RANGE_VALIDATOR_TYPE.fromLessThanTo](),
            {
              rule: (dateRangeFrom, dateRangeTo) => {
                const duration = moment.duration(dateRangeTo.diff(dateRangeFrom));
                return duration.asHours() >= 1;
              },
              errorMessage: 'Range duration should not be less than 1 hour ',
            },
            ...(CUSTOM_PERIOD_SELECT_KEY_EXTRA_VALIDATORS[this.state[CUSTOM_SELECT_DIALOG.periodSelect].key] || []),
          ]}
          {...CUSTOM_PERIOD_SELECT_KEY_COMPONENT_PROPS[this.state[CUSTOM_SELECT_DIALOG.periodSelect].key]}
          onSubmit={this.onSelectDateTimeRange}
          onCancel={() => { this.toggleDialog(CUSTOM_SELECT_DIALOG.periodSelect); }}
        />
        <SelectTimeResolutionDialog
          title={(TIME_RESOLUTION_SELECT_KEY_DIALOG_CONFIG[this.state[CUSTOM_SELECT_DIALOG.timeResolutionSelect].key] || {}).title}
          isOpened={this.state[CUSTOM_SELECT_DIALOG.timeResolutionSelect].isOpened}
          onClose={() => { this.toggleDialog(CUSTOM_SELECT_DIALOG.timeResolutionSelect); }}
          onSubmit={this.onSelectTimeResolution}
          options={this.getTimeResolutionOptionsByCustomPeriod()}
        />
      </Grid>
    );
  }
}
/* eslint-enable react/destructuring-assignment */
ChartHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  unitLabel: PropTypes.string.isRequired,
  totalUsage: PropTypes.number,
  totalCost: PropTypes.number,
  instantData: PropTypes.number,
  showPeriod: PropTypes.bool.isRequired,
  showTotalCost: PropTypes.bool.isRequired,
  showTotalUsage: PropTypes.bool.isRequired,
  showInstantData: PropTypes.bool,
  showDataExportButton: PropTypes.bool,
  alwaysOnEnabled: PropTypes.bool.isRequired,
  school: PropTypes.object.isRequired,

  selectedShowedPeriodsCount: PropTypes.number.isRequired,
  selectedPeriod: PropTypes.string.isRequired,
  selectedComparisonPeriodOffset: PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  }).isRequired,
  selectedChartType: PropTypes.string.isRequired,
  showOnlyCommonComparisons: PropTypes.bool,
  config: PropTypes.object,
  currentDateRange: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
    compareFrom: PropTypes.string,
    compareTo: PropTypes.string,
  }).isRequired,
  dailyStandingChargeCost: PropTypes.number,
  showAlwaysOnToggle: PropTypes.bool,
  isHalfHourMeter: PropTypes.bool,

  onChange: PropTypes.func.isRequired,
  onDataExport: PropTypes.func,
  onRef: PropTypes.func.isRequired,
};

ChartHeader.defaultProps = {
  totalUsage: null,
  totalCost: null,
  showInstantData: false,
  showDataExportButton: false,
  showOnlyCommonComparisons: true,
  instantData: null,
  config: {
    placesAfterDot: 2,
    totalLabel: 'TOTAL USAGE',
    showComparison: true,
  },
  dailyStandingChargeCost: null,
  showAlwaysOnToggle: false,
  isHalfHourMeter: false,
  onDataExport: () => {},
};

export default compose(withStyles(styles))(ChartHeader);
