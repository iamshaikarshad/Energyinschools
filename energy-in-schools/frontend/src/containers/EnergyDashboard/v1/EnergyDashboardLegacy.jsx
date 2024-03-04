import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Carousel from 'nuka-carousel';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

import {
  ENERGY_DASHBOARD_CONFIG, INITIAL_COMMON_ACTIONS,
} from './dashboardConfigLegacy';
import { obtainDashboardToken } from '../../../actions/authActions';
import { showAlert } from '../../../actions/dialogActions';
import formatErrorMessageFromError from '../../../utils/errorHandler';

import TokenManager from '../../../utils/tokenManager';

import { reduceObjByKeysList } from '../../../components/EnergyScreenDashboard/constants';

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
    height: '70%',
    top: 0,
    width: '100%',
    display: 'block',
    overflow: 'hidden',
  },
  previewSlider: {
    position: 'absolute',
    height: '30%',
    bottom: 0,
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

    if (TokenManager.accessToken) {
      this.callDashboardActions(schoolId);
    } else {
      obtainDashboardToken(schoolId)
        .then(() => {
          this.callDashboardActions(schoolId);
        }, (error) => {
          dispatch(showAlert.bind('There is no school with that UID', formatErrorMessageFromError(error)));
          console.log(error); // eslint-disable-line no-console
        });
    }
  }

  shouldComponentUpdate(nextProps) {
    const { energyDashboardData } = this.props;
    return nextProps.energyDashboardData.loadingEnds.status !== energyDashboardData.loadingEnds.status;
  }

  componentWillUnmount() {
    this.activeIntervalsIds.forEach(element => clearInterval(element));
    this.activeIntervalsIds.length = 0;
  }

  callDashboardActions(schoolId) {
    const { dispatch } = this.props;
    INITIAL_COMMON_ACTIONS.forEach((actionConfig) => {
      const { action, refreshInterval } = actionConfig;
      action({ schoolId }, dispatch);
      if (refreshInterval) {
        this.activeIntervalsIds.push(setInterval(() => {
          action({ schoolId }, dispatch);
        }, refreshInterval));
      }
    });
    ENERGY_DASHBOARD_CONFIG.forEach((item) => {
      item.invokeActions({ schoolId }, dispatch);

      this.activeIntervalsIds.push(setInterval(() => {
        item.invokeActions({ schoolId }, dispatch);
      }, item.refreshInterval));
    });
  }

  render() {
    const { classes, energyDashboardData } = this.props;
    return (
      <Grid
        className={classes.root}
        onKeyDown={this.keyPressHandler}
        tabIndex="0"
      >
        <Grid className={classes.mainSlider}>
          <Carousel
            autoplay
            autoplayInterval={11000}
            withoutControls
            wrapAround
            slidesToScroll={1}
            pauseOnHover={false}
            transitionMode="fade"
            initialSlideHeight={1.0}
            speed={500}
            swiping={false}
          >
            {ENERGY_DASHBOARD_CONFIG.map((slide, index) => (
              <Grid className={classes.slideGrid} key={`slide_main_${index}`}> {/* eslint-disable-line react/no-array-index-key */}
                {slide.renderMain(
                  reduceObjByKeysList(energyDashboardData, slide.slideKeys),
                  energyDashboardData.loadingEnds,
                  slide.mainLoadingFailedImage,
                )}
              </Grid>
            ))}
          </Carousel>
        </Grid>
        <Grid className={classes.previewSlider}>
          <Carousel
            autoplay
            autoplayInterval={8000}
            slidesToShow={3}
            slidesToScroll={1}
            withoutControls
            wrapAround
            pauseOnHover={false}
            initialSlideHeight={1.0}
            swiping={false}
          >
            {ENERGY_DASHBOARD_CONFIG.map((slide, index) => (
              <Grid className={classes.slideGrid} key={`slide_preview_${index}`}> {/* eslint-disable-line react/no-array-index-key */}
                {slide.renderPreview(
                  reduceObjByKeysList(energyDashboardData, slide.slideKeys),
                  energyDashboardData.loadingEnds,
                  slide.previewLoadingFailedImage,
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
