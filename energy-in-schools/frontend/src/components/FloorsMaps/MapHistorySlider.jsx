import 'rc-slider/assets/index.css';

import React from 'react';
import moment from 'moment';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Slider from 'rc-slider';
import { withStyles } from '@material-ui/core/styles';

import HistoryPlayButton from './HistoryPlayButton';

import {
  FLOORS_MAPS_BG_DARK_COLOR,
  FLOORS_MAPS_TEXT_COLOR,
  PLAY_STEP_INTERVAL,
} from './constants';

const styles = theme => ({
  mapHistorySliderWrapper: {
    display: 'flex',
    width: '100%',
    margin: '35px 50px 15px 25px',
    [theme.breakpoints.down('sm')]: {
      margin: '30px 25px 0px',
      flexDirection: 'column-reverse',
    },
  },
  historyPlayButtonWrapper: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 65,
    },
  },
  historyPlayButton: {
    padding: 4,
    marginRight: 40,
    position: 'relative',
    bottom: 16,
    borderRadius: 10,
    minWidth: 48,
    backgroundColor: FLOORS_MAPS_BG_DARK_COLOR,
    color: FLOORS_MAPS_TEXT_COLOR,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      minWidth: 36,
    },
  },
});

const dotStyle = {
  borderColor: 'rgba(255, 255, 255, 0.3)',
  height: 18,
  width: 18,
  bottom: '-7px',
};

const activeDotStyle = {
  borderColor: 'rgba(255, 255, 255, 0.87)',
};

const handleStyle = {
  borderWidth: 4,
  height: 20,
  width: 20,
  marginLeft: -5,
  marginTop: -8,
  backgroundColor: 'rgb(0, 188, 212)',
};

const DEFAULT_SLIDER_STEP = 10;

const SECONDS_IN_DAY = 86400;

const HOURS_TIME_FORMAT = 'H:mm:ss';
const DAYS_TIME_FORMAT = 'MMM DD';

const MARK_STYLE = {
  fontFamily: 'Roboto',
  color: 'rgba(255, 255, 255, 0.87)',
  marginTop: 5,
};

class MapHistorySlider extends React.Component {
  state = {
    value: 100,
  };

  historyPlayInterval = null;

  componentDidMount() {
    const { minValue } = this.props;
    this.setDefaultValue(minValue);
  }

  componentWillUnmount() {
    clearInterval(this.historyPlayInterval);
  }

  onSliderChange = (value) => {
    const { updateValue } = this.props;
    this.setState({ value });
    updateValue(value);
  };

  onPlayButtonClick = (playing) => {
    if (playing) {
      this.historyPlayInterval = setInterval(this.playHandler, PLAY_STEP_INTERVAL);
    } else {
      clearInterval(this.historyPlayInterval);
    }
  };

  getLabel = (value, nextValue = null) => {
    const { stepValue, minValue, maxValue } = this.props;
    const date = this.formatTime(value + Math.round(stepValue / 2), DAYS_TIME_FORMAT);
    const nextDate = nextValue && this.formatTime(nextValue + Math.round(stepValue / 2), DAYS_TIME_FORMAT);
    const midValueHourFormat = this.formatTime(value + Math.round(stepValue / 2), HOURS_TIME_FORMAT);
    return (
      <span>
        {(maxValue - minValue) / SECONDS_IN_DAY < 7 && (
          <span className="map-history-slider-hour">{midValueHourFormat}<br /></span>
        )}
        { (value === maxValue - stepValue || ((maxValue - minValue) / SECONDS_IN_DAY > 1) || !nextDate || nextDate !== date) && (
          <span>
            <span className="map-history-slider-hour">{date}</span>
          </span>
        )}
      </span>
    );
  };

  getMarks = (min, max, step) => {
    const marks = {};
    let value = max - step;
    let nextValue = value - step;
    while (value > min || Math.abs(value - min) < 0.005) {
      const hasNextValue = (nextValue < min && Math.abs(nextValue - min) > 0.005) ? null : nextValue;
      marks[value] = { label: this.getLabel(value, hasNextValue), style: MARK_STYLE };
      value -= step;
      nextValue -= step;
    }
    return marks;
  };

  setDefaultValue = (defaultValue) => {
    this.setState({ value: defaultValue });
  };

  playHandler = () => {
    const {
      minValue, maxValue, stepValue, updateValue,
    } = this.props;
    const { value } = this.state;
    const newValue = (value + stepValue <= maxValue) ? value + stepValue : minValue;
    updateValue(newValue);
    this.setState({ value: newValue });
  };

  formatTime = (ts, format) => moment.unix(ts).format(format);

  render() {
    const {
      classes,
      minValue,
      maxValue,
      stepValue,
    } = this.props;

    const { value } = this.state;

    return (
      <div id="map-history-slider" className={`${classes.mapHistorySliderWrapper} mapHistorySlider`}>
        <div className={classes.historyPlayButtonWrapper}>
          <HistoryPlayButton className={classes.historyPlayButton} onClick={this.onPlayButtonClick} />
        </div>
        <Slider
          dots
          step={stepValue}
          min={minValue}
          max={maxValue - stepValue}
          defaultValue={minValue}
          value={value}
          dotStyle={dotStyle}
          marks={this.getMarks(minValue, maxValue, stepValue)}
          activeDotStyle={activeDotStyle}
          onChange={this.onSliderChange}
          trackStyle={{ backgroundColor: 'transparent', height: 20 }}
          handleStyle={handleStyle}
        />
      </div>
    );
  }
}

MapHistorySlider.propTypes = {
  classes: PropTypes.object.isRequired,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  stepValue: PropTypes.number,
  updateValue: PropTypes.func.isRequired,
};

MapHistorySlider.defaultProps = {
  minValue: 0,
  maxValue: 100,
  stepValue: DEFAULT_SLIDER_STEP,
};

export default compose(withStyles(styles))(MapHistorySlider);
