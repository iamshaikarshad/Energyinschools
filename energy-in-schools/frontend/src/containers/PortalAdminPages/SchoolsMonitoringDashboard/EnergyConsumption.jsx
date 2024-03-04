import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';

import { isEmpty, isNil, round } from 'lodash';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import NoData from './NoData';

import {
  ENERGY_TYPES,
  ENERGY_TYPE_LABEL,
  ENERGY_CONSUMPTION_TYPES,
  ENERGY_CONSUMPTION_TYPE_LABEL,
  ENERGY_TYPE_TO_DISPLAY_CONFIG_MAP,
  DEFAULT_ENERGY_TYPE_DISPLAY_CONFIG,
  STATUS_COLOR,
  NOT_AVAILABLE_LABEL, ENERGY_CONSUMPTION_TYPE, ENERGY_TYPE,
} from './constants';

import { UNIT_TO_LABEL_MAP } from '../../../constants/config';

import objectHasNonEmptyValue from '../../../utils/objectHasNonEmptyValue';

import chartWhiteIcon from '../../../images/chart_white.svg';

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
    [theme.breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  avatar: {
    display: 'inline-block',
    marginRight: 2,
    height: 18,
    width: 18,
    verticalAlign: 'middle',
  },
  detailsContainer: {
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      borderBottom: 'none',
    },
  },
  energyTypeWidget: {
    borderRadius: 13,
    border: '2px solid rgba(0, 0, 0, 0.08)',
    marginTop: 8,
    marginBottom: 8,
  },
  energyTypeTitle: {
    width: '100%',
    padding: '8px 16px',
    fontWeight: 500,
    fontSize: 18,
    textAlign: 'center',
  },
  energyTypeTitleText: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  consumptionTypeContainer: {
    justifyContent: 'center',
    marginBottom: 4,
  },
  consumptionTypeTitle: {
    width: '100%',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  consumptionWidget: {
    marginBottom: 4,
    alignContent: 'center',
  },
  valueUnitBlock: {
    width: '100%',
    lineHeight: 'normal',
    textAlign: 'center',
  },
  value: {
    display: 'inline-block',
    fontSize: 16,
    fontWeight: 500,
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
  },
  unit: {
    display: 'inline-block',
    fontSize: 12,
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignSelf: 'center',
  },
  buttonContainer: {
    padding: 12,
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8,
    },
    [theme.breakpoints.down('xs')]: {
      padding: 8,
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
  buttonIcon: {
    width: 16,
    height: 23,
    marginRight: 5,
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
  noDataRoot: {
    height: 60,
  },
  noDataText: {
    fontSize: 18,
    color: STATUS_COLOR.alert,
    letterSpacing: 1,
    [theme.breakpoints.down('xs')]: {
      letterSpacing: 'normal',
    },
  },
});

class EnergyConsumption extends PureComponent {
  state = {
    detailsDialogOpened: false,
  };

  toggleDetailsDataDialog = () => {
    this.setState(prevState => ({ detailsDialogOpened: !prevState.detailsDialogOpened }));
  }

  render() {
    const {
      classes,
      data,
      meters,
      history,
      schoolUid,
    } = this.props;
    if (isEmpty(data)) return null;
    const allMetersAreHildebrand = meters && meters.hildebrand && meters.energy_meters && meters.hildebrand.meters
      && meters.hildebrand.meters.length && meters.hildebrand.meters.length === meters.energy_meters.total;
    const allMetersAreHalfHour = allMetersAreHildebrand && meters.hildebrand.meters.every(meter => (
      meter.is_half_hour_meter && !meter.live_values_meter
    ));
    const allMetersAreHybridOrHH = allMetersAreHildebrand && meters.hildebrand.meters.every(meter => (
      meter.is_half_hour_meter || meter.hh_values_meter
    ));
    return (
      <Grid item xs={12} container alignItems="center" justify="center" className={classes.root}>
        <Grid item xs={12} container justify="center">
          <Typography className={classes.title}>
            Energy Consumption
          </Typography>
        </Grid>
        <Grid item xs={12} container className={classes.detailsContainer}>
          {ENERGY_TYPES.map((energyType) => {
            const energyTypeData = data[energyType];
            // energy type data is null if there is no meter of current energy type
            const energyTypeDataAvailable = !isEmpty(energyTypeData);
            const energyTypeDisplayConfig = ENERGY_TYPE_TO_DISPLAY_CONFIG_MAP[energyType] || DEFAULT_ENERGY_TYPE_DISPLAY_CONFIG;
            const { color: energyTypeColor, icon: energyTypeIcon, showOnDataUnavailable } = energyTypeDisplayConfig;
            if (!energyTypeDataAvailable && !showOnDataUnavailable) return null;
            return (
              <Grid key={energyType} item container xs={12} md={6} justify="center">
                <Grid
                  item
                  container
                  xs={10}
                  sm={6}
                  md={7}
                  lg={8}
                  xl={7}
                  className={classes.energyTypeWidget}
                >
                  <Grid item container xs={12}>
                    <Typography className={classes.energyTypeTitle} style={{ color: energyTypeColor }}>
                      {energyTypeIcon && (
                        <img alt="icon" src={energyTypeIcon} className={classes.avatar} />
                      )}
                      <span className={classes.energyTypeTitleText}>{ENERGY_TYPE_LABEL[energyType]}</span>
                    </Typography>
                  </Grid>
                  <Grid item container xs={12} justify="center" alignItems="center">
                    {energyTypeDataAvailable ? (
                      <Fragment>
                        {ENERGY_CONSUMPTION_TYPES
                          .filter(consumptionType => !((
                            consumptionType === ENERGY_CONSUMPTION_TYPE.yesterday && (
                              energyType !== ENERGY_TYPE.electricity
                                || !allMetersAreHybridOrHH
                            )
                          ) || (allMetersAreHalfHour && consumptionType !== ENERGY_CONSUMPTION_TYPE.yesterday) || (
                            consumptionType === ENERGY_CONSUMPTION_TYPE.today && allMetersAreHybridOrHH
                          )))
                          .map((consumptionType, consumptionTypeIndex, types) => {
                            const consumptionTypeData = energyTypeData[consumptionType] || {};
                            const { value, unit } = consumptionTypeData;
                            const valueAvailable = !isNil(value);
                            const valueToDisplay = valueAvailable ? round(value, 2) : NOT_AVAILABLE_LABEL.nA;
                            const unitToDisplay = valueAvailable ? UNIT_TO_LABEL_MAP[unit] || '' : '';
                            const showDivider = !(consumptionTypeIndex % 2) && types.length > 1;
                            return (
                              <Fragment key={consumptionType}>
                                <Grid item container xs={showDivider ? 6 : true} className={classes.consumptionTypeContainer}>
                                  <Grid item container xs={11} className={classes.consumptionWidget}>
                                    <Typography className={classes.consumptionTypeTitle} noWrap>
                                      {ENERGY_CONSUMPTION_TYPE_LABEL[consumptionType]}
                                    </Typography>
                                    <Typography className={classes.valueUnitBlock} noWrap>
                                      <span className={classes.value}>{valueToDisplay}</span>
                                      {unitToDisplay && (
                                        <span className={classes.unit}>{unitToDisplay}</span>
                                      )}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                {showDivider && <Grid className={classes.divider} />}
                              </Fragment>
                            );
                          })
                        }
                      </Fragment>
                    ) : (
                      <NoData
                        text={`No ${(ENERGY_TYPE_LABEL[energyType] || '').toLowerCase()} meter!`}
                        classes={{ root: classes.noDataRoot, text: classes.noDataText }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
            );
          })}
          {objectHasNonEmptyValue(data) && (
            <Grid item container className={classes.buttonContainer}>
              <Button
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={() => history.push(`/energy-usage/${schoolUid}`)}
              >
                <img src={chartWhiteIcon} alt="chart" className={classes.buttonIcon} />
                Details
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  }
}

EnergyConsumption.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.shape({
    electricity: PropTypes.object,
    gas: PropTypes.object,
  }).isRequired,
  meters: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  schoolUid: PropTypes.string.isRequired,
};

export default withStyles(styles)(EnergyConsumption);
