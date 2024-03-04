import 'rc-slider/assets/index.css';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from 'rc-slider';

import { isNil } from 'lodash';

import Loader from './Loader';
import NoData from './NoData';

import * as dashboardActions from '../../../actions/EnergyManagerDashboard/energyManagerDashboardActions';

import {
  calcYearlyEnergySavingCostByTodayAlwaysOn,
} from './constants';

import { UNIT, UNIT_TO_LABEL_MAP, ENERGY_TYPE } from '../../../constants/config';

import roundToNPlaces from '../../../utils/roundToNPlaces';

import costCalculatorIcon from '../../../images/EnergyManagerDashboard/cost_calculator.svg';
import costIcon from '../../../images/cost.svg';

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
    marginTop: 8,
    border: '8px solid rgb(171, 226, 251)',
    borderRadius: 25,
    height: 160,
    color: 'rgb(255, 255, 255)',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  valueDetail: {
    color: 'inherit',
    fontSize: 18,
    padding: 12,
    textAlign: 'center',
  },
  valueHint: {
    color: 'inherit',
    fontSize: 13,
    padding: '12px 8px',
    textAlign: 'center',
  },
  valueBlock: {
    color: 'rgb(171, 226, 251)',
    textAlign: 'center',
    lineHeight: 'normal',
  },
  value: {
    display: 'inline-block',
    fontSize: 36,
    fontWeight: 500,
    marginRight: 5,
  },
  unit: {
    display: 'inline-block',
    fontSize: 21,
  },
  loaderRoot: {
    height: 'auto',
    position: 'static',
    overflow: 'hidden',
  },
  calculatorLoaderRoot: {
    position: 'static',
    height: 150,
  },
  calculatorContainer: {
    marginTop: 20,
  },
  calculatorTitle: {
    padding: '16px 16px 12px',
  },
  calculatorTitleText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 21,
    lineHeight: 'normal',
  },
  calculatorIcon: {
    height: 21,
    marginRight: 8,
  },
  reduceValueBlock: {
    padding: 16,
    marginBottom: 12,
  },
  reduceValueText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
  },
  saveCostBlock: {
    padding: 16,
    marginTop: 24,
  },
  saveCostText: {
    width: '100%',
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
  },
  saveCostValue: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    color: 'inherit',
  },
  noDataRoot: {
    height: 120,
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    textShadow: 'none',
    color: 'rgb(255, 230, 230)',
  },
});

const DEFAULT_ALWAYS_ON_REDUCE_PERCENTAGE = 20;

const MARK_STYLE = {
  fontFamily: 'Roboto',
  color: 'rgba(255, 255, 255, 0.87)',
  marginTop: 5,
};

const REDUCE_ALWAYS_ON_SLIDER_VALUES = Array.from({ length: 10 }, (item, index) => (index + 1) * 10);

const REDUCE_ALWAYS_ON_SLIDER_MARKS = REDUCE_ALWAYS_ON_SLIDER_VALUES.reduce(
  (res, value) => {
    res[value] = { label: `${value}%`, style: MARK_STYLE };
    return res;
  },
  {},
);

const SLIDER_STYLE = Object.freeze({
  dot: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 10,
    width: 10,
    bottom: -3,
    marginLeft: -6,
  },
  handle: {
    height: 18,
    width: 18,
    marginTop: -7,
    marginLeft: -9,
  },
});

class EnergyAlwaysOn extends React.Component {
  state = {
    reduceAlwaysOnPercentage: DEFAULT_ALWAYS_ON_REDUCE_PERCENTAGE,
  };

  componentDidMount() {
    this.getData();
  }

  shouldComponentUpdate(nextProps) {
    const { data } = this.props;
    return !nextProps.data.loading || !data.loading;
  }

  getData = () => {
    const { actions, name } = this.props;
    actions.callDashboardItemActions(
      [actions.getEnergyAlwaysOnToday(ENERGY_TYPE.electricity), actions.getCurrentEnergyTariffs(ENERGY_TYPE.electricity)],
      name,
    );
  }

  onChangeReduceAlwaysOnPercentage = (value) => {
    this.setState({ reduceAlwaysOnPercentage: value });
  }

  renderNoDataBlock = (message) => {
    const { classes, data: { loading } } = this.props;
    if (loading) return (<Loader classes={{ root: classes.calculatorLoaderRoot }} />);
    return (
      <NoData
        classes={{ root: classes.noDataRoot, text: classes.noDataText }}
        text={(
          <React.Fragment>
            <span style={{ fontSize: '1.1em' }}>Not available!</span>
            <br />
            <br />
            <span>{message}</span>
          </React.Fragment>
        )}
      />
    );
  }

  render() {
    const { classes, data } = this.props;
    const { reduceAlwaysOnPercentage } = this.state;
    const { loading, alwaysOnData, energyTariffs } = data;
    const valueToDisplay = !isNil(alwaysOnData) ? roundToNPlaces(alwaysOnData.value / 1000, 2) : 'N/A';
    const unitToDisplay = !isNil(alwaysOnData) ? UNIT_TO_LABEL_MAP[UNIT.kilowatt] : '';
    const costSaving = calcYearlyEnergySavingCostByTodayAlwaysOn(reduceAlwaysOnPercentage, alwaysOnData, energyTariffs);
    return (
      <div className={classes.root}>
        <Grid container justify="center" alignItems="center" className={classes.header}>
          <Typography className={classes.headerText}>
            Always-on usage
          </Typography>
        </Grid>
        <Grid container justify="center">
          <Grid container item xs={10} sm={8} md={6} lg={7} className={classes.valueWidget}>
            <Typography className={classes.valueDetail}>Always-on usage</Typography>
            {!loading ? (
              <Typography className={classes.valueBlock}>
                <span className={classes.value}>{valueToDisplay}</span>
                <span className={classes.unit}>{unitToDisplay}</span>
              </Typography>
            ) : (
              <Grid container justify="center">
                <Loader classes={{ root: classes.loaderRoot }} />
              </Grid>
            )}
            <Typography className={classes.valueHint}>shows how much is being left on overnight</Typography>
          </Grid>
        </Grid>
        <Grid container justify="center" className={classes.calculatorContainer}>
          <Grid item container className={classes.calculatorTitle} justify="center">
            <img src={costCalculatorIcon} alt="cost calculator" className={classes.calculatorIcon} />
            <Typography className={classes.calculatorTitleText}>Cost saving calculator</Typography>
          </Grid>
          <Grid item container className={classes.calculatorContent} justify="center">
            {!isNil(costSaving.value) ? (
              <React.Fragment>
                <Grid item container className={classes.reduceValueBlock}>
                  <Typography className={classes.reduceValueText}>
                    Reduce always on usage by
                    <span style={{ fontWeight: 500 }}> {reduceAlwaysOnPercentage}%</span>
                  </Typography>
                </Grid>
                <Grid item container xs={11}>
                  <Slider
                    dots
                    min={10}
                    max={100}
                    marks={REDUCE_ALWAYS_ON_SLIDER_MARKS}
                    step={10}
                    onChange={this.onChangeReduceAlwaysOnPercentage}
                    defaultValue={DEFAULT_ALWAYS_ON_REDUCE_PERCENTAGE}
                    dotStyle={SLIDER_STYLE.dot}
                    handleStyle={SLIDER_STYLE.handle}
                  />
                </Grid>
                <Grid item container xs={12} className={classes.saveCostBlock}>
                  <Typography component="div" className={classes.saveCostText}>
                    and save
                    <Typography className={classes.saveCostValue}>
                      <img alt="Cost" src={costIcon} style={{ height: 14, marginRight: 5 }} />
                      {UNIT_TO_LABEL_MAP[UNIT.poundSterling]}
                      {costSaving.value}
                      <span style={{ fontSize: 16 }}>/year</span>
                    </Typography>
                  </Typography>
                </Grid>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {this.renderNoDataBlock(costSaving.message)}
              </React.Fragment>
            )}
          </Grid>
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
    }, dispatch),
  };
}

EnergyAlwaysOn.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
};

export default compose(
  withRouter,
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps),
)(EnergyAlwaysOn);
