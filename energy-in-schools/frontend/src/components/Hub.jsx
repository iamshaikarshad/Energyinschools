import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TextTruncate from 'react-text-truncate';

import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import Menu from '@material-ui/core/Menu';
import Edit from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import Delete from '@material-ui/icons/Delete';
import Help from '@material-ui/icons/Help';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import MoreVert from '@material-ui/icons/MoreVert';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import ContentCopy from '@material-ui/icons/FilterNone';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import copyClick from '../utils/copyClick';
import * as hubsActions from '../actions/hubsActions';
import { HUB_TYPE_DETAILS, HUB_TYPES } from '../constants/hubConstants';

const styles = theme => ({
  cardRoot: {
    marginTop: theme.spacing(3),
    width: 260,
    minHeight: 230,
    padding: 0,
    borderRadius: '10px',
    margin: 'auto',
  },
  cardHeaderRoot: {
    color: 'white',
    padding: '8px 12px',
  },
  cardHeaderTitle: {
    color: 'white',
  },
  cardHeaderSubheader: {
    color: 'white',
    fontSize: '0.78rem',
  },
  cardHeaderAvatar: {
    marginRight: 12,
  },
  cardContentRoot: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    padding: '4px 12px',
  },
  downloadHexButton: {
    fontSize: 14,
    fontWeight: 500,
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
  tooltip: {
    backgroundColor: '#bc1142',
    borderRadius: '10px',
    pointerEvents: 'none',
    fontSize: 14,
    marginTop: 15,
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
      borderColor: '#bc1142 transparent transparent transparent',
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
      wordBreak: 'break-all',
      whiteSpace: 'normal',
    },
  },
};

const MAX_HUB_NAME_LENGTH_NO_CUT = 20;

class Hub extends React.Component {
  state = {
    anchorEl: null,
  };

  onCopyClick = (textToCopy) => {
    const { showMessageBar } = this.props;
    copyClick(textToCopy, 'Copied hub ID', showMessageBar);
  };

  onMenuEditClick = () => {
    const { onEditClick } = this.props;
    this.setState({ anchorEl: null });
    onEditClick();
  };

  onMenuDeleteClick = () => {
    const { onDeleteClick } = this.props;
    this.setState({ anchorEl: null });
    onDeleteClick();
  };

  handleMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  downloadHex = () => {
    const { actions, id } = this.props;

    actions.getHubHex(id);
  };

  render() {
    const {
      classes,
      name,
      uid,
      description,
      createdAt,
      type,
    } = this.props;

    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const hubDetails = HUB_TYPE_DETAILS[type];

    return (
      <div>
        <Card raised classes={{ root: classes.cardRoot }}>
          <CardHeader
            style={{ backgroundColor: '#bc1142' }}
            classes={{
              root: classes.cardHeaderRoot,
              title: classes.cardHeaderTitle,
              subheader: classes.cardHeaderSubheader,
              avatar: classes.cardHeaderAvatar,
            }}
            avatar={
              <img src={hubDetails.icon} alt="Hub logo" style={{ width: 30, height: 38 }} />
            }
            action={(
              <IconButton className={classes.iconButton} onClick={this.handleMenu}>
                <MoreVert />
              </IconButton>
            )}
            title={name.length > MAX_HUB_NAME_LENGTH_NO_CUT ? (
              <Tooltip
                title={name}
                placement="top"
                classes={{ tooltip: classes.tooltip }}
                interactive // it allows to select text in tooltip (tooltip doesn't disappear on it's node click)
                disableFocusListener
                disableTouchListener
              >
                <Typography style={{ maxWidth: 160, color: 'rgb(255, 255, 255)' }} variant="body2" noWrap>{name}</Typography>
              </Tooltip>
            ) : (
              name
            )}
            subheader={(
              <span>
                Created: {moment(createdAt).format('D MMM YYYY')}
              </span>
            )}
          />
          <CardContent
            classes={{ root: classes.cardContentRoot }}
          >
            <List disablePadding>
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondary={uid}
                  primary="Hub ID"
                  style={{ paddingRight: '80px' }}
                />
                <ListItemSecondaryAction>
                  <IconButton className={classes.iconButton} onClick={() => this.onCopyClick(uid)}>
                    <ContentCopy />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem className={classes.listItem}>
                <ListItemText
                  {...listItemTextProps}
                  secondary={hubDetails.label}
                  primary="Type"
                />
              </ListItem>
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
                  primary="Description"
                />
              </ListItem>
              <Divider />
              <ListItem className={classes.listItem} style={{ justifyContent: 'center' }}>
                <Button className={classes.downloadHexButton} color="primary" onClick={this.downloadHex}>
                  DOWNLOAD HEX
                </Button>
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
            <MenuItem component={Link} to={hubDetails.manualLink}>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primary="Setup guide" />
            </MenuItem>
            <MenuItem onClick={this.onMenuEditClick}>
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              <ListItemText style={{ paddingLeft: 0 }} primary="Edit" />
            </MenuItem>
            <MenuItem onClick={this.onMenuDeleteClick}>
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

Hub.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  uid: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(HUB_TYPES)).isRequired,
  description: PropTypes.string,
  createdAt: PropTypes.string,

  showMessageBar: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,

  actions: PropTypes.object.isRequired,
};

Hub.defaultProps = {
  description: '',
  createdAt: moment().format('MMMM Do YYYY, h:mm a'),
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...hubsActions,
    }, dispatch),
  };
}

export default compose(connect(null, mapDispatchToProps), withStyles(styles))(Hub);
