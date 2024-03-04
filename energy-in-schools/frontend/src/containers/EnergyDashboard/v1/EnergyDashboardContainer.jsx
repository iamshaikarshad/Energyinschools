import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Slider from 'react-slick-improved/lib';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

import { ENERGY_DASHBOARD_CONFIG, INITIAL_COMMON_ACTIONS } from './dashboardConfig';
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
    height: '100vh',
  },
  mainSlider: {
    position: 'absolute',
    height: '70%',
    top: 0,
  },
  previewSlider: {
    position: 'absolute',
    height: '30%',
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

  componentWillUnmount() {
    this.activeIntervalsIds.forEach(element => clearInterval(element));
    this.activeIntervalsIds.length = 0;
  }

  keyPressHandler = (event) => {
    switch (event.keyCode) {
      case 37:
        this.mainSlider.slickPrev();
        this.previewSlider.slickPrev();
        break;
      case 39:
        this.mainSlider.slickNext();
        this.previewSlider.slickNext();
        break;
      default:
    }
  };

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
            autoplaySpeed={5000}
            infinite
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
          </Slider>
        </Grid>
        <Grid item xs container direction="row" className={classes.previewSlider}>
          <Slider
            ref={(slider) => {
              this.previewSlider = slider;
            }}
            arrows={false}
            infinite
            autoplay
            autoplaySpeed={5000}
            slidesToShow={3}
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
