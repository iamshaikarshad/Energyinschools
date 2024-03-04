import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Carousel from 'nuka-carousel';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

import {
  getEnergyDashboardSlides, INITIAL_COMMON_ACTIONS,
} from './dashboardConfigLegacy';
import { obtainDashboardToken } from '../../../actions/authActions';
import { showAlert } from '../../../actions/dialogActions';
import formatErrorMessageFromError from '../../../utils/errorHandler';

import {
  DASHBOARD_MAIN_SLIDER_REFRESH_INTERVAL,
  reduceObjByKeysList,
} from '../../../components/EnergyScreenDashboard/constants';

import TokenManager from '../../../utils/tokenManager';
import { GAS } from '../../../constants/config';

const jwtDecode = require('jwt-decode');

const styles = {
  root: {
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: '0px',
    height: '100%',
    width: '100%',
    display: 'block',
    '& .slider, .slider-slide, .slider-list': {
      height: '100% !important',
    },
  },
  mainSlider: {
    position: 'absolute',
    height: '100%',
    top: 0,
    width: '100%',
    display: 'block',
    overflow: 'hidden',
  },
  slideGrid: {
    height: '100%',
  },
};

class EnergyDashboardLegacy extends React.Component {
  constructor(props) {
    super(props);
    this.activeIntervalsIds = [];
  }

  componentDidMount() {
    const { match, dispatch } = this.props;

    const schoolId = match.params.schoolId; // TODO: new auth should be implemented, should use schoolId from Token

    obtainDashboardToken(schoolId)
      .then((res) => {
        this.callDashboardActions(schoolId, res.access);
      }, (error) => {
        dispatch(showAlert.bind('There is no school with that UID', formatErrorMessageFromError(error)));
        console.log(error); // eslint-disable-line no-console
      });
  }

  shouldComponentUpdate(nextProps) {
    const { energyDashboardData } = this.props;
    return nextProps.energyDashboardData.loadingEnds.status !== energyDashboardData.loadingEnds.status;
  }

  componentWillUnmount() {
    this.activeIntervalsIds.forEach(element => clearInterval(element));
    this.activeIntervalsIds.length = 0;
  }

  getIfUseGas = (token) => {
    if (!token) return true;
    try {
      return jwtDecode(token).energy_types.includes(GAS);
    } catch (error) {
      console.log(error); // eslint-disable-line no-console
      return true;
    }
  }

  callDashboardActions(schoolId, token) {
    const { dispatch } = this.props;
    const slides = getEnergyDashboardSlides(this.getIfUseGas(token));
    INITIAL_COMMON_ACTIONS.forEach((actionConfig) => {
      const { action, refreshInterval } = actionConfig;
      action({ schoolId }, dispatch);
      if (refreshInterval) {
        this.activeIntervalsIds.push(setInterval(() => {
          action({ schoolId }, dispatch);
        }, refreshInterval));
      }
    });
    slides.forEach((item) => {
      item.invokeActions.forEach((action) => {
        action.action({ schoolId }, dispatch);
      });

      this.activeIntervalsIds.push(...item.invokeActions.map(action => (
        setInterval(() => {
          action.action({ schoolId }, dispatch);
        }, action.refreshInterval)
      )));
    });
  }

  render() {
    const { classes, energyDashboardData } = this.props;
    const useGas = this.getIfUseGas(TokenManager.getAccessToken());
    const slides = getEnergyDashboardSlides(useGas);
    return (
      <Grid
        className={classes.root}
        onKeyDown={this.keyPressHandler}
        tabIndex="0"
      >
        <Grid className={classes.mainSlider}>
          <Carousel
            ref={(slider) => {
              this.mainSlider = slider;
            }}
            autoplay
            autoplayInterval={DASHBOARD_MAIN_SLIDER_REFRESH_INTERVAL}
            withoutControls
            wrapAround
            slidesToScroll={1}
            pauseOnHover={false}
            transitionMode="fade"
            initialSlideHeight={1.0}
            speed={500}
            swiping={false}
          >
            {slides.map((slide, index) => (
              <Grid className={classes.slideGrid} key={`slide_${index}`}> {/* eslint-disable-line react/no-array-index-key */}
                {slide.renderMain(
                  reduceObjByKeysList(energyDashboardData, slide.slideKeys),
                  energyDashboardData.loadingEnds,
                  slide.loadingFailedProps,
                )}
              </Grid>
            ))}
          </Carousel>
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    energyDashboardData: state.energyDashboard,
  };
}

EnergyDashboardLegacy.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  energyDashboardData: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null),
)(EnergyDashboardLegacy);
