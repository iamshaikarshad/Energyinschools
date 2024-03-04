import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Settings from '@material-ui/icons/Settings';

import placeAvatar from '../../../images/place.svg';

const styles = {
  root: {
    display: 'inline-flex',
    padding: '8px 24px 8px 8px',
    borderRadius: 36,
    margin: '0px 13px 10px 0px',
    height: 55,
  },
  widgetSubHeader: {
    fontSize: '15px',
    color: '#fff',
    lineHeight: 1.33,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: 180,
  },
  widgetHeader: {
    color: '#fff',
    fontSize: '10px',
    lineHeight: 1.1,
    letterSpacing: '0.2px',
  },
  avatarWrapper: {
    marginRight: 4,
  },
  avatar: {
    borderRadius: 0,
    height: 30,
    width: 30,
  },
  avatarImage: {
    width: 15,
    height: 'auto',
  },
  actionWrapper: {
    marginTop: 3,
    marginRight: -10,
    marginLeft: 5,
  },
  actionIcon: {
    color: '#fff',
  },
  iconSettings: {
    position: 'absolute',
  },
};

const LocationWidget = ({
  classes, colour, readOnly, name, onEditClick,
}) => (
  <CardHeader
    classes={{
      root: classes.root,
      title: classes.widgetHeader,
      subheader: classes.widgetSubHeader,
      avatar: classes.avatarWrapper,
      action: classes.actionWrapper,
    }}
    style={{ backgroundColor: colour }}
    avatar={
      <Avatar alt="Logo" src={placeAvatar} classes={{ root: classes.avatar, img: classes.avatarImage }} />
      }
    title="Location"
    subheader={name}
    action={
      !readOnly && (
      <IconButton style={{ height: 24, width: 24 }} classes={{ label: classes.actionIcon }} onClick={onEditClick}>
        <Settings className={classes.iconSettings} />
      </IconButton>
      )
    }
  />
);

LocationWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  colour: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  onEditClick: PropTypes.func,
};

LocationWidget.defaultProps = {
  readOnly: true,
  onEditClick: () => {},
};

export default compose(withStyles(styles))(LocationWidget);
