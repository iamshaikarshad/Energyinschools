import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import TextTruncate from 'react-text-truncate';

import { isNil, isEmpty } from 'lodash';

import { withStyles } from '@material-ui/core/styles';
import MoreVert from '@material-ui/icons/MoreVert';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
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

import * as energyResourcesActions from '../actions/energyResourcesActions';

import {
  CHAMELEON,
  DUMMY,
  METER_TYPE,
  METER_TYPE_LABEL,
  ENERGY_ASSETS,
  GEO,
  N3RGY,
  OVO,
  HILDEBRAND,
  RESOURCE_CHILD_TYPE,
  SMART_THINGS_SENSOR_CAPABILITY_LABEL,
} from '../constants/config';

import roundToNPlaces from '../utils/roundToNPlaces';

import gasMeterAvatar from '../images/gas_white.svg';
import electricityMeterAvatar from '../images/electric_white.svg';
import solarMeterAvatar from '../images/solar_white.svg';
import smartPlugAvatar from '../images/smart_plug_white.svg';
import questionIcon from '../images/question_mark_white_icon.svg';

import ovoLogo from '../images/energyProviders/ovo_logo.png';
import geoLogo from '../images/energyProviders/geo_logo.png';
import dummyLogo from '../images/energyProviders/dummy_provider_logo.png';
import n3rgyLogo from '../images/energyProviders/n3rgy_logo.png';
import chameleonLogo from '../images/energyProviders/chameleon_logo.png';
import energyAssetsLogo from '../images/energyProviders/energy_assets_logo.png';
import smartThingsLogo from '../images/smt.svg';

import copyClick from '../utils/copyClick';

const styles = theme => ({
  cardRoot: {
    width: 260,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
  },
  cardHeaderRoot: {
    padding: theme.spacing(1, 2),
  },
  cardHeaderFont: {
    color: '#fff',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  },
  avatar: {
    borderRadius: 0,
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
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  button: {
    margin: theme.spacing(1),
  },
  meterValueContainer: {
    display: 'flex',
    backgroundColor: 'rgba(181, 181, 181, 0.25)',
    height: 70,
    width: '100%',
    borderRadius: '15px',
    flexDirection: 'column',
    alignItems: 'center',
  },
  meterValueLabel: {
    fontSize: '9px',
    padding: 4,
    color: '#b5b5b5',
  },
  meterValue: {
    display: 'flex',
    fontSize: '35px',
  },
  meterValueUnit: {
    position: 'relative',
    top: '4px',
    fontSize: '14px',
  },
  providerLogo: {
    maxWidth: '50%',
    height: 'auto',
  },
  capitalized: {
    textTransform: 'capitalize',
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
      wordBreak: 'break-all',
      whiteSpace: 'normal',
    },
  },
};

const PROVIDER_TO_LOGO_MAP = Object.freeze({
  [OVO]: ovoLogo,
  [GEO]: geoLogo,
  [N3RGY]: n3rgyLogo,
  [CHAMELEON]: chameleonLogo,
  [ENERGY_ASSETS]: energyAssetsLogo,
  [DUMMY]: dummyLogo,
  [HILDEBRAND]: dummyLogo, // TODO: Change logo to another
});

const DEFAULT_CARD_STYLE = Object.freeze({
  cardColour: 'rgba(0, 0, 0, 1)',
  avatarImage: questionIcon,
  unit: '',
  providerLogo: '',
});

const TYPE_TO_CARD_STYLE_MAP = Object.freeze({
  [METER_TYPE.electricity]: {
    cardColour: '#2699fb',
    avatarImage: electricityMeterAvatar,
    unit: 'kW',
  },
  [METER_TYPE.gas]: {
    cardColour: '#f38f31',
    avatarImage: gasMeterAvatar,
    unit: 'kW',
  },
  [METER_TYPE.solar]: {
    cardColour: '#ffbb3c',
    avatarImage: solarMeterAvatar,
    unit: 'kW',
  },
  [METER_TYPE.smartPlug]: {
    cardColour: 'rgb(3, 188, 245)',
    avatarImage: smartPlugAvatar,
    unit: 'kW',
  },
  [METER_TYPE.unknown]: {
    cardColour: 'rgba(0, 0, 0, 0.7)',
    avatarImage: questionIcon,
    unit: 'kW',
  },
});

class Meter extends React.Component {
  state = {
    anchorEl: null,
    loading: false,
    value: null,
  };

  componentDidMount() {
    this.getLiveValue();
  }

  componentDidUpdate(prevProps, prevState) {
    const { updatedAt } = this.props;
    if (!prevState.loading && moment(prevProps.updatedAt).unix() !== moment(updatedAt).unix()) {
      this.getLiveValue();
    }
  }

  onCopyClick = (textToCopy) => {
    const { showMessageBar } = this.props;
    copyClick(textToCopy, 'Copied Meter ID', showMessageBar);
  };

  onMenuEditClick = (onEdit, deviceID) => {
    this.setState({ anchorEl: null });
    onEdit(deviceID);
  };

  onMenuDeleteClick = (onDelete, meterID) => {
    this.setState({ anchorEl: null });
    onDelete(meterID);
  };

  getProviderLogo = () => {
    const { childType, provider } = this.props;
    if (childType === RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER) return smartThingsLogo;
    return PROVIDER_TO_LOGO_MAP[provider] || '';
  };

  getCardStyle = () => {
    const { type } = this.props;
    const providerLogo = this.getProviderLogo();

    const baseCardStyle = TYPE_TO_CARD_STYLE_MAP[type] || DEFAULT_CARD_STYLE;

    return { ...baseCardStyle, providerLogo };
  };

  getLiveValue = () => { // TODO: move it to API calls
    const { id, actions } = this.props;
    this.setState({ loading: true });
    actions.getResourceLiveValue(id)
      .then((data) => {
        this.setState({ loading: false, value: data.value });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  getSmartThingsDataDetails = () => {
    const { smartThingsData } = this.props;
    if (isNil(smartThingsData)) return [];
    const { capability, device } = smartThingsData;
    const { label, name } = device;
    return [
      {
        name: 'Capability',
        value: SMART_THINGS_SENSOR_CAPABILITY_LABEL[capability] || capability,
      },
      {
        name: 'Device label',
        value: label || name,
      },
    ];
  };

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const {
      classes, id, type, name, meterId, description, onEditClick, onDeleteClick, updatedAt, deleteAllowed,
    } = this.props;

    const {
      anchorEl, loading, value,
    } = this.state;
    const open = Boolean(anchorEl);

    const cardStyle = this.getCardStyle();

    const smartThingsDataDetails = this.getSmartThingsDataDetails();

    return (
      <div>
        <Card raised classes={{ root: classes.cardRoot }}>
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
            title={name}
            subheader={moment(updatedAt).format('D MMM, YYYY h:mm A')}
          />
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <List disablePadding>
              <ListItem className={classes.listItem}>
                <div className={classes.meterValueContainer}>
                  <Typography variant="caption" className={classes.meterValueLabel}>
                    VALUE ({cardStyle.unit})
                  </Typography>
                  {loading ? (
                    <CircularProgress size={2} style={{ color: cardStyle.cardColour, height: '40px', width: '40px' }} />
                  ) : (
                    <Typography
                      variant="h4"
                      className={classes.meterValue}
                      style={{ color: cardStyle.cardColour }}
                    >{roundToNPlaces(!isNil(value) ? value / 1000 : value, 1)} {
                      <Typography
                        className={classes.meterValueUnit}
                        style={{ color: cardStyle.cardColour }}
                      >{cardStyle.unit}
                      </Typography>
                    }
                    </Typography>
                  )
                  }
                </div>
              </ListItem>
              {meterId && (
                <ListItem className={classes.listItem}>
                  <ListItemText
                    {...listItemTextProps}
                    secondary={meterId}
                    primary="Meter ID"
                  />
                  <ListItemSecondaryAction>
                    <IconButton className={classes.iconButton} onClick={() => this.onCopyClick(meterId)}>
                      <ContentCopy color="disabled" style={{ fontSize: 20 }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  classes={{
                    secondary: classes.capitalized,
                  }}
                  secondary={METER_TYPE_LABEL[type] || type}
                  primary="Meter Type"
                />
              </ListItem>
              {!isEmpty(smartThingsDataDetails) && (
                <React.Fragment>
                  {smartThingsDataDetails.map(detail => (
                    detail.value ? (
                      <ListItem key={detail.name} className={classes.listItem}>
                        <ListItemText
                          {...listItemTextProps}
                          primary={detail.name}
                          secondary={detail.value}
                        />
                      </ListItem>
                    )
                      : null
                  ))}
                </React.Fragment>
              )}
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
              <ListItem className={classes.listItem}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'center', width: '100%',
                  }}
                >
                  <img alt="Provider logo" src={cardStyle.providerLogo} className={classes.providerLogo} />
                </div>
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
            {deleteAllowed && (
              <MenuItem onClick={() => this.onMenuDeleteClick(onDeleteClick, id)}>
                <ListItemIcon style={{ color: '#c13829' }}>
                  <Delete />
                </ListItemIcon>
                <ListItemText
                  style={{ paddingLeft: 0 }}
                  primaryTypographyProps={{ style: { color: '#c13829' } }}
                  primary="Delete"
                />
              </MenuItem>
            )}
          </Menu>
        </Card>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...energyResourcesActions,
    }, dispatch),
  };
}

Meter.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  meterId: PropTypes.string,
  type: PropTypes.string.isRequired,
  childType: PropTypes.string.isRequired,
  smartThingsData: PropTypes.object,
  deleteAllowed: PropTypes.bool,
  provider: PropTypes.string,
  description: PropTypes.string,
  updatedAt: PropTypes.instanceOf(Date).isRequired,

  showMessageBar: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
};

Meter.defaultProps = {
  meterId: '',
  provider: '',
  description: '',
  smartThingsData: null,
  deleteAllowed: false,
  onEditClick: () => {
  },
  onDeleteClick: () => {
  },
};

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
)(Meter);
