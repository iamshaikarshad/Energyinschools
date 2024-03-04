import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';

import meterAvatar from '../../../images/meter_ltl.svg';

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
    width: 20,
    height: 'auto',
  },
};

const UsageLevelWidget = ({ classes, colour }) => (
  <CardHeader
    classes={{
      root: classes.root,
      title: classes.widgetHeader,
      subheader: classes.widgetSubHeader,
      avatar: classes.avatarWrapper,
    }}
    style={{ backgroundColor: colour }}
    avatar={
      <Avatar alt="Logo" src={meterAvatar} classes={{ root: classes.avatar, img: classes.avatarImage }} />
      }
    title="Usage level"
    subheader="Average"
  />
);

UsageLevelWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  colour: PropTypes.string.isRequired,
};

export default compose(withStyles(styles))(UsageLevelWidget);
