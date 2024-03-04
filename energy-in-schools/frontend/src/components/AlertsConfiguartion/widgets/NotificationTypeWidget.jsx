import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { NOTIFICATION_TYPES } from '../constants';

import SMSIcon from '../icons/SMSIcon';
import MailIcon from '../icons/MailIcon';

const styles = {
  label: {
    fontFamily: 'Roboto',
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: 500,
    lineHeight: 1,
  },
  icon: {
    position: 'relative',
    bottom: 4,
    fontSize: 35,
    marginRight: 5,
  },
};

const NotificationTypeWidget = ({ classes, colour, notificationTypes }) => {
  const getIconLabel = (type, includeLabel = false) => {
    switch (type) {
      case NOTIFICATION_TYPES.sms:
        return {
          Icon: SMSIcon,
          label: includeLabel ? 'SMS' : null,
        };
      case NOTIFICATION_TYPES.email:
        return {
          Icon: MailIcon,
          label: includeLabel ? 'Email' : null,
        };
      default:
        // eslint-disable-next-line no-console
        console.warn('Unsupported notification type');
        return {
          Icon: SMSIcon,
          label: includeLabel ? 'SMS' : null,
        };
    }
  };

  if (!notificationTypes || notificationTypes.length === 0) return <div />;

  if (notificationTypes.length > 1) {
    return (
      <div>
        {notificationTypes.map((type) => {
          const { Icon } = getIconLabel(type, false);
          return (
            <Icon className={classes.icon} key={type} colour={colour} style={{ margin: '0px 5px' }} />
          );
        })}
      </div>
    );
  }

  const { Icon, label } = getIconLabel(notificationTypes[0], true);
  return (
    <Grid container>
      <Icon className={classes.icon} colour={colour} />
      <Typography className={classes.label} style={{ color: colour }}>
        {label}
      </Typography>
    </Grid>
  );
};

NotificationTypeWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  colour: PropTypes.string.isRequired,
  notificationTypes: PropTypes.array.isRequired,
};

export default compose(withStyles(styles))(NotificationTypeWidget);
