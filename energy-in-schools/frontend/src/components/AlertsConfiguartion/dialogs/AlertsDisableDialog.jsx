import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles/index';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';

import notificationBell from '../../../images/notification-bell.svg';
import { ENERGY_ALERTS_TYPE } from '../constants';
import RootDialog from '../../dialogs/RootDialog';

const styles = theme => ({
  dialogContent: {
    width: 500,
    padding: 24,
    [theme.breakpoints.down('xs')]: {
      maxWidth: 300,
      padding: 10,
    },
  },
  activeAppletsLabel: {
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.25,
    color: '#4a4a4a',
    fontFamily: 'Roboto',
  },
  avatar: {
    margin: '0px 5px',
    display: 'inline-flex',
    height: 40,
    width: 40,
  },
  avatarImage: {
    position: 'relative',
    left: 1,
    width: 20,
    height: 'auto',
  },
});

const AlertsDisableDialog = ({
  classes, isOpened, onClose, alertTypes, onSubmit,
}) => {
  const typeToColor = {
    [ENERGY_ALERTS_TYPE.electricity_daily]: '#2699fb',
    [ENERGY_ALERTS_TYPE.electricity_level]: '#2699fb',
    [ENERGY_ALERTS_TYPE.gas_daily]: '#f38f31',
    [ENERGY_ALERTS_TYPE.gas_level]: '#f38f31',
    [ENERGY_ALERTS_TYPE.temperature_level]: '#393939',
  };
  return (
    <RootDialog
      isOpened={isOpened}
      onClose={onClose}
      title="Are you sure you want to disable all alert applets?"
      onSubmit={onSubmit}
      submitLabel="Disable"
      classes={{ dialogContent: classes.dialogContent }}
    >
      <Grid container alignItems="center" justify="center" spacing={2}>
        <Grid item className={classes.activeAppletsLabel}>
          {alertTypes.length}
        </Grid>
        <Grid item>
          {alertTypes.map((type, idx) => (
            <Avatar
              component="span"
              key={`type_${idx}`} // eslint-disable-line react/no-array-index-key
              alt="Bell"
              src={notificationBell}
              classes={{ root: classes.avatar, img: classes.avatarImage }}
              style={{ backgroundColor: typeToColor[type] }}
            />
          ))}
        </Grid>
      </Grid>
    </RootDialog>
  );
};

AlertsDisableDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  alertTypes: PropTypes.array.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(AlertsDisableDialog);
