import React from 'react';
import moment from 'moment';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVert from '@material-ui/icons/MoreVert';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';

import {
  ELECTRICITY,
  GAS,
  SOLAR,
  GEO,
  OVO,
  DUMMY,
  N3RGY,
  CHAMELEON,
  HILDEBRAND,
  ENERGY_ASSETS,
  PROVIDER_TYPE_LABELS,
} from '../constants/config';

import gasMeterAvatar from '../images/gas.png';
import electricityMeterAvatar from '../images/electric.png';
import solarMeterAvatar from '../images/solar.svg';
import ovoLogo from '../images/energyProviders/ovo_logo.png';
import geoLogo from '../images/energyProviders/geo_logo.png';
import energyAssetsLogo from '../images/energyProviders/energy_assets_logo.png';
import chameleonLogo from '../images/energyProviders/chameleon_logo.png';
import n3rgyLogo from '../images/energyProviders/n3rgy_logo.png';
import dummyLogo from '../images/energyProviders/dummy_provider_logo.png';


const styles = theme => ({
  cardRoot: {
    width: 260,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    padding: theme.spacing(0.5, 2),
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: '#b5b5b5',
    padding: 0,
  },
  addMeterButton: {
    fontSize: 14,
    fontWeight: 500,
  },
  registrationDate: {
    fontSize: '13px',
    color: '#b5b5b5',
    fontWeight: 500,
  },
  providerName: {
    padding: 5,
    fontSize: '14px',
    color: '#555555',
    fontWeight: 500,
  },
  locationListItem: {
    display: 'inline-block',
    width: '100%',
    '&:not(:last-child)': {
      marginBottom: 5,
    },
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

const ResourceLogo = ({ type }) => {
  let avatarImage,
    lineColour;

  switch (type) {
    case ELECTRICITY:
      lineColour = '#00bcd4';
      avatarImage = electricityMeterAvatar;
      break;
    case GAS:
      lineColour = '#f38f31';
      avatarImage = gasMeterAvatar;
      break;
    case SOLAR:
      lineColour = '#ffbb3c';
      avatarImage = solarMeterAvatar;
      break;
    default:
      throw new Error('Unhandled meter type');
  }

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs>
        <Divider style={{ backgroundColor: lineColour }} />
      </Grid>
      <Grid item xs={2} style={{ display: 'flex', justifyContent: 'center', margin: '0px 3px' }}>
        <Avatar alt="Logo" src={avatarImage} style={{ height: 36, width: 36, borderRadius: 0 }} />
      </Grid>
      <Grid item xs>
        <Divider style={{ backgroundColor: lineColour }} />
      </Grid>
    </Grid>
  );
};

ResourceLogo.propTypes = {
  type: PropTypes.string.isRequired,
};

const ResourceData = ({
  classes, type, metersCount, sublocations,
}) => (
  <React.Fragment>
    <ListItem className={classes.listItem} style={{ paddingLeft: '0px', paddingRight: '0px' }}>
      <ResourceLogo type={type} />
    </ListItem>
    <ListItem className={classes.listItem}>
      <ListItemText
        {...listItemTextProps}
        secondary={metersCount}
        primary="Number of meters"
      />
    </ListItem>
    <ListItem className={classes.listItem}>
      <ListItemText
        {...listItemTextProps}
        secondaryTypographyProps={{ color: 'initial', style: { whiteSpace: 'pre-wrap', fontSize: '16px', wordBreak: 'break-word' } }}
        secondary={sublocations.map(location => (<span key={`${location}_${type}`} className={classes.locationListItem}>{location}</span>))}
        primary="Buildings"
      />
    </ListItem>
  </React.Fragment>
);

ResourceData.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  metersCount: PropTypes.number.isRequired,
  sublocations: PropTypes.array.isRequired,
};

class Provider extends React.Component {
  state = {
    anchorEl: null,
  };

  componentDidMount() {
    const { type, name } = this.props;
    // eslint-disable-next-line no-console
    if (type === DUMMY) console.warn(`Dummy providers are deprecated. Please remove "${name}" provider!`);
  }

  onMenuEditClick = (onEdit, deviceID) => {
    this.setState({ anchorEl: null });
    onEdit(deviceID);
  };

  onMenuDeleteClick = (onDelete, meterID) => {
    this.setState({ anchorEl: null });
    onDelete(meterID);
  };

  getProviderContent = (providerName, meters, locations) => {
    let providerLogo = '';
    switch (providerName) {
      case OVO:
        providerLogo = ovoLogo; break;
      case GEO:
        providerLogo = geoLogo; break;
      case N3RGY:
        providerLogo = n3rgyLogo; break;
      case CHAMELEON:
        providerLogo = chameleonLogo; break;
      case ENERGY_ASSETS:
        providerLogo = energyAssetsLogo; break;
      case HILDEBRAND:
        providerLogo = dummyLogo; break; // TODO: change logo to another
      case DUMMY:
        providerLogo = dummyLogo; break;
      default:
        providerLogo = '';
    }

    return {
      providerLogo,
      ...meters[GAS].length !== 0 && {
        GAS: {
          metersCount: meters[GAS].length,
          locations: [...locations[GAS]].map(location => location && location.name),
        },
      },
      ...meters[ELECTRICITY].length !== 0 && {
        ELECTRICITY: {
          metersCount: meters[ELECTRICITY].length,
          locations: [...locations[ELECTRICITY]].map(location => location && location.name),
        },
      },
      ...meters[SOLAR].length !== 0 && {
        SOLAR: {
          metersCount: meters[SOLAR].length,
          locations: [...locations[SOLAR]].map(location => location && location.name),
        },
      },
    };
  };

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const {
      classes, id, createdAt, meters, locations, name, type, onNewMeterClick, onEditClick, onDeleteClick,
    } = this.props;

    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const providerContent = this.getProviderContent(type, meters, locations);

    return (
      <div>
        <Card raised classes={{ root: classes.cardRoot }}>
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <List disablePadding>
              <ListItem className={classes.listItem} style={{ justifyContent: 'center', paddingRight: 0 }}>
                <Typography className={classes.registrationDate}>REGISTRATION DATE: {moment(createdAt).format('MM/DD/YYYY')}</Typography>
                <IconButton className={classes.iconButton} onClick={this.handleMenu}>
                  <MoreVert />
                </IconButton>
              </ListItem>
              <Divider />
              <ListItem className={classes.listItem} style={{ justifyContent: 'center', flexDirection: 'column' }}>
                <Typography className={classes.providerName}>{name}</Typography>
                <Typography className={classes.providerName}>{PROVIDER_TYPE_LABELS[type]}</Typography>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <img alt="Provider logo" src={providerContent.providerLogo} />
                </div>
              </ListItem>
              {[ELECTRICITY, GAS, SOLAR].map(meterType => (
                providerContent[meterType] && (
                  <ResourceData
                    key={`${id}_${meterType}`}
                    type={meterType}
                    classes={classes}
                    metersCount={providerContent[meterType].metersCount}
                    sublocations={providerContent[meterType].locations}
                  />
                )
              ))
              }
              <Divider />
              <ListItem className={classes.listItem} style={{ justifyContent: 'center' }}>
                <Button className={classes.addMeterButton} color="primary" onClick={onNewMeterClick}>ADD NEW METER</Button>
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
            <MenuItem onClick={() => this.onMenuDeleteClick(onDeleteClick, id)}>
              <ListItemIcon style={{ color: '#c13829' }}>
                <Delete />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primaryTypographyProps={{ style: { color: '#c13829' } }} primary="Delete" />
            </MenuItem>
          </Menu>
        </Card>
      </div>
    );
  }
}

Provider.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.object.isRequired,
  meters: PropTypes.object.isRequired,
  locations: PropTypes.object.isRequired,

  onNewMeterClick: PropTypes.func,
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
};

Provider.defaultProps = {
  onNewMeterClick: () => {},
  onEditClick: () => {},
  onDeleteClick: () => {},
};

export default compose(withStyles(styles))(Provider);
