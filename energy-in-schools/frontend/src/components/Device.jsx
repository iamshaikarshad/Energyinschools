import React, { Component, Fragment } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'redux';

import {
  difference,
  intersection,
  isEqual,
  isNil,
} from 'lodash';

import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import CardHeader from '@material-ui/core/CardHeader';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import {
  SMART_THINGS_SENSOR_CAPABILITY,
  SMART_THINGS_SENSOR_CAPABILITY_LABEL,
  SMART_THINGS_DEVICE_CONNECTION_STATUS,
} from '../constants/config';

import TruncateTextByItemsCountLimit from './TruncateTextByItemsCount';

import settingsIcon from '../images/device_item_settings.svg';

import colorLightBulpIcon from '../images/devicesIcons/color_light_bulp.png';
import lightBulpIcon from '../images/devicesIcons/light_bulp.png';
import motionSensorIcon from '../images/devicesIcons/motion_sensor_blue.svg';
import contactSensorIcon from '../images/devicesIcons/contact_sensor_blue.svg';
import buttonSensorIcon from '../images/devicesIcons/button_sensor_blue.svg';
import energyMeterIcon from '../images/devicesIcons/energy_meter_blue.svg';
import commonSensorIcon from '../images/devicesIcons/common_sensor_blue.svg';

const SMART_THINGS_DEVICE_DISPLAY_TYPE = Object.freeze({
  colorLamp: 'colorLamp',
  lamp: 'lamp',
  motionSensor: 'motionSensor',
  contactSensor: 'contactSensor',
  button: 'button',
  energyMeter: 'energyMeter',
});

const SMART_THINGS_DEVICE_DISPLAY_TYPE_LABEL = Object.freeze({
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.colorLamp]: 'Color bulb',
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.lamp]: 'Bulb',
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.motionSensor]: 'Motion sensor',
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.contactSensor]: 'Contact sensor',
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.button]: 'Button',
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.energyMeter]: 'Energy meter',
});

const DEVICE_TYPE_DEFINING_CAPABILITIES = [
  SMART_THINGS_SENSOR_CAPABILITY.contactSensor,
  SMART_THINGS_SENSOR_CAPABILITY.motion,
  SMART_THINGS_SENSOR_CAPABILITY.button,
];

const isIntersectionEqualTo = (arr1, arr2, arrToCompare) => isEqual(intersection(arr1, arr2), arrToCompare);

const SMART_THINGS_DEVICE_DETERMINE_TYPE_RULE = Object.freeze({
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.colorLamp]: (capabilities) => {
    const indetifyingCapabilities = [
      SMART_THINGS_SENSOR_CAPABILITY.light,
      SMART_THINGS_SENSOR_CAPABILITY.switchLevel,
      SMART_THINGS_SENSOR_CAPABILITY.colorTemperature,
      SMART_THINGS_SENSOR_CAPABILITY.colorControl,
    ];
    return difference(indetifyingCapabilities, capabilities).length === 0;
  },
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.lamp]: (capabilities) => {
    const indetifyingCapabilities = [
      SMART_THINGS_SENSOR_CAPABILITY.light,
      SMART_THINGS_SENSOR_CAPABILITY.switchLevel,
    ];
    return difference(indetifyingCapabilities, capabilities).length === 0;
  },
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.motionSensor]: capabilities => isIntersectionEqualTo(capabilities, DEVICE_TYPE_DEFINING_CAPABILITIES, [SMART_THINGS_SENSOR_CAPABILITY.motion]),
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.contactSensor]: capabilities => isIntersectionEqualTo(capabilities, DEVICE_TYPE_DEFINING_CAPABILITIES, [SMART_THINGS_SENSOR_CAPABILITY.contactSensor]),
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.button]: capabilities => isIntersectionEqualTo(capabilities, DEVICE_TYPE_DEFINING_CAPABILITIES, [SMART_THINGS_SENSOR_CAPABILITY.button]),
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.energyMeter]: (capabilities) => {
    const indetifyingCapabilities = [
      SMART_THINGS_SENSOR_CAPABILITY.powerMeter,
      SMART_THINGS_SENSOR_CAPABILITY.energyMeter,
    ];
    return difference(indetifyingCapabilities, capabilities).length === 0;
  },
});

const SMART_THINGS_DEVICE_DISPLAY_TYPE_ICON = Object.freeze({
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.colorLamp]: colorLightBulpIcon,
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.lamp]: lightBulpIcon,
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.motionSensor]: motionSensorIcon,
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.contactSensor]: contactSensorIcon,
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.button]: buttonSensorIcon,
  [SMART_THINGS_DEVICE_DISPLAY_TYPE.energyMeter]: energyMeterIcon,
});

const styles = theme => ({
  cardRoot: {
    marginTop: theme.spacing(2),
    width: 260,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
  },
  cardHeaderRoot: {
    padding: '8px 12px',
  },
  cardHeaderAvatar: {
    marginRight: 10,
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  cardSubheader: {
    fontSize: '0.78rem',
  },
  listItem: {
    padding: '4px 12px',
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(0.5),
    padding: 0,
  },
  button: {
    margin: theme.spacing(1),
  },
  tooltip: {
    backgroundColor: '#000',
    borderRadius: '10px',
    pointerEvents: 'none',
    fontSize: 14,
    margin: 0,
    padding: 10,
    fontWeight: 'normal',
    '&:after': {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: '50%',
      marginLeft: '-7px',
      borderWidth: '7px',
      borderStyle: 'solid',
      borderColor: 'black transparent transparent transparent',
    },
  },
  allowedForUseStatusIcon: {
    fontSize: 24,
  },
  allowedUse: {
    color: 'rgb(0, 188, 212)',
  },
  forbiddenUse: {
    color: 'rgb(255, 68, 51)',
  },
});

const listItemTextProps = {
  primaryTypographyProps: {
    color: 'textSecondary',
    style: {
      fontSize: '14px',
    },
  },
  secondaryTypographyProps: {
    color: 'initial',
    style: {
      fontSize: '16px',
    },
  },
};

const MAX_DEVICE_NAME_LENGTH_NO_CUT = 20;

class Device extends Component {
  getAllowedForUseIcon = (allowedForUse) => {
    const { classes } = this.props;
    const IconComponent = allowedForUse ? CheckIcon : ClearIcon;
    const componentClassName = allowedForUse ? classes.allowedUse : classes.forbiddenUse;

    return (
      <IconComponent className={classNames(classes.allowedForUseStatusIcon, componentClassName)} />
    );
  }

  getConnectionStatusDisplayStyle = (status) => {
    switch (status) {
      case SMART_THINGS_DEVICE_CONNECTION_STATUS.ONLINE:
        return { color: 'rgb(0, 188, 212)', backgroundColor: 'rgba(0, 189, 214, 0.1)' };
      case SMART_THINGS_DEVICE_CONNECTION_STATUS.OFFLINE:
        return { color: 'rgb(255, 68, 51)', backgroundColor: 'rgba(255, 68, 51, 0.1)' };
      default:
        return { color: 'rgba(0, 0, 0, 0.87)', backgroundColor: 'rgba(84, 84, 84, 0.05)' };
    }
  }

  // batteryHealth can only be integer number (range 0-100)
  getDeviceBatteryHealthDisplayStyle = (batteryHealth) => {
    if (batteryHealth <= 10) {
      return { color: 'rgb(255, 68, 51)', backgroundColor: 'rgba(255, 68, 51, 0.1)' };
    }
    if (batteryHealth <= 25) {
      return { color: 'rgb(255, 188, 51)', backgroundColor: 'rgba(255, 190, 51, 0.1)' };
    }
    return { color: 'rgb(0, 188, 212)', backgroundColor: 'rgba(0, 189, 214, 0.1)' };
  }

  getCapabilitiesDisplayValues = deviceCapabilities => deviceCapabilities.map(item => SMART_THINGS_SENSOR_CAPABILITY_LABEL[item.capability] || item.capability);

  getDeviceType = (deviceCapabilities = []) => {
    const capabilities = deviceCapabilities.map(item => item.capability);
    return Object.keys(SMART_THINGS_DEVICE_DETERMINE_TYPE_RULE).reduce((res, typeRule) => {
      if (isNil(res) && SMART_THINGS_DEVICE_DETERMINE_TYPE_RULE[typeRule](capabilities)) {
        return typeRule;
      }
      return res;
    }, null);
  }

  render() {
    const {
      classes,
      name,
      roomName,
      deviceCapabilities,
      id,
      allowedForUse,
      readOnly,
      updatedAt,
      batteryHealth,
      connectionStatus,
      onEditClick,
      onAllowedSwitch,
      onUpdatedSize,
    } = this.props;

    const deviceType = this.getDeviceType(deviceCapabilities);

    const statusDisplayStyle = this.getConnectionStatusDisplayStyle(connectionStatus.status);
    const deviceBatteryHealthStyle = this.getDeviceBatteryHealthDisplayStyle(batteryHealth);

    return (
      <div>
        <Card raised classes={{ root: classes.cardRoot }} style={{ opacity: 1 }}>
          <CardHeader
            classes={{
              root: classes.cardHeaderRoot,
              subheader: classes.cardSubheader,
              avatar: classes.cardHeaderAvatar,
            }}
            avatar={
              <Avatar src={SMART_THINGS_DEVICE_DISPLAY_TYPE_ICON[deviceType] || commonSensorIcon} style={{ width: 40, height: 38, borderRadius: 0 }} />
            }
            action={!readOnly && (
              <IconButton className={classes.iconButton} onClick={onEditClick}>
                <Avatar src={settingsIcon} alt="Menu item" style={{ width: 20, height: 20 }} />
              </IconButton>
            )}
            title={name.length > MAX_DEVICE_NAME_LENGTH_NO_CUT ? (
              <Tooltip
                title={name}
                placement="top"
                classes={{ tooltip: classes.tooltip }}
                interactive // it allows to select text in tooltip (tooltip doesn't disappear on it's node click)
                disableFocusListener
                disableTouchListener
              >
                <Typography style={{ maxWidth: 150 }} variant="body2" noWrap>{name}</Typography>
              </Tooltip>
            ) : (
              name
            )}
            subheader={(
              <Fragment>
                <span>Last updated</span>
                <br />
                <span style={{ display: 'inline-block', marginLeft: 8 }}>
                  {!isNil(updatedAt) ? moment(updatedAt).format('D MMM YYYY, h:mm a') : 'N/A'}
                </span>
              </Fragment>
            )}
          />
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <List disablePadding>
              <ListItem className={classes.listItem} style={{ backgroundColor: statusDisplayStyle.backgroundColor }}>
                <ListItemText
                  {...listItemTextProps}
                  secondaryTypographyProps={{
                    style: {
                      fontSize: 14,
                      fontWeight: 500,
                      color: statusDisplayStyle.color,
                    },
                  }}
                  secondary={SMART_THINGS_DEVICE_CONNECTION_STATUS[connectionStatus.status]}
                  primary="Connection status"
                />
              </ListItem>
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondaryTypographyProps={{
                    color: allowedForUse ? 'primary' : 'textSecondary',
                    style: {
                      fontSize: '16px',
                      fontWeight: 500,
                    },
                  }}
                  secondary={this.getAllowedForUseIcon(allowedForUse)}
                  primary="Allowed for use"
                />
              </ListItem>
              {roomName && (
                <ListItem className={classes.listItem}>
                  <ListItemText
                    {...listItemTextProps}
                    secondary={roomName}
                    primary="Room name"
                  />
                </ListItem>
              )
              }
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondary={SMART_THINGS_DEVICE_DISPLAY_TYPE_LABEL[deviceType]}
                  primary="Device type"
                />
              </ListItem>
              {batteryHealth && (
                <ListItem className={classes.listItem} style={{ backgroundColor: deviceBatteryHealthStyle.backgroundColor }}>
                  <ListItemText
                    {...listItemTextProps}
                    secondaryTypographyProps={{
                      style: {
                        fontSize: 14,
                        fontWeight: 500,
                        color: deviceBatteryHealthStyle.color,
                      },
                    }}
                    secondary={`${batteryHealth} %`}
                    primary="Battery"
                  />
                </ListItem>
              )}
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondaryTypographyProps={{
                    ...listItemTextProps.secondaryTypographyProps,
                    component: 'div',
                  }}
                  secondary={(
                    <TruncateTextByItemsCountLimit
                      items={this.getCapabilitiesDisplayValues(deviceCapabilities)}
                      onUpdated={onUpdatedSize}
                    />
                  )}
                  primary="Device capabilities"
                />
              </ListItem>
              {!readOnly && (
                <div>
                  <Divider />
                  <ListItem
                    className={classes.listItem}
                    style={{ paddingTop: 8, paddingBottom: 8 }}
                  >
                    <ListItemText
                      {...listItemTextProps}
                      secondary="Allow device for use"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={allowedForUse}
                        color="primary"
                        onClick={() => onAllowedSwitch(id)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </div>
              )}
            </List>
          </CardContent>
        </Card>
      </div>
    );
  }
}

Device.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
  allowedForUse: PropTypes.bool.isRequired,
  updatedAt: PropTypes.string,
  roomName: PropTypes.string,
  deviceCapabilities: PropTypes.array,
  connectionStatus: PropTypes.shape({
    status: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
  }).isRequired,
  batteryHealth: PropTypes.number,

  showMessageBar: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
  onAllowedSwitch: PropTypes.func,
  onUpdatedSize: PropTypes.func,
};

Device.defaultProps = {
  updatedAt: moment().format(),
  deviceCapabilities: [],
  roomName: '',
  batteryHealth: '',
  onEditClick: () => {},
  onAllowedSwitch: () => {},
  onUpdatedSize: () => {},
};

export default compose(withStyles(styles))(Device);
