import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Slider from 'react-slick-improved/lib';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

import { getEnergyDashboardSlides, INITIAL_COMMON_ACTIONS } from './dashboardConfig';
import { obtainDashboardToken } from '../../../actions/authActions';
import { showAlert } from '../../../actions/dialogActions';
import formatErrorMessageFromError from '../../../utils/errorHandler';

import {
  DASHBOARD_MAIN_SLIDER_REFRESH_INTERVAL,
  reduceObjByKeysList,
} from '../../../components/EnergyScreenDashboard/constants';

const styles = {
  root: {
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: '0px',
    height: '100vh',
  },
  mainSlider: {
    position: 'absolute',
    height: '100%',
    top: 0,
  },
  previewSlider: {
    position: 'absolute',
    height: '20%',
    bottom: 0,
  },
  slideGrid: {
    height: '100%',
  },
};

class EnergyDashboardContainer extends React.Component {
  constructor(props) {
    super(props);
    this.activeIntervalsIds = [];
  }

  componentDidMount() {
    const { match, dispatch } = this.props;

    const schoolId = match.params.schoolId; // TODO: new auth should be implemented, should use schoolId from Token

    obtainDashboardToken(schoolId)
      .then(() => {
        this.callDashboardActions(schoolId);
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

  keyPressHandler = (event) => {
    switch (event.keyCode) {
      case 37:
        this.mainSlider.slickPrev();
        break;
      case 39:
        this.mainSlider.slickNext();
        break;
      default:
    }
  };

  callDashboardActions(schoolId) {
    const { dispatch } = this.props;
    const slides = getEnergyDashboardSlides();

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
    const slides = getEnergyDashboardSlides();

    return (
      <Grid
        container
        direction="column"
        className={classes.root}
        alignItems="stretch"
        wrap="nowrap"
        onKeyDown={this.keyPressHandler}
        tabIndex="0"
      >
        <Grid item xs container direction="row" className={classes.mainSlider}>
          <Slider
            ref={(slider) => {
              this.mainSlider = slider;
            }}
            fade
            arrows={false}
            autoplay
            autoplaySpeed={DASHBOARD_MAIN_SLIDER_REFRESH_INTERVAL}
            infinite
            pauseOnHover={false}
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
          </Slider>
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

EnergyDashboardContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  energyDashboardData: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null),
)(EnergyDashboardContainer);
