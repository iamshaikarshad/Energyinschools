import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import TextTruncate from 'react-text-truncate';
import classnames from 'classnames';

import { isNil } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import MoreVert from '@material-ui/icons/MoreVert';
import Edit from '@material-ui/icons/Edit';
import ContentCopy from '@material-ui/icons/FilterNone';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import Card from '@material-ui/core/Card';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';

import {
  SMART_THINGS_SENSOR_CAPABILITY,
  SMART_THINGS_SENSOR_CAPABILITY_LABEL,
  UNIT,
  UNIT_TO_LABEL_MAP,
} from '../constants/config';

import { FLOOR_MAPS_URL_QUERY_PARAM } from './FloorsMaps/constants';

import temperatureSensorIcon from '../images/temperature.svg';
import smartThingsLogo from '../images/smt.svg';
import buttonSensorIcon from '../images/button_sensor_white.svg';
import contactSensorIcon from '../images/contact_sensor_white.svg';
import commonSensorIcon from '../images/common_sensor_white.svg';
import motionSensorIcon from '../images/motion_white.svg';
import electricityAvatar from '../images/electricity_filled.svg';

import copyClick from '../utils/copyClick';
import roundToNPlaces from '../utils/roundToNPlaces';

const styles = theme => ({
  cardRoot: {
    width: '100%',
    padding: 0,
    borderRadius: '7px',
    margin: 'auto',
  },
  cardHeaderRoot: {
    padding: theme.spacing(1, 2),
  },
  cardHeaderFont: {
    color: '#fff',
    maxWidth: 160,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
  },
  avatar: {
    borderRadius: 0,
    width: 32,
    height: 32,
    '& img': {
      objectFit: 'fill',
    },
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(0.5),
    padding: 0,
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  button: {
    margin: theme.spacing(1),
  },
  valueContainer: {
    display: 'flex',
    backgroundColor: 'rgba(181, 181, 181, 0.25)',
    height: 60,
    width: '100%',
    borderRadius: '15px',
    flexDirection: 'column',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: '9px',
    padding: 4,
    color: '#b5b5b5',
  },
  value: {
    display: 'flex',
    fontSize: '28px',
  },
  unit: {
    position: 'relative',
    top: '1px',
    fontSize: '14px',
  },
  providerLogo: {
    maxWidth: '60%',
    height: 'auto',
  },
  link: {
    color: 'rgb(0, 188, 212)',
    cursor: 'pointer',
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
      wordBreak: 'break-word',
      whiteSpace: 'normal',
    },
  },
};

class SmartThingsSensor extends React.Component {
  state = {
    anchorEl: null,
    expanded: false,
  };

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  onCopyClick = (textToCopy) => {
    const { showMessageBar } = this.props;
    copyClick(textToCopy, 'Copied Device Label', showMessageBar);
  };

  onMenuEditClick = (onEdit, deviceID) => {
    this.setState({ anchorEl: null });
    onEdit(deviceID);
  };

  onMenuDeleteClick = (onDelete, meterID) => {
    this.setState({ anchorEl: null });
    onDelete(meterID);
  };

  getCardStyle = (capability) => {
    switch (capability) {
      case SMART_THINGS_SENSOR_CAPABILITY.button:
        return {
          cardColour: 'rgb(125, 112, 219)',
          avatarImage: buttonSensorIcon,
          color: 'rgb(255, 255, 255)',
        };
      case SMART_THINGS_SENSOR_CAPABILITY.contactSensor:
        return {
          cardColour: 'rgb(80, 170, 120)',
          avatarImage: contactSensorIcon,
          color: 'rgb(255, 255, 255)',
        };
      case SMART_THINGS_SENSOR_CAPABILITY.motion:
        return {
          cardColour: 'rgba(0, 0, 0, 0.7)',
          avatarImage: motionSensorIcon,
          color: 'rgb(255, 255, 255)',
        };
      case SMART_THINGS_SENSOR_CAPABILITY.temperature:
        return {
          cardColour: 'rgb(255, 124, 0)',
          avatarImage: temperatureSensorIcon,
          color: 'rgb(255, 255, 255)',
        };
      case SMART_THINGS_SENSOR_CAPABILITY.powerMeter:
        return {
          cardColour: '#2699fb',
          avatarImage: electricityAvatar,
          color: 'rgb(255, 255, 255)',
        };
      default:
        return {
          cardColour: 'rgba(0, 0, 0, 0.3)',
          avatarImage: commonSensorIcon,
          color: 'rgb(0, 0, 0)',
        };
    }
  }

  getValueToDisplay = (value, unit) => {
    switch (unit) {
      case UNIT.watt:
        return roundToNPlaces(!isNil(value) ? value / 1000 : value, 2);
      default:
        return roundToNPlaces(value, 1);
    }
  };

  getUnitToDisplay = (unit) => {
    switch (unit) {
      case UNIT.celsius:
        return UNIT_TO_LABEL_MAP[unit];
      case UNIT.watt:
        return UNIT_TO_LABEL_MAP[UNIT.kilowatt];
      default:
        return '';
    }
  };

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleExpandClick = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  render() {
    const {
      classes, sensor, onEditClick, updatedAt, liveBySensor,
    } = this.props;

    const {
      anchorEl, expanded,
    } = this.state;

    const open = Boolean(anchorEl);

    const {
      name, id, device, description, capability,
    } = sensor;

    const { loading, value, unit } = liveBySensor;

    const cardStyle = this.getCardStyle(capability);

    const valueToDisplay = this.getValueToDisplay(value, unit);

    const unitToDisplay = this.getUnitToDisplay(unit);

    return (
      <div>
        <Card
          raised
          classes={{ root: classes.cardRoot }}
        >
          <CardHeader
            classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderFont, subheader: classes.cardHeaderFont }}
            style={{ backgroundColor: cardStyle.cardColour }}
            avatar={
              <Avatar alt="Logo" src={cardStyle.avatarImage} classes={{ root: classes.avatar }} />
            }
            action={(
              <IconButton className={classes.iconButton} onClick={this.handleMenu} style={{ color: 'rgb(255, 255, 255)' }}>
                <MoreVert />
              </IconButton>
            )}
            title={SMART_THINGS_SENSOR_CAPABILITY_LABEL[capability]}
            subheader={moment(updatedAt).format('D MMM, YYYY h:mm A')}
          />
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <List disablePadding>
              <ListItem className={classes.listItem}>
                <div className={classes.valueContainer}>
                  <Typography variant="caption" className={classes.valueLabel}>
                    VALUE
                  </Typography>
                  {loading ? (
                    <CircularProgress size={2} style={{ color: cardStyle.cardColour, height: '40px', width: '40px' }} />
                  ) : (
                    <Typography
                      variant="h4"
                      className={classes.value}
                      style={{ color: cardStyle.cardColour }}
                    >{valueToDisplay} {
                      <Typography
                        className={classes.unit}
                        style={{ color: cardStyle.cardColour }}
                      >
                        {unitToDisplay}
                      </Typography>
                    }
                    </Typography>
                  )
                  }
                </div>
              </ListItem>
              {expanded && (
                <React.Fragment>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      {...listItemTextProps}
                      secondary={device.label}
                      primary="Device label"
                    />
                    <ListItemSecondaryAction>
                      <IconButton className={classes.iconButton} onClick={() => this.onCopyClick(device.label)}>
                        <ContentCopy color="disabled" style={{ fontSize: 20 }} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      {...listItemTextProps}
                      secondary={device.status}
                      primary="Device connection status"
                    />
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      {...listItemTextProps}
                      secondary={name}
                      primary="Name"
                    />
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      {...listItemTextProps}
                      secondary={SMART_THINGS_SENSOR_CAPABILITY_LABEL[capability]}
                      primary="Capability"
                    />
                  </ListItem>
                  {
                    device.room_name && (
                      <ListItem className={classes.listItem}>
                        <ListItemText
                          {...listItemTextProps}
                          secondary={device.room_name}
                          primary="Room name"
                        />
                      </ListItem>
                    )
                  }
                  <ListItem className={classes.listItem}>
                    <ListItemText
                      primaryTypographyProps={listItemTextProps.primaryTypographyProps}
                      secondaryTypographyProps={{
                        ...listItemTextProps.secondaryTypographyProps,
                        component: 'div',
                      }}
                      secondary={(
                        <TextTruncate line={8} element="span" text={description} />
                      )}
                      primary="Details(optional)"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem className={classes.listItem} style={{ paddingRight: 16 }}>
                    <div
                      style={{
                        display: 'flex', justifyContent: 'center', width: '100%',
                      }}
                    >
                      <img alt="Provider logo" src={smartThingsLogo} className={classes.providerLogo} />
                    </div>
                  </ListItem>
                </React.Fragment>
              )}
              <Divider />
              <ListItem
                style={{
                  paddingTop: 0, paddingBottom: 0, paddingRight: 0, justifyContent: 'space-between',
                }}
              >
                <Typography
                  className={classes.link}
                  component={RouterLink}
                  to={{
                    pathname: '/floors-maps',
                    search: `?${FLOOR_MAPS_URL_QUERY_PARAM.resourceId}=${id}`,
                  }}
                >
                  see on floor map
                </Typography>
                <IconButton
                  className={classnames(classes.expand, { [classes.expandOpen]: expanded })}
                  onClick={this.handleExpandClick}
                >
                  <ExpandMore />
                </IconButton>
              </ListItem>
            </List>
          </CardContent>
          <Menu
            id="menu-device"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={this.handleClose}
          >
            <MenuItem onClick={() => this.onMenuEditClick(onEditClick, id)}>
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primary="Edit" />
            </MenuItem>
          </Menu>
        </Card>
      </div>
    );
  }
}

SmartThingsSensor.propTypes = {
  classes: PropTypes.object.isRequired,
  sensor: PropTypes.object.isRequired,
  updatedAt: PropTypes.instanceOf(Date).isRequired,
  showMessageBar: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
  liveBySensor: PropTypes.object,
  onRef: PropTypes.func.isRequired,
};

SmartThingsSensor.defaultProps = {
  onEditClick: () => {},
  liveBySensor: {
    loading: false,
    value: null,
    unit: '',
  },
};

function mapStateToProps(state, ownProps) {
  return {
    liveBySensor: state.smartThingsLiveBySensor[ownProps.sensor.id],
  };
}

export default compose(
  connect(mapStateToProps, null),
  withStyles(styles),
)(SmartThingsSensor);
