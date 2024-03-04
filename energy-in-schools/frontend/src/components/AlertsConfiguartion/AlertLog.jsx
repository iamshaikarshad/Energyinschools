import React from 'react';
import { compose } from 'redux';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import {
  ENERGY_ALERTS_TYPE,
  NOTIFICATION_TYPES,
} from './constants';
import electricityAvatar from '../../images/electricity_usage.svg';
import gasAvatar from '../../images/gas_usage.svg';
import temperatureAvatar from '../../images/temperature_alert.svg';

import LimitWidget from './widgets/LimitWidget';
import LocationWidget from './widgets/LocationWidget';
import DifferencePercentageWidget from './widgets/DifferencePercentageWidget';
import UsageLevelWidget from './widgets/UsageLevelWidget';
import EnergyMeterWidget from './widgets/EnergyMeterWidget';
import LimitConditionWidget from './widgets/LimitConditionWidget';

import SMSIcon from './icons/SMSIcon';
import MailIcon from './icons/MailIcon';


const styles = theme => ({
  root: {
    padding: theme.spacing(3),
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 7px 0 rgba(0, 0, 0, 0.16);',
    marginBottom: 15,
  },
  avatar: {
    display: 'inline-flex',
    height: 55,
    width: 55,
  },
  avatarImage: {
    height: 21,
    width: 'auto',
  },
  alertContentText: {
    margin: '0px 13px 10px 0px',
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.27,
    color: '#4a4a4a',
    fontFamily: 'Roboto',
  },
  icon: {
    position: 'relative',
    bottom: 4,
    fontSize: 25,
    marginRight: 15,
    '&:last-child': {
      marginRight: 0,
    },
  },
  firedAtLabel: {
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#4a4a4a',
  },
});

class AlertLog extends React.Component {
  getIconColorLabel = (alertType) => {
    switch (alertType) {
      case ENERGY_ALERTS_TYPE.electricity_level:
      case ENERGY_ALERTS_TYPE.electricity_daily:
        return {
          label: 'Electricity',
          icon: electricityAvatar,
          color: '#2699fb',
        };
      case ENERGY_ALERTS_TYPE.gas_level:
      case ENERGY_ALERTS_TYPE.gas_daily:
        return {
          label: 'Gas',
          icon: gasAvatar,
          color: '#f38f31',
        };
      case ENERGY_ALERTS_TYPE.temperature_level:
        return {
          label: 'Temperature',
          icon: temperatureAvatar,
          color: '#393939',
        };
      default:
        // eslint-disable-next-line no-console
        console.warn('Unsupported energy type');
        return {
          label: 'Electricity',
          icon: electricityAvatar,
          color: '#2699fb',
        };
    }
  };

  getNotificationIcon = (notificationType) => {
    switch (notificationType) {
      case NOTIFICATION_TYPES.sms:
        return SMSIcon;
      case NOTIFICATION_TYPES.email:
        return MailIcon;
      default:
        // eslint-disable-next-line no-console
        console.warn('Unsupported notification type');
        return MailIcon;
    }
  };

  getUnitAndLabel = (triggerType) => {
    if (triggerType.includes('temperature')) {
      return {
        unit: '°C',
        label: 'level',
      };
    }

    return {
      unit: 'kW',
      label: 'usage',
    };
  };

  renderLogContent = (energyLabel, widgetColor) => {
    const {
      classes, alertLog, alertLocation, alertMeter,
    } = this.props;
    const logUnitLabel = this.getUnitAndLabel(alertLog.trigger_data.type);
    const locationPart = isEmpty(alertMeter) ? (
      <React.Fragment>
        <span className={classes.alertContentText}>in</span>
        <LocationWidget colour={widgetColor} name={alertLocation.name} readOnly />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <span className={classes.alertContentText}>for</span>
        <EnergyMeterWidget colour={widgetColor} name={alertMeter.name} readOnly />
      </React.Fragment>
    );

    if (alertLog.trigger_data.type.includes('usage')) {
      return (
        <React.Fragment>
          <span className={classes.alertContentText}>{energyLabel} usage is more than</span>
          <DifferencePercentageWidget percentage={alertLog.trigger_data.daily_usage.threshold_in_percents} colour={widgetColor} readOnly />
          <span className={classes.alertContentText}>higher than</span>
          <UsageLevelWidget colour={widgetColor} />
          {locationPart}
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <span className={classes.alertContentText}>{energyLabel} {logUnitLabel.label} rises</span>
        <LimitConditionWidget limitCondition={alertLog.trigger_data.value_level.condition} colour={widgetColor} readOnly />
        <LimitWidget limit={alertLog.trigger_data.value_level.argument} colour={widgetColor} units={logUnitLabel.unit} readOnly />
        {locationPart}
      </React.Fragment>
    );
  };

  render() {
    const { classes, alertLog } = this.props;

    const { label, icon, color } = this.getIconColorLabel(alertLog.trigger_data.type);

    return (
      <Grid container className={classes.root}>
        <Grid container>
          <Grid item container alignItems="center" style={{ width: 55, margin: '0px 13px 10px 0px' }}>
            <Avatar
              alt="School"
              src={icon}
              classes={{ root: classes.avatar, img: classes.avatarImage }}
              style={{ backgroundColor: color }}
            />
          </Grid>
          <Grid item container alignItems="center" xs>
            {this.renderLogContent(label, color)}
          </Grid>
          <Grid item xs={2} container>
            <Grid container direction="column" justify="space-between">
              <Grid item container justify="flex-end">
                {alertLog.trigger_data.notifications.map((notification) => {
                  const Icon = this.getNotificationIcon(notification.type);
                  return (
                    <Icon className={classes.icon} key={notification.type} colour="#b5b5b5" />
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container justify="flex-end" className={classes.firedAtLabel}>
          {moment(alertLog.event_time).format('D MMM, YYYY h:mm A')}
        </Grid>
      </Grid>
    );
  }
}

AlertLog.propTypes = {
  classes: PropTypes.object.isRequired,
  alertLog: PropTypes.object.isRequired,
  alertMeter: PropTypes.object,
  alertLocation: PropTypes.object,
};

AlertLog.defaultProps = {
  alertMeter: {},
  alertLocation: {},
};

export default compose(withStyles(styles))(AlertLog);
