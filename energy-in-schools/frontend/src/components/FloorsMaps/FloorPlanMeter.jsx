import React, { PureComponent } from 'react';

import moment from 'moment';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import { Rnd } from 'react-rnd';

import Typography from '@material-ui/core/Typography';
import { Grid, RootRef } from '@material-ui/core';

import { getAvgValuePerPeriod } from './utils';

import {
  UNIT_TO_LABEL_MAP,
  SENSOR_TYPE_LABEL,
} from '../../constants/config';
import {
  DISABLE_RESIZING,
  METER_UNITS,
} from './constants';

import microbitAvatar from '../../images/microbit_mini.svg';

import truncateText from '../../utils/truncateText';

const styles = {
  rndMeterWrapper: {
    display: 'inline-flex !important',
    flexDirection: 'column',
    alignItems: 'center',
    borderColor: 'rgb(192, 192, 192)',
    borderStyle: 'solid',
    padding: '5px',
  },
  avatarImage: {
    height: 17,
    width: 17,
  },
  increasedAvatarImage: {
    height: 20,
    width: 20,
  },
  meterName: {
    fontSize: 12,
    marginBottom: '5px',
    textAlign: 'center',
    userSelect: 'none',
    wordWrap: 'break-word',
    width: '100%', // important: for correct cross-browser text breaking
  },
  meterProvider: {
    userSelect: 'none',
  },
  meterValue: {
    fontSize: 16,
    lineHeight: '16px',
    display: 'inline-flex',
    marginBottom: '5px',
    marginTop: '5px',
    justifyContent: 'center',
    userSelect: 'none',
  },
  meterValueUnit: {
    marginLeft: 2,
  },
  meterUnitValue: {
    fontSize: 10,
    paddingLeft: 2,
  },

  meterExtendedInfo: {
    padding: 0,
    borderRadius: 10,
  },
  tooltipPopper: {
    opacity: 1,
  },
  smallMeterValue: {
    fontSize: 8,
    lineHeight: '8px',
    display: 'inline-flex',
    justifyContent: 'center',
    textOverflow: 'ellipsis',
    userSelect: 'none',
  },
  meterGradient: {
    display: 'inline-block',
    height: '150%',
    width: '150%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
  },
  resourceState: {
    fontSize: 10,
  },
  smallResourceState: {
    fontSize: 7,
  },
  alertWrapper: {
    color: 'rgb(255, 0, 0)',
    fontWeight: 700,
    display: 'inline-block',
    marginLeft: 2,
  },
  temperatureSensor: {
    position: 'relative',
    zIndex: 10,
  },
};


const MAX_NAME_LENGTH = 27;

class FloorPlanMeter extends PureComponent {
  mounted = false;

  currentTime = null;

  meterContainerRef = React.createRef();

  onMouseDown = () => {
    this.currentTime = moment().valueOf();
  }

  getUnitLabel = (meterName) => {
    const type = meterName.trim();
    switch (type) {
      case SENSOR_TYPE_LABEL.TEMPERATURE:
        return UNIT_TO_LABEL_MAP.celsius;
      default:
        return '';
    }
  }

  getHeatColor = (temp) => {
    let color = '';
    if (temp > 22) {
      color = '246, 34, 19';
    } else if (temp > 17 && temp < 22) {
      color = '19, 246, 87';
    } else if (temp > 14 && temp < 18) {
      color = '19, 155, 246';
    } else if (temp < 15) {
      color = '19, 87, 246';
    }
    return color;
  }

  render() {
    const {
      classes,
      meterData,
      meterId,
      size,
      position,
      name,
      bounds,
      onDragStop,
      onDragStart,
      onResize,
      isMapInstance,
      disableDragging,
      sensorStartTime,
      historyValue,
      periodDuration,
      inFolder,
      sensorType,
    } = this.props;
    const unit = this.getUnitLabel(sensorType);

    const cardStyle = {
      cardColour: '#2699fb',
      avatarImage: microbitAvatar,
      unit: UNIT_TO_LABEL_MAP.kilowatt,
      color: 'rgb(255, 255, 255)',
    };

    const valueToDisplay = historyValue === null ? (
      Math.round(meterData.slice(-1)[0].value * 100) / 100
    ) : (
      getAvgValuePerPeriod(meterData, sensorStartTime, historyValue, periodDuration)
    );

    return (
      <RootRef rootRef={this.meterContainerRef}>
        <Rnd
          id={meterId}
          className={classes.rndMeterWrapper}
          size={size}
          position={position}
          minWidth={inFolder ? METER_UNITS.folder_width : 50}
          minHeight={inFolder ? METER_UNITS.folder_height : 50}
          maxWidth={300}
          maxHeight={113}
          bounds={bounds}
          disableDragging={disableDragging}
          enableResizing={DISABLE_RESIZING}
          onDragStop={onDragStop}
          onDragStart={onDragStart}
          onResizeStop={onResize}
          onMouseDown={this.onMouseDown}
          style={{
            justifyContent: !inFolder ? 'space-between' : 'center',
            backgroundColor: cardStyle.cardColour,
            borderRadius: isMapInstance || inFolder ? '50%' : 10,
          }}
        >
          {!inFolder ? (
            <Typography
              className={classes.avatarWrapper}
              style={{
                textAlign: isMapInstance ? 'center' : 'left',
                marginTop: isMapInstance ? 3 : 0,
              }}
            >
              <img
                src={cardStyle.avatarImage}
                className={classes.avatarImage}
                alt="meter"
              />
            </Typography>
          ) : null}
          {!isMapInstance && !inFolder && (
            <Typography className={classes.meterName}>
              {truncateText(name, MAX_NAME_LENGTH)}
            </Typography>
          )}
          {inFolder && (
            <Typography
              component="div"
              className={!inFolder ? classes.meterValue : classes.smallMeterValue}
              style={{ color: cardStyle.color }}
            >
              {name}
            </Typography>
          )}
          <Grid
            container
            justify="center"
            alignItems="center"
          >
            <Typography
              component="div"
              className={!inFolder ? classes.meterValue : classes.smallMeterValue}
              style={{ color: cardStyle.color }}
            >
              {valueToDisplay}
            </Typography>
            <Typography
              component="div"
              className={!inFolder ? classes.meterUnitValue : classes.smallMeterValue}
              style={{ color: cardStyle.color }}
            >
              {unit}
            </Typography>
          </Grid>
        </Rnd>
      </RootRef>
    );
  }
}

FloorPlanMeter.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  meterId: PropTypes.string,
  meterData: PropTypes.array.isRequired,
  size: PropTypes.object,
  position: PropTypes.object,
  bounds: PropTypes.string,
  isMapInstance: PropTypes.bool,
  onDragStop: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onResize: PropTypes.func,
  disableDragging: PropTypes.bool,
  sensorStartTime: PropTypes.object.isRequired,
  historyValue: PropTypes.number,
  periodDuration: PropTypes.number,
  inFolder: PropTypes.bool,
  sensorType: PropTypes.string,
};

FloorPlanMeter.defaultProps = {
  size: { width: '100%', height: '100%' },
  position: { x: 0, y: 0 },
  bounds: '',
  meterId: '',
  isMapInstance: false,
  disableDragging: false,
  historyValue: null,
  periodDuration: null,
  inFolder: false,
  sensorType: '',
  onResize: () => {},
};

export default withStyles(styles)(FloorPlanMeter);
