import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';

import notificationBell from '../../images/notification-bell.svg';
import { ENERGY_ALERTS_TYPE } from './constants';

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
    height: 100,
    boxShadow: '0 2px 7px 0 rgba(0, 0, 0, 0.16);',
    padding: theme.spacing(2, 3),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
    [theme.breakpoints.down('xs')]: {
      padding: '32px 16px 16px',
    },
  },
  headerRoot: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
      flexWrap: 'wrap',
    },
  },
  subheader: {
    fontSize: '13px',
    color: theme.palette.primary.main,
  },
  title: {
    color: theme.palette.primary.main,
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
    color: theme.palette.text.disabled,
  },
  switchLabel: {
    fontSize: 16,
    lineHeight: 1.19,
    color: '#3c3c3c',
  },
  activeAppletsLabel: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.25,
    color: '#4a4a4a',
  },
  alertsContainer: {
    position: 'relative',
    top: -5,
    height: 48,
    overflow: 'hidden',
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
  formControlRoot: {
    [theme.breakpoints.down('xs')]: {
      marginTop: 5,
    },
  },
});

const AlertsStatusHeader = ({ classes, activeAlertTypes, onDisableSwitch }) => {
  const typeToColor = {
    [ENERGY_ALERTS_TYPE.electricity_daily]: '#2699fb',
    [ENERGY_ALERTS_TYPE.electricity_level]: '#2699fb',
    [ENERGY_ALERTS_TYPE.gas_daily]: '#f38f31',
    [ENERGY_ALERTS_TYPE.gas_level]: '#f38f31',
    [ENERGY_ALERTS_TYPE.temperature_level]: '#393939',
  };
  const renderTitle = () => {
    if (activeAlertTypes.length) {
      return (
        <Grid container alignItems="center" spacing={2}>
          <Grid item className={classes.activeAppletsLabel}>
            {activeAlertTypes.length} active app alerts
          </Grid>
          <Grid item xs className={classes.alertsContainer}>
            {activeAlertTypes.map((type, idx) => (
              <Avatar
                component="span"
                key={`type_${idx}`} // eslint-disable-line react/no-array-index-key
                alt="Bell"
                src={notificationBell}
                classes={{ root: classes.avatar, img: classes.avatarImage }}
                style={{ backgroundColor: typeToColor[type], float: 'left' }}
              />
            ))}
          </Grid>
        </Grid>
      );
    }
    return (
      <div className={classes.activeAppletsLabel}>
        All alert applets are disabled
      </div>
    );
  };

  return (

    <Card className={classes.root}>
      <CardHeader
        action={(
          <div>
            <FormControlLabel
              control={(
                <Switch
                  disabled={activeAlertTypes.length === 0}
                  checked={activeAlertTypes.length === 0}
                  onChange={onDisableSwitch}
                  color="default"
                />
              )}
              label="Disable all alerts"
              classes={{ label: classes.switchLabel, root: classes.formControlRoot }}
            />
          </div>
        )}
        title={renderTitle()}
        classes={{ root: classes.headerRoot, subheader: classes.subheader }}
      />
    </Card>
  );
};

AlertsStatusHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  activeAlertTypes: PropTypes.array.isRequired,
  onDisableSwitch: PropTypes.func.isRequired,
};

export default compose(withStyles(styles))(AlertsStatusHeader);
