import React from 'react';
import moment from 'moment';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import TextTruncate from 'react-text-truncate';

import { isNil } from 'lodash';

import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Menu from '@material-ui/core/Menu';
import Edit from '@material-ui/icons/Edit';
import Flag from '@material-ui/icons/Flag';
import Delete from '@material-ui/icons/Delete';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVert from '@material-ui/icons/MoreVert';
import CardHeader from '@material-ui/core/CardHeader';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CardContent from '@material-ui/core/CardContent';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import floorPlanIcon from '../images/floor-plan.svg';

import getAddressDisplayValue from '../utils/getAddressDisplayValue';

import { ADDRESS_FIELD } from './SchoolRegistration/constants';

import { GOOGLE_MAPS_API_LINK } from '../constants/config';

import sublocationIcon from '../images/sublocation.svg';

const ADDRESS_FIELDS_TO_DISPLAY = [ADDRESS_FIELD.line_1, ADDRESS_FIELD.line_2, ADDRESS_FIELD.city];

const styles = theme => ({
  cardRoot: {
    marginTop: theme.spacing(3),
    width: 500,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
    [theme.breakpoints.down('xs')]: {
      width: 'auto',
    },
  },
  cardHeaderRoot: {
    color: 'white',
    padding: theme.spacing(1, 2),
  },
  cardHeaderTitle: {
    color: 'white',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: theme.spacing(1),
    },
  },
  listItem: {
    padding: theme.spacing(1, 2),
  },
  iconButton: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: 0,
  },
  button: {
    margin: theme.spacing(1),
  },
  linkButton: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
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

class Sublocation extends React.Component {
  state = {
    anchorEl: null,
  };

  onMenuEditClick = (onEdit, locationID) => {
    this.setState({ anchorEl: null });
    onEdit(locationID);
  };

  onMenuDeleteClick = (onDelete, locationID) => {
    this.setState({ anchorEl: null });
    onDelete(locationID);
  };

  handleMapLinkClick = address => () => {
    window.open(encodeURI(`${GOOGLE_MAPS_API_LINK}${address}`), '_blank');
  }

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const {
      classes, name, id, onEditClick, onDeleteClick, description, address, countersNumber, createdAt,
    } = this.props;

    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    const addressDisplayValue = getAddressDisplayValue(address, ADDRESS_FIELDS_TO_DISPLAY);

    return (
      <div>
        <Card raised classes={{ root: classes.cardRoot }}>
          <CardHeader
            style={{ backgroundColor: '#3c3c3c' }}
            classes={{ root: classes.cardHeaderRoot, title: classes.cardHeaderTitle, subheader: classes.cardHeaderTitle }}
            avatar={
              <img src={sublocationIcon} alt="Sublocation icon" style={{ width: 42, height: 38 }} />
            }
            action={(
              <IconButton className={classes.iconButton} onClick={this.handleMenu}>
                <MoreVert style={{ color: 'white' }} />
              </IconButton>
            )}
            title={name}
            subheader={moment(createdAt).format('D MMM, YYYY h:mm A')}
          />
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <Grid container direction="row">
              <Grid item xs={6}>
                <ListItem className={classes.listItem}>
                  <ListItemText
                    {...listItemTextProps}
                    secondaryTypographyProps={{
                      color: 'initial',
                      style: {
                        color: '#00bcd4',
                        fontSize: '16px',
                      },
                    }}
                    secondary={countersNumber}
                    primary="Number of counters"
                  />
                </ListItem>
                <ListItem className={classes.listItem}>
                  <ListItemText
                    {...listItemTextProps}
                    secondary={addressDisplayValue}
                    primary="Location (address)"
                  />
                </ListItem>
                {!isNil(address) && (
                  <ListItem className={classes.listItem} button onClick={this.handleMapLinkClick(addressDisplayValue)}>
                    <ListItemIcon style={{ color: '#00bcd4', margin: 0, minWidth: 0 }}>
                      <Flag />
                    </ListItemIcon>
                    <ListItemText
                      secondary="See on map"
                      secondaryTypographyProps={{ style: { color: '#00bcd4' } }}
                      style={{ padding: '0px 5px' }}
                    />
                  </ListItem>
                )}
              </Grid>
              <Grid item xs={6} container direction="column" justify="space-between">
                <ListItem className={classes.listItem}>
                  <ListItemText
                    primaryTypographyProps={listItemTextProps.primaryTypographyProps}
                    secondaryTypographyProps={{
                      ...listItemTextProps.secondaryTypographyProps,
                      component: 'div',
                    }}
                    secondary={(
                      <TextTruncate line={7} element="span" text={description} />
                    )}
                    primary="Description"
                  />
                </ListItem>
                <ListItem
                  className={classes.listItem}
                  classes={{ root: classes.linkButton }}
                  component={Link}
                  to={{
                    pathname: '/floors-maps',
                    search: `?locationId=${id}`,
                  }}
                >
                  <ListItemIcon style={{ color: '#00bcd4', margin: 0, minWidth: 0 }}>
                    <img src={floorPlanIcon} alt="floor_plan" style={{ height: 24 }} />
                  </ListItemIcon>
                  <ListItemText
                    secondary="Floor map"
                    secondaryTypographyProps={{ style: { color: '#00bcd4' } }}
                    style={{ padding: '0px 8px' }}
                  />
                </ListItem>
              </Grid>
            </Grid>
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

Sublocation.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  description: PropTypes.string,
  address: PropTypes.object,
  countersNumber: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,

  onEditClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
};

Sublocation.defaultProps = {
  address: null,
  description: '',
};

export default compose(withStyles(styles))(Sublocation);
