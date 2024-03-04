/* eslint-disable react/no-did-update-set-state,react/no-did-mount-set-state */
import React from 'react';
import Slider from 'react-slick-improved';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import { push } from 'connected-react-router';
import { bindActionCreators, compose } from 'redux';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import LiveConsumption from '../../../components/EnergyScreenDashboard/v0/LiveConsumption/LiveConsumption-old';
import LiveConsumptionPreview from '../../../components/EnergyScreenDashboard/v0/LiveConsumption/LiveConsumptionPreview-old';
import EnergyFactsListing from '../../../components/EnergyScreenDashboard/v0/EnergyFacts/EnergyFactsListing-old';
import EnergyFactsListingPreview from '../../../components/EnergyScreenDashboard/v0/EnergyFacts/EnergyFactsListingPreview-old';
import CartoonCharacter from '../../../components/EnergyScreenDashboard/v0/CartoonCharacter/CartoonCharacter-old';
import CartoonCharacterPreview from '../../../components/EnergyScreenDashboard/v0/CartoonCharacter/CartoonCharacterPreview-old';
import NewsWeather from '../../../components/EnergyScreenDashboard/v0/NewsWeather/NewsWeather-old';
import CurrentWeatherPreview from '../../../components/EnergyScreenDashboard/v0/NewsWeather/CurrentWeatherPreview-old';
import CarbonIntensity from '../../../components/EnergyScreenDashboard/v0/CarbonIntensity/CarbonIntensity-old';
import CarbonIntensityPreview from '../../../components/EnergyScreenDashboard/v0/CarbonIntensity/CarbonIntensityPreview-old';
import EnergyDashboardScreenAlert from '../../../components/dialogs/EnergyDashboardScreenAlert';

import { obtainDashboardToken } from '../../../actions/authActions';
import formatErrorMessageFromError from '../../../utils/errorHandler';
import * as dialogActions from '../../../actions/dialogActions';
import * as newsWeatherActions from '../../../actions/newsWeatherActions';
import { getLocationEnergyMood } from '../../../actions/schoolsActions';
import getFactsList from '../../../actions/EnergyDashboard/factsActions';
import { getLiveConsumptionInLocationByType } from '../../../actions/metersActions';
import getCarbonIntensity from '../../../actions/EnergyDashboard/carbonIntensityActions';
import { ELECTRICITY, GAS } from '../../../constants/config';
import { getCashbackAmount } from '../../../actions/EnergyDashboard/cashbackActions';
import reportOnActivity from '../../../actions/EnergyDashboard/auxiliaryActions';
import Cashback from '../../../components/EnergyScreenDashboard/v0/Cashback/Cashback-old';
import CashbackPreview from '../../../components/EnergyScreenDashboard/v0/Cashback/CashbackPreview-old';

import { ENERGY_DASHBOARD_VERSION, ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL } from '../../../components/EnergyScreenDashboard/constants';

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
};

const CURRENT_WEATHER_REFRESH_INTERVAL = 1000 * 60 * 60; // update current weather every hour
const CASHBACK_DATA_REFRESH_INTERVAL = 1000 * 60 * 60; // update cashback data every hour
const WEATHER_FORECAST_REFRESH_INTERVAL = 1000 * 60 * 60 * 3; // update weather forecast every 3 hours
const NEWS_REFRESH_INTERVAL = 1000 * 60 * 60 * 3; // update news forecast every 3 hours
const ENERGY_LIVE_DATA_REFRESH = 1000 * 60; // update live usage every minute
const CARBON_DATA_REFRESH = 1000 * 60 * 30;// update carbon data every 30 minutes
const ENERGY_MOOD_REFRESH = 1000 * 60 * 10; // update energy mood every 10 minutes

const ENERGY_TYPES = [ELECTRICITY, GAS];

const fullHdWidth = 1920;
const fullHdHeight = 1080;

class EnergyScreenDashboard extends React.Component {
  constructor(props) {
    super(props);
    const {
      mood,
      carbonIntensityState,
      cashbackData,
      energyConsumptionData,
    } = this.props;
    this.state = {
      screenContent: [
        {
          type: 'EnergyMoodCharacter',
          mainComponent: CartoonCharacter,
          previewComponent: CartoonCharacterPreview,
          mainComponentProps: {
            mood,
          },
          previewComponentProps: {
            mood,
          },
        },
        {
          type: 'CarbonIntensity',
          mainComponent: CarbonIntensity,
          previewComponent: CarbonIntensityPreview,
          mainComponentProps: {
            ...carbonIntensityState,
          },
          previewComponentProps: {
            value: carbonIntensityState.value,
          },
        },
        {
          type: 'Cashback',
          mainComponent: Cashback,
          previewComponent: CashbackPreview,
          mainComponentProps: {
            ...cashbackData,
          },
          previewComponentProps: {
            ...cashbackData,
          },
        },
        {
          type: 'Live consumption',
          mainComponent: LiveConsumption,
          previewComponent: LiveConsumptionPreview,
          mainComponentProps: {
            totalUsageByEnergyType: energyConsumptionData,
          },

          previewComponentProps: {
            usage: this.sumValues(energyConsumptionData),
            unit: 'n/a',
          },
        },
      ],
      openedScreenAlertDialog: false,
    };
    this.isFullHd = window.screen.width === fullHdWidth && window.screen.height === fullHdHeight;
  }

  componentDidMount() {
    // this.setState({openedScreenAlertDialog: !this.isFullHd}); // uncomment to enable screen resolution alert
    document.addEventListener('keydown', this.keyPressHandler, false);
    const { actions, match } = this.props;
    const schoolId = match.params.schoolId;

    obtainDashboardToken(schoolId)
      .then(() => {
        this.callActions();
      }, (error) => {
        actions.showAlert('There is no school with that UID', formatErrorMessageFromError(error));
        console.log(error); // eslint-disable-line no-console
      });
  }

  componentDidUpdate(prevProps) {
    const {
      facts, newsWeather, mood, energyConsumptionData, carbonIntensityState, cashbackData,
    } = this.props;
    const { screenContent } = this.state;
    if (facts !== prevProps.facts) {
      this.setState({
        screenContent: [...screenContent, {
          type: 'EnergyFacts',
          mainComponent: EnergyFactsListing,
          previewComponent: EnergyFactsListingPreview,
          mainComponentProps: {
            facts,
          },
          previewComponentProps: {
            fact: facts[0],
          },
        }],
      });
    } else if (newsWeather !== prevProps.newsWeather) {
      const weatherScreenIdx = screenContent.findIndex(screen => screen.type === 'Weather&News');
      if (weatherScreenIdx === -1) {
        const weatherScreen = {
          type: 'Weather&News',
          mainComponent: NewsWeather,
          previewComponent: CurrentWeatherPreview,
          mainComponentProps: {
            currentWeather: newsWeather.currentWeather,
            forecastWeather: newsWeather.forecastWeather,
            news: newsWeather.news,
          },
          previewComponentProps: {
            currentWeather: newsWeather.currentWeather,
          },
        };
        this.setState(prevState => update(prevState, { screenContent: { $push: [weatherScreen] } }));
      } else {
        const weatherScreenCopy = Object.assign({}, screenContent[weatherScreenIdx]);
        weatherScreenCopy.mainComponentProps = {
          currentWeather: newsWeather.currentWeather,
          forecastWeather: newsWeather.forecastWeather,
          news: newsWeather.news,
        };
        weatherScreenCopy.previewComponentProps = {
          currentWeather: newsWeather.currentWeather,
        };
        this.setState(prevState => update(prevState, { screenContent: { [weatherScreenIdx]: { $set: weatherScreenCopy } } }));
      }
    } else if (mood !== prevProps.mood) {
      const energyMoodCharacterIndex = screenContent.findIndex(screen => screen.type === 'EnergyMoodCharacter');
      const EnergyCartoonComponentCopy = Object.assign({}, screenContent[energyMoodCharacterIndex]);
      EnergyCartoonComponentCopy.mainComponentProps = {
        mood,
      };
      EnergyCartoonComponentCopy.previewComponentProps = {
        mood,
      };
      this.setState(prevState => update(prevState, { screenContent: { [energyMoodCharacterIndex]: { $set: EnergyCartoonComponentCopy } } }));
    } else if (energyConsumptionData !== prevProps.energyConsumptionData) {
      const energyConsumptionIndex = screenContent.findIndex(screen => screen.type === 'Live consumption');
      let unit = 'n/a';
      if (energyConsumptionData.length > 0) {
        unit = energyConsumptionData[0].unit; // XXX TODO Handle unit
      }
      if (energyConsumptionIndex === -1) {
        this.setState({
          screenContent: [...screenContent, {
            type: 'Live consumption',
            mainComponent: LiveConsumption,
            previewComponent: LiveConsumptionPreview,
            mainComponentProps: {
              totalUsageByEnergyType: energyConsumptionData,
            },

            previewComponentProps: {
              usage: this.sumValues(energyConsumptionData),
              unit,
            },
          }],
        });
      } else {
        const EnergyConsumptionComponentCopy = Object.assign({}, screenContent[energyConsumptionIndex]);
        EnergyConsumptionComponentCopy.mainComponentProps = {
          totalUsageByEnergyType: energyConsumptionData,
        };
        EnergyConsumptionComponentCopy.previewComponentProps = {
          usage: this.sumValues(energyConsumptionData),
          unit,
        };
        this.setState(prevState => update(prevState, { screenContent: { [energyConsumptionIndex]: { $set: EnergyConsumptionComponentCopy } } }));
      }
    } else if (carbonIntensityState !== prevProps.carbonIntensityState) {
      const carbonIntensityIndex = screenContent.findIndex(screen => screen.type === 'CarbonIntensity');
      const CarbonIntesityCopy = Object.assign({}, screenContent[carbonIntensityIndex]);
      CarbonIntesityCopy.mainComponentProps = {
        ...carbonIntensityState,
      };
      CarbonIntesityCopy.previewComponentProps = {
        value: carbonIntensityState.value,
      };
      this.setState(prevState => update(prevState, { screenContent: { [carbonIntensityIndex]: { $set: CarbonIntesityCopy } } }));
    } else if (cashbackData !== prevProps.cashbackData) {
      const cashbackIndex = screenContent.findIndex(screen => screen.type === 'Cashback');
      if (cashbackIndex === -1) {
        const cashbackScreen = {
          type: 'Cashback',
          mainComponent: Cashback,
          previewComponent: CashbackPreview,
          mainComponentProps: {
            ...cashbackData,
          },
          previewComponentProps: {
            ...cashbackData,
          },
        };
        this.setState(prevState => update(prevState, { screenContent: { $push: [cashbackScreen] } }));
      } else {
        const CashbackCopy = Object.assign({}, screenContent[cashbackIndex]);
        CashbackCopy.mainComponentProps = {
          ...cashbackData,
        };
        CashbackCopy.previewComponentProps = {
          ...cashbackData,
        };
        this.setState(prevState => update(prevState, { screenContent: { [cashbackIndex]: { $set: CashbackCopy } } }));
      }
    }
  }

  componentWillUnmount() {
    const {
      reportOnActivityRefreshInterval,
      currentWeatherRefreshInterval,
      weatherForecastRefreshInterval,
      newsRefreshInterval,
      liveConsumptionRefreshInterval,
      carbonDataRefreshInterval,
      energyMoodRefreshInterval,
      cashbackRefreshInterval,
    } = this.state;
    clearInterval(reportOnActivityRefreshInterval);
    clearInterval(currentWeatherRefreshInterval);
    clearInterval(weatherForecastRefreshInterval);
    clearInterval(newsRefreshInterval);
    clearInterval(liveConsumptionRefreshInterval);
    clearInterval(carbonDataRefreshInterval);
    clearInterval(energyMoodRefreshInterval);
    clearInterval(cashbackRefreshInterval);
    document.removeEventListener('keydown', this.keyPressHandler, false);
  }

  onBack = () => {
    const { history } = this.props;
    this.setState({ openedScreenAlertDialog: false });
    if (history && history.length) {
      history.goBack();
    } else {
      history.push('/');
    }
  };

  sumValues = (records) => {
    if (records) {
      return records.reduce((acc, record) => acc + record.value, 0);
    }
    return 0;
  };

  closeScreenAlertDialog = () => {
    this.setState({ openedScreenAlertDialog: false });
  };

  beforeSlideChange = (oldIndex, newIndex) => {
    this.mainSlider.slickGoTo(newIndex - 1);
  };

  keyPressHandler = (event) => {
    switch (event.keyCode) {
      case 37:
        this.secondarySlider.slickPrev();
        break;
      case 39:
        this.secondarySlider.slickNext();
        break;
      default:
    }
  };

  callActions() { // TODO RENAME
    const { actions, match } = this.props;
    const schoolId = match.params.schoolId;

    // Get first pack of data
    actions.reportOnActivity(ENERGY_DASHBOARD_VERSION.energyDashboardV0);
    actions.getFactsList(schoolId);
    actions.getCurrentWeather(schoolId);
    actions.getWeatherForecast(schoolId);
    actions.getNewsList();
    actions.getCashbackAmount(schoolId);
    actions.getLocationEnergyMood(schoolId);
    actions.getCarbonIntensity();
    ENERGY_TYPES.map(type => actions.getLiveConsumptionInLocationByType(type, schoolId));

    // set intervals
    const reportOnActivityRefreshInterval = setInterval(
      () => { actions.reportOnActivity(ENERGY_DASHBOARD_VERSION.energyDashboardV0); },
      ENERGY_DASHBOARD_REPORT_ON_ACTIVITY_INTERVAL,
    );
    const liveConsumptionRefreshInterval = setInterval(() => {
      ENERGY_TYPES.map(type => actions.getLiveConsumptionInLocationByType(type, schoolId));
    }, ENERGY_LIVE_DATA_REFRESH);
    const carbonDataRefreshInterval = setInterval(() => actions.getCarbonIntensity(), CARBON_DATA_REFRESH);
    const energyMoodRefreshInterval = setInterval(() => actions.getLocationEnergyMood(schoolId), ENERGY_MOOD_REFRESH);
    const newsRefreshInterval = setInterval(() => actions.getNewsList(), NEWS_REFRESH_INTERVAL);
    const cashbackRefreshInterval = setInterval(() => actions.getCashbackAmount(schoolId), CASHBACK_DATA_REFRESH_INTERVAL);
    const currentWeatherRefreshInterval = setInterval(() => actions.getCurrentWeather(schoolId), CURRENT_WEATHER_REFRESH_INTERVAL);
    const weatherForecastRefreshInterval = setInterval(() => actions.getWeatherForecast(schoolId), WEATHER_FORECAST_REFRESH_INTERVAL);
    this.setState({
      reportOnActivityRefreshInterval,
      currentWeatherRefreshInterval,
      weatherForecastRefreshInterval,
      newsRefreshInterval,
      liveConsumptionRefreshInterval,
      carbonDataRefreshInterval,
      energyMoodRefreshInterval,
      cashbackRefreshInterval,
    });
  }

  render() {
    const { classes } = this.props;
    const { screenContent, openedScreenAlertDialog } = this.state;

    return (
      <Grid container direction="column" className={classes.root} alignItems="stretch" wrap="nowrap">
        <Grid item xs container direction="row" className={classes.mainSlider}>
          {screenContent.length === 6 && (
            <Slider
              fade
              // eslint-disable-next-line no-return-assign
              ref={slider => this.mainSlider = slider}
              arrows={false}
              infinite
            >
              {screenContent.map(screen => (
                <screen.mainComponent key={screen.type} {...screen.mainComponentProps} />
              ))}
            </Slider>
          )
          }
        </Grid>
        <Grid item xs container direction="row" className={classes.previewSlider}>
          {screenContent.length === 6 && (
            <Slider
              arrows={false}
              // eslint-disable-next-line no-return-assign
              ref={slider => this.secondarySlider = slider}
              infinite
              autoplay
              autoplaySpeed={15000}
              initialSlide={1}
              beforeChange={this.beforeSlideChange}
              slidesToShow={3}
            >
              {screenContent.map(screen => (
                <screen.previewComponent key={screen.type} {...screen.previewComponentProps} />
              ))
              }
            </Slider>
          )
          }
        </Grid>
        <EnergyDashboardScreenAlert
          isOpened={openedScreenAlertDialog}
          onProceed={this.closeScreenAlertDialog}
          onBack={this.onBack}
        />
      </Grid>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...dialogActions,
      ...newsWeatherActions,
      push,
      getFactsList,
      getLocationEnergyMood,
      getLiveConsumptionInLocationByType,
      getCarbonIntensity,
      getCashbackAmount,
      reportOnActivity,
    }, dispatch),
  };
}

function mapStateToProps(state) {
  return {
    facts: state.facts.data,
    newsWeather: state.newsWeather,
    mood: state.schools.energyMood,
    energyConsumptionData: state.meters.dashboardData,
    activeSchool: state.schools.activeSchool,
    carbonIntensityState: state.carbonIntensity,
    cashbackData: state.cashback,
  };
}

EnergyScreenDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  facts: PropTypes.array,
  newsWeather: PropTypes.object.isRequired,
  cashbackData: PropTypes.object.isRequired,
  mood: PropTypes.object.isRequired,
  energyConsumptionData: PropTypes.array.isRequired,
  carbonIntensityState: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

EnergyScreenDashboard.defaultProps = {
  facts: { text: '' },
};

export default compose(
  withStyles(styles),
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(EnergyScreenDashboard);
